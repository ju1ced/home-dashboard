import { createCameraConfig, createDefaultConfig } from "../config/defaults";
import { migrateConfig } from "../config/migrate";
import { parseImportedConfig, serializeConfig } from "../config/compiler";
import type { ActionConfig, HomeDashboardConfigV1, PersonConfig, RoomConfig, ValidationIssue } from "../config/types";
import { validateConfig } from "../config/validate";
import { validateConfigSchema } from "../config/schema-validator";
import { FIELD_DEFINITIONS, type FieldDefinition } from "./fields";
import { bindSpecialistEvents, renderSpecialists } from "./sections/specialists";
import { renderActions } from "./sections/actions";
import { renderPersons } from "./sections/persons";
import { renderCameras, renderSecurityGuidance } from "./sections/cameras";
import { addRoomNestedItem, bindRoomEvents, moveRoomControlDraft, removeRoomNestedItem, renderRooms, updateRoomNestedItem, type RoomNestedCollection } from "./sections/rooms";
import { EDITOR_SECTION_KEYS, escapeHtml, getEditorItemToken, getEditorSectionForKey, mergeEditorIssues, renderSelector, SECTION_TITLES } from "./shared";

export { EDITOR_SECTION_KEYS, getEditorItemToken, getEditorSectionForKey, mergeEditorIssues } from "./shared";

interface HomeAssistantLike {
  states: Record<string, unknown>;
}

type MutableRecord = Record<string, unknown>;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, segment) => {
    if (typeof value !== "object" || value === null) return undefined;
    return (value as MutableRecord)[segment];
  }, source);
}

function setPath(config: HomeDashboardConfigV1, path: string, value: unknown): void {
  const segments = path.split(".");
  const last = segments.pop();
  if (!last) return;
  let target = config as unknown as MutableRecord;
  for (const segment of segments) target = target[segment] as MutableRecord;
  target[last] = value;
}

function deletePath(config: HomeDashboardConfigV1, path: string): void {
  const segments = path.split(".");
  const last = segments.pop();
  if (!last) return;
  let target = config as unknown as MutableRecord;
  for (const segment of segments) target = target[segment] as MutableRecord;
  delete target[last];
}

function selectorMarkup(field: FieldDefinition, value: unknown): string {
  return `<ha-selector class="selector" data-path="${escapeHtml(field.path)}" data-value="${escapeHtml(JSON.stringify(value))}"></ha-selector>`;
}

function renderField(field: FieldDefinition, config: HomeDashboardConfigV1): string {
  const value = getPath(config, field.path);
  let control = "";
  if (field.kind === "entity" || field.kind === "entities") {
    control = selectorMarkup(field, value);
  } else if (field.kind === "checkbox") {
    control = `<input data-path="${escapeHtml(field.path)}" type="checkbox" ${value ? "checked" : ""}>`;
  } else if (field.kind === "select") {
    control = `<select data-path="${escapeHtml(field.path)}">${(field.options ?? []).map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(field.optionLabels?.[option] ?? option)}</option>`).join("")}</select>`;
  } else {
    control = `<input data-path="${escapeHtml(field.path)}" type="${field.kind}" value="${escapeHtml(value)}">`;
  }
  return `<label class="field"><span><strong>${escapeHtml(field.label)}</strong><small>${escapeHtml(field.description)}</small></span>${control}</label>`;
}


function renderViewOrder(config: HomeDashboardConfigV1): string {
  return `<div class="order" aria-label="Viewvolgorde">${config.layout.view_order.map((path, index) => `<div><span>${escapeHtml(path)}</span><span><button type="button" aria-label="Verplaats ${escapeHtml(path)} omhoog" data-view-move="up" data-index="${index}" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" aria-label="Verplaats ${escapeHtml(path)} omlaag" data-view-move="down" data-index="${index}" ${index === config.layout.view_order.length - 1 ? "disabled" : ""}>↓</button></span></div>`).join("")}</div>`;
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

export class HomeDashboardStrategyEditor extends HTMLElementBase {
  private _hass?: HomeAssistantLike;
  private _config: HomeDashboardConfigV1 = createDefaultConfig();
  private message = "";
  private blocked = false;
  private activeSection = "general";
  private expandedItems = new Set<string>();
  private focusActiveSection = false;
  private roomSearchQuery = "";

  public get configBlocked(): boolean {
    return this.blocked;
  }

  public set hass(value: HomeAssistantLike) {
    this._hass = value;
    this.configureSelectors();
  }

  public setConfig(input: unknown): void {
    try {
      const migrated = migrateConfig(input);
      this._config = migrated.config;
      this.blocked = false;
      this.message = migrated.warnings.join(" ");
    } catch (error) {
      this.blocked = true;
      this.message = `Configuratie geblokkeerd: ${error instanceof Error ? error.message : String(error)} Importeer een compatibele privé-back-up; deze editor schrijft niets terug.`;
    }
    this.render();
  }

  public connectedCallback(): void {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.render();
  }

  private updateCollection(collection: string, index: number, field: string, value: unknown): void {
    const path = collection.split(".");
    let target: unknown = this._config;
    for (const segment of path) target = (target as MutableRecord)[segment];
    const item = (target as MutableRecord[])[index];
    if (item) {
      const previousToken = getEditorItemToken(collection, item, index);
      const segments = field.split(".");
      const last = segments.pop();
      let fieldTarget = item;
      for (const segment of segments) fieldTarget = fieldTarget[segment] as MutableRecord;
      // A cleared media/image selector emits null/undefined; writing that literal into the config would
      // leave e.g. image_upload present-but-null, which the schema validator correctly rejects for an
      // object-typed field (and is otherwise indistinguishable from "configured with garbage"). Delete the
      // key instead so an unconfigured optional field stays truly absent, matching migrate.ts's contract.
      if (last) { if (value === null || value === undefined) delete fieldTarget[last]; else fieldTarget[last] = value; }
      if (field === "key" && this.expandedItems.delete(previousToken)) this.expandedItems.add(getEditorItemToken(collection, item, index));
    }
    this.commit();
  }

  private commit(): void {
    if (this.blocked) {
      this.message = "Configuratie blijft geblokkeerd; er wordt geen v1-configuratie teruggeschreven.";
      this.render();
      return;
    }
    const errors = [...validateConfigSchema(this._config), ...validateConfig(this._config)].filter((candidate) => candidate.severity === "error");
    if (errors.length === 0) {
      this.dispatchEvent(new CustomEvent("config-changed", { bubbles: true, composed: true, detail: { config: clone(this._config) } }));
      this.message = "Configuratie is geldig.";
    } else {
      this.message = "Ongeldige tussenstand wordt nog niet opgeslagen.";
    }
    this.render();
  }

  private addItem(collection: string): void {
    if (collection === "persons") {
      const person: PersonConfig = { key: `person_${this._config.persons.length + 1}`, entity: "", label: "", show_location: true, zone_entities: [], freshness_minutes: 30, battery_entities: [] };
      this._config.persons.push(person);
      this.expandedItems.add(getEditorItemToken(collection, person, this._config.persons.length - 1));
    } else if (collection === "security.cameras") {
      const camera = createCameraConfig(this._config.security.cameras.length);
      this._config.security.cameras.push(camera);
      this.expandedItems.add(getEditorItemToken(collection, camera, this._config.security.cameras.length - 1));
    } else if (collection === "rooms") {
      const room: RoomConfig = {
        key: `room_${this._config.rooms.length + 1}`, name: "", icon: "mdi:sofa", floor_id: "", area_id: "", device_ids: [], capabilities: [], quick_actions: [],
        control_entities: [],
        light_entities: [], light_switch_entities: [], light_groups: [], cover_entities: [], cover_controls: [], media_entities: [], safety_entities: [], camera_entities: [], power_entities: [], history_entities: [],
        image_entity: "", temperature_history_entity: "", smart_plugs: [], room_energy: { power_entity: "", day_entity: "", month_entity: "", year_entity: "" },
        hvac: { entity: "", comfort_entities: [], history_entities: [], modes: [], presets: [], fan_modes: [], swing_modes: [] }
      };
      this._config.rooms.push(room);
      this.expandedItems.add(getEditorItemToken(collection, room, this._config.rooms.length - 1));
    } else if (collection === "actions") {
      const action: ActionConfig = { key: `action_${this._config.actions.length + 1}`, label: "", sequence: [], risk: "safe", confirmation_text: "", hold_required: false, verification_entity: "" };
      this._config.actions.push(action);
      this.expandedItems.add(getEditorItemToken(collection, action, this._config.actions.length - 1));
    }
    this.commit();
  }

  private removeItem(collection: string, index: number): void {
    let target: unknown = this._config;
    for (const segment of collection.split(".")) target = (target as MutableRecord)[segment];
    (target as unknown[]).splice(index, 1);
    this.commit();
  }

  private moveItem(items: unknown[], index: number, direction: "up" | "down"): void {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    this.commit();
  }

  // Thin wrappers delegating to ./sections/rooms: the editor's own DOM event wiring calls those
  // functions directly via bindRoomEvents(), but these three + moveRoomControlDraft below are kept
  // as methods too, since they are also exercised directly (bypassing the DOM) by editor-behavior.test.mjs.
  private addRoomNestedItem(roomIndex: number, collection: RoomNestedCollection): void {
    addRoomNestedItem(this._config, roomIndex, collection);
    this.commit();
  }

  private updateRoomNestedItem(roomIndex: number, collection: RoomNestedCollection, itemIndex: number, field: string, value: unknown): void {
    updateRoomNestedItem(this._config, roomIndex, collection, itemIndex, field, value);
    this.commit();
  }

  private removeRoomNestedItem(roomIndex: number, collection: RoomNestedCollection, itemIndex: number): void {
    removeRoomNestedItem(this._config, roomIndex, collection, itemIndex);
    this.commit();
  }

  private moveRoomControlDraft(roomIndex: number, index: number, direction: "up" | "down"): void {
    if (!this.shadowRoot) return;
    moveRoomControlDraft(this.shadowRoot, this._config, roomIndex, index, direction);
  }

  private configureSelectors(): void {
    if (!this.shadowRoot) return;
    this.shadowRoot.querySelectorAll<HTMLElement & { hass: HomeAssistantLike | undefined; selector?: Record<string, unknown>; value?: unknown; required?: boolean }>("ha-selector").forEach((element) => {
      element.hass = this._hass;
      const path = element.dataset.path;
      const field = path ? FIELD_DEFINITIONS.find((candidate) => candidate.path === path) : undefined;
      const encodedSelector = element.dataset.selector;
      element.selector = field?.selector ?? (encodedSelector ? JSON.parse(encodedSelector) as Record<string, unknown> : { entity: {} });
      element.value = JSON.parse(element.dataset.value ?? "null") as unknown;
      element.required = false;
    });
  }

  private bindEvents(): void {
    if (!this.shadowRoot) return;
    this.shadowRoot.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input[data-path],select[data-path]").forEach((element) => {
      element.addEventListener("change", () => {
        const path = element.dataset.path;
        if (!path) return;
        let value: unknown = element.value;
        if (element instanceof HTMLInputElement && element.type === "checkbox") value = element.checked;
        if (element instanceof HTMLInputElement && element.type === "number") value = Number(element.value);
        if (path.endsWith("_period") && value === "") deletePath(this._config, path);
        else setPath(this._config, path, value);
        this.commit();
      });
    });
    this.shadowRoot.querySelectorAll<HTMLElement>("ha-selector").forEach((element) => {
      element.addEventListener("value-changed", (event) => {
        const value = (event as CustomEvent<{ value: unknown }>).detail.value;
        const path = element.dataset.path;
        if (path) {
          setPath(this._config, path, value);
          this.commit();
        } else if (element.dataset.roomNestedCollection) {
          this.updateRoomNestedItem(Number(element.dataset.roomIndex), element.dataset.roomNestedCollection as RoomNestedCollection, Number(element.dataset.itemIndex), element.dataset.field ?? "", value);
        } else {
          this.updateCollection(element.dataset.collection ?? "", Number(element.dataset.index), element.dataset.field ?? "", value);
        }
      });
    });
    this.shadowRoot.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-collection]").forEach((element) => {
      if (element.tagName.toLowerCase() === "ha-selector") return;
      element.addEventListener("change", () => {
        let value: unknown = element.value;
        if (element instanceof HTMLInputElement && element.type === "checkbox") value = element.checked;
        if (element instanceof HTMLInputElement && element.type === "number") value = Number(element.value);
        if (element instanceof HTMLSelectElement && element.multiple) value = Array.from(element.selectedOptions, (option) => option.value);
        if (element.dataset.field?.startsWith("hvac.") && typeof value === "string") value = value.split(",").map((item) => item.trim()).filter(Boolean);
        this.updateCollection(element.dataset.collection ?? "", Number(element.dataset.index), element.dataset.field ?? "", value);
      });
    });
    this.shadowRoot.querySelectorAll<HTMLButtonElement>("[data-add]").forEach((controlButton) => controlButton.addEventListener("click", () => this.addItem(controlButton.dataset.add ?? "")));
    this.shadowRoot.querySelectorAll<HTMLButtonElement>("[data-remove]").forEach((controlButton) => controlButton.addEventListener("click", () => this.removeItem(controlButton.dataset.remove ?? "", Number(controlButton.dataset.index))));
    bindRoomEvents(this.shadowRoot, this._config, { commit: () => this.commit(), moveItem: (items, index, direction) => this.moveItem(items, index, direction) });
    this.shadowRoot.querySelectorAll<HTMLButtonElement>("[data-view-move]").forEach((controlButton) => controlButton.addEventListener("click", () => this.moveItem(this._config.layout.view_order, Number(controlButton.dataset.index), controlButton.dataset.viewMove as "up" | "down")));
    this.shadowRoot.querySelectorAll<HTMLDetailsElement>("details[data-item-token]").forEach((details) => {
      const token = details.dataset.itemToken;
      if (!token) return;
      details.addEventListener("toggle", () => {
        // A <details open> parsed via innerHTML queues its own toggle event, so without this guard
        // the handler below would re-render, which re-parses the same "open" markup, which queues
        // another toggle -- an infinite loop. Bail out whenever the open state actually matches
        // what expandedItems already records.
        const wasExpanded = this.expandedItems.has(token);
        if (details.open === wasExpanded) return;
        if (details.open) this.expandedItems.add(token); else this.expandedItems.delete(token);
        // Only rooms (HD-216) lazy-mount their fields: opening/closing one needs a re-render to
        // actually (un)mount its <ha-selector>s. Other sections already render fully regardless of
        // open state, so re-rendering on their toggle would just be wasted work.
        if (!token.startsWith("rooms:")) return;
        this.render();
        // The old <summary> is destroyed by render()'s innerHTML rebuild, so the browser drops
        // focus entirely unless we explicitly restore it onto the newly rendered one.
        const escapedToken = typeof CSS !== "undefined" ? CSS.escape(token) : token;
        this.shadowRoot?.querySelector<HTMLElement>(`details[data-item-token="${escapedToken}"] summary`)?.focus();
      });
    });
    this.shadowRoot.querySelector<HTMLInputElement>("#room-search")?.addEventListener("input", (event) => {
      this.roomSearchQuery = (event.target as HTMLInputElement).value;
      const needle = this.roomSearchQuery.trim().toLowerCase();
      this.shadowRoot?.querySelectorAll<HTMLDetailsElement>('details[data-item-token^="rooms:"]').forEach((details) => {
        const name = details.querySelector("summary")?.textContent?.toLowerCase() ?? "";
        details.hidden = needle.length > 0 && !name.includes(needle);
      });
    });
    this.shadowRoot.querySelectorAll<HTMLButtonElement>("[data-section-nav]").forEach((controlButton) => {
      controlButton.addEventListener("click", () => {
        const section = controlButton.dataset.sectionNav;
        if (!section || !EDITOR_SECTION_KEYS.includes(section)) return;
        this.activeSection = section;
        this.render();
      });
      controlButton.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        this.activeSection = getEditorSectionForKey(this.activeSection, event.key);
        this.focusActiveSection = true;
        this.render();
      });
    });
    this.shadowRoot.querySelectorAll<HTMLButtonElement>("[data-section-step]").forEach((controlButton) => controlButton.addEventListener("click", () => {
      const current = EDITOR_SECTION_KEYS.indexOf(this.activeSection);
      const direction = controlButton.dataset.sectionStep === "previous" ? -1 : 1;
      this.activeSection = EDITOR_SECTION_KEYS[Math.max(0, Math.min(EDITOR_SECTION_KEYS.length - 1, current + direction))] ?? "general";
      this.render();
    }));
    this.shadowRoot.querySelectorAll<HTMLButtonElement>("[data-go-section]").forEach((controlButton) => controlButton.addEventListener("click", () => {
      const section = controlButton.dataset.goSection;
      if (!section || !EDITOR_SECTION_KEYS.includes(section)) return;
      this.activeSection = section;
      this.focusActiveSection = true;
      this.render();
    }));
    bindSpecialistEvents(this.shadowRoot, this._config, { commit: () => this.commit(), blockWithMessage: (message) => { this.message = message; this.render(); } });
    this.shadowRoot.querySelector<HTMLButtonElement>("#reset")?.addEventListener("click", () => {
      if (globalThis.confirm?.("Alle configuratie in deze editor terugzetten naar de standaardwaarden?")) {
        this._config = createDefaultConfig();
        this.blocked = false;
        this.commit();
      }
    });
    this.shadowRoot.querySelector<HTMLButtonElement>("#export")?.addEventListener("click", () => this.exportConfig());
    this.shadowRoot.querySelector<HTMLInputElement>("#import")?.addEventListener("change", (event) => void this.importConfig(event));
  }

  private exportConfig(): void {
    const warning = "Deze export kan installatiegegevens en entity-ID's bevatten. Bewaar hem privé en commit hem niet naar Git. Downloaden?";
    if (!globalThis.confirm?.(warning)) return;
    const url = URL.createObjectURL(new Blob([serializeConfig(this._config)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "home-dashboard.local.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private async importConfig(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      this._config = parseImportedConfig(await file.text());
      this.blocked = false;
      this.message = "Import geslaagd. Controleer de configuratie en sla het dashboard op.";
      this.commit();
    } catch (error) {
      this.message = `Import geweigerd: ${error instanceof Error ? error.message : String(error)}`;
      this.render();
    }
  }

  private render(): void {
    if (!this.shadowRoot) return;
    const active = this.shadowRoot.activeElement as HTMLElement | null;
    const focusData = active ? { ...active.dataset, id: active.id } : undefined;
    const issues = mergeEditorIssues(validateConfigSchema(this._config), validateConfig(this._config));
    const summary = `${this._config.rooms.length} kamers · ${this._config.persons.length} personen · ${this._config.security.cameras.length} camera's · ${this._config.actions.length} acties`;
    if (!EDITOR_SECTION_KEYS.includes(this.activeSection)) this.activeSection = "general";
    const sectionIndex = EDITOR_SECTION_KEYS.indexOf(this.activeSection);
    const sectionForIssue = (path: string) => EDITOR_SECTION_KEYS.find((key) => path === key || path.startsWith(`${key}.`) || path.startsWith(`${key}[`)) ?? "general";
    const sectionIssues = issues.filter((candidate) => sectionForIssue(candidate.path) === this.activeSection);
    const sectionBodies: Record<string, { body: string; extra?: string }> = {
      general: { body: "" },
      today: { body: "" },
      persons: { body: `<div class="items">${renderPersons(this._config, this.expandedItems)}</div>`, extra: `<button class="add" type="button" data-add="persons">Persoon toevoegen</button>` },
      security: { body: `${renderSecurityGuidance()}<div class="items">${renderCameras(this._config, this.expandedItems)}</div>`, extra: `<button class="add" type="button" data-add="security.cameras">Camera toevoegen</button>` },
      rooms: { body: `<label>Zoek kamer<input id="room-search" type="search" placeholder="Filter op naam, sleutel of area" value="${escapeHtml(this.roomSearchQuery)}"></label><div class="items">${renderRooms(this._config, this.expandedItems, this.roomSearchQuery)}</div>`, extra: `<button class="add" type="button" data-add="rooms">Kamer toevoegen</button>` },
      energy: { body: "" },
      actions: { body: `<div class="items">${renderActions(this._config, this.expandedItems)}</div>`, extra: `<button class="add" type="button" data-add="actions">Actie toevoegen</button>` },
      specialists: { body: `<div class="items">${renderSpecialists(this._config)}</div>` },
      layout: { body: `<div><strong>Viewvolgorde</strong><small>De vijf stabiele paden blijven aanwezig en kunnen worden herschikt.</small>${renderViewOrder(this._config)}</div>` },
      diagnostics: { body: "" }
    };
    const sectionContent = sectionBodies[this.activeSection] ?? sectionBodies.general!;
    const navigation = EDITOR_SECTION_KEYS.map((key) => {
      const scoped = issues.filter((candidate) => sectionForIssue(candidate.path) === key);
      const errors = scoped.filter((candidate) => candidate.severity === "error").length;
      const warnings = scoped.length - errors;
      const status = errors ? `<span class="nav-state error" aria-label="${errors} fouten">${errors}</span>` : warnings ? `<span class="nav-state warning" aria-label="${warnings} waarschuwingen">${warnings}</span>` : `<span class="nav-state valid" aria-label="Geldig">✓</span>`;
      return `<button type="button" role="tab" id="section-tab-${key}" aria-controls="section-panel" aria-selected="${key === this.activeSection}" tabindex="${key === this.activeSection ? "0" : "-1"}" class="section-tab" data-section-nav="${key}"><span>${SECTION_TITLES[key]}</span>${status}</button>`;
    }).join("");
    const issueSummary = issues.length
      ? `${issues.filter((candidate) => candidate.severity === "error").length} fouten · ${issues.filter((candidate) => candidate.severity === "warning").length} waarschuwingen. De badges tonen waar aandacht nodig is.`
      : "Schema v1 is geldig.";
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,system-ui);--accent:var(--primary-color,#276b5b)}
      *{box-sizing:border-box}header{display:grid;gap:12px;padding:16px;border:1px solid var(--divider-color);border-radius:16px;background:var(--card-background-color)}
      h2,p{margin:0}.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:end}.toolbar label,.toolbar button{min-height:44px;border:1px solid var(--divider-color);border-radius:10px;padding:9px 12px;background:var(--secondary-background-color);color:inherit;cursor:pointer}.toolbar label{display:grid;gap:5px}.toolbar input[type=file]{max-width:240px;padding:4px}
      .editor-layout{display:grid;grid-template-columns:minmax(170px,220px) minmax(0,1fr);gap:12px;margin-top:12px}.section-nav{display:grid;gap:6px;align-self:start;position:sticky;top:8px}.section-tab{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:44px;padding:10px 12px;border:1px solid var(--divider-color);border-radius:10px;background:var(--card-background-color);color:inherit;text-align:left;cursor:pointer}.section-tab[aria-selected=true]{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,var(--card-background-color));font-weight:700}.nav-state{display:grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:var(--secondary-background-color);font-size:.78rem}.nav-state.valid{color:var(--success-color,#27824a)}
      .section-panel{min-width:0;border:1px solid var(--divider-color);border-radius:14px;background:var(--card-background-color);overflow:hidden}.section-heading{padding:16px;border-bottom:1px solid var(--divider-color)}.section-heading h3{margin:0;font-size:1.25rem}.section{display:grid;gap:12px;padding:14px}
      .field,label{display:grid;gap:5px}.field{grid-template-columns:minmax(180px,1fr) minmax(220px,1fr);align-items:center;padding:9px 0;border-top:1px solid var(--divider-color)}small{display:block;color:var(--secondary-text-color);margin-top:3px}
      input,select,textarea{width:100%;min-height:44px;padding:10px;border:1px solid var(--divider-color);border-radius:8px;background:var(--secondary-background-color);color:inherit}textarea{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;resize:vertical}input[type=checkbox]{width:22px;height:22px;min-height:22px}.check{display:flex;align-items:center;min-height:44px;gap:8px}
      .items{display:grid;gap:10px}.item{margin:0;border:1px solid var(--divider-color);border-radius:12px;background:var(--secondary-background-color);overflow:hidden}.item summary{min-height:44px;padding:12px;font-weight:700;cursor:pointer}.item-body{display:grid;gap:10px;padding:0 12px 12px}.item-toolbar{display:flex;justify-content:flex-end;align-items:center;gap:8px}.item-toolbar strong{margin-right:auto}.item-actions,.order-actions{display:flex;gap:8px}.item button{color:var(--error-color);background:transparent;border:0;min-width:44px;min-height:44px;cursor:pointer}.item button[disabled]{opacity:.35;cursor:not-allowed}.nested-collection{display:grid;gap:8px;padding:10px;border:1px solid var(--divider-color);border-radius:10px}.nested-collection h5{margin:0}.nested-item{display:grid;gap:8px;padding:10px;border:1px solid var(--divider-color);border-radius:9px;background:var(--card-background-color)}.nested-item h6{margin:4px 0 -4px;font-size:.78rem;text-transform:uppercase;letter-spacing:.03em;color:var(--secondary-text-color)}.nested-collection>button{justify-self:start;min-height:44px;padding:8px 12px;border:1px solid var(--accent);border-radius:9px;background:var(--card-background-color);color:var(--accent)}.order-actions button{border:1px solid var(--divider-color);border-radius:8px;background:var(--secondary-background-color);color:inherit}.order-actions button:hover:not([disabled]){border-color:var(--accent);color:var(--accent)}code{display:block;overflow-wrap:anywhere;color:var(--secondary-text-color)}
      fieldset.config{border:0;margin:0;padding:0;min-width:0}.config[disabled]{pointer-events:none;opacity:.72}.order{display:grid;gap:6px}.order>div{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:9px;padding:7px 9px;border:1px solid var(--divider-color);border-radius:9px;background:var(--card-background-color)}.order-index{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:color-mix(in srgb,var(--accent) 13%,var(--card-background-color));color:var(--accent);font-weight:750}.order code{min-width:0}.order-save{display:flex;align-items:center;justify-content:space-between;gap:10px}.order-save button{min-height:44px;padding:8px 12px;border:1px solid var(--divider-color);border-radius:9px;background:var(--card-background-color);color:inherit}.order-save button.pending{border-color:var(--accent);background:var(--accent);color:#fff;font-weight:700}.fatal{color:var(--error-color);font-weight:700}
      .add{justify-self:start;min-height:44px;padding:9px 12px;border:0;border-radius:9px;background:var(--accent);color:var(--text-primary-color,#fff);cursor:pointer}.guidance{display:grid;gap:8px;padding:12px;border:1px solid color-mix(in srgb,var(--accent) 35%,var(--divider-color));border-radius:12px;background:color-mix(in srgb,var(--accent) 8%,var(--card-background-color))}.guidance button{justify-self:start;min-height:44px;padding:8px 12px;border:1px solid var(--accent);border-radius:9px;background:var(--card-background-color);color:var(--accent);font-weight:700;cursor:pointer}.issues{margin:0;padding-left:20px}.error{color:var(--error-color)}.warning{color:var(--warning-color,#b26a00)}.section-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;border-top:1px solid var(--divider-color)}.section-footer button{min-height:44px;padding:8px 14px;border:1px solid var(--divider-color);border-radius:9px;background:var(--secondary-background-color);color:inherit}.section-footer button[disabled]{opacity:.45}
      @media(max-width:800px){.editor-layout{grid-template-columns:1fr}.section-nav{display:flex;overflow-x:auto;position:sticky;top:0;z-index:2;padding:6px;background:var(--primary-background-color);scrollbar-width:thin}.section-tab{flex:0 0 auto;width:auto}.field{grid-template-columns:1fr}.section{padding-inline:10px}header{padding:12px}.toolbar{align-items:stretch}.toolbar>*{flex:1 1 180px}}
    </style>
    <header><div><h2>Home Dashboard configuratie</h2><p>${escapeHtml(summary)}</p></div><div class="toolbar"><button id="export" type="button" ${this.blocked ? "disabled" : ""}>Exporteer privé-back-up</button><label>Importeer JSON<input id="import" type="file" accept="application/json"></label><button id="reset" type="button" ${this.blocked ? "disabled" : ""}>Herstel standaard</button></div><p role="status" aria-live="polite" class="${this.blocked ? "fatal" : ""}">${escapeHtml(this.message)}</p>${this.blocked ? "" : `<p>${escapeHtml(issueSummary)}</p>`}</header>
    <fieldset class="config" ${this.blocked ? "disabled" : ""}>
      <div class="editor-layout"><nav class="section-nav" role="tablist" aria-label="Configuratieonderdelen">${navigation}</nav>
      <section class="section-panel" id="section-panel" role="tabpanel" aria-labelledby="section-tab-${this.activeSection}">
        <div class="section-heading"><h3>${SECTION_TITLES[this.activeSection]}</h3><small>Onderdeel ${sectionIndex + 1} van ${EDITOR_SECTION_KEYS.length}</small></div>
        ${sectionIssues.length ? `<div role="alert" class="section"><ul class="issues">${sectionIssues.map((candidate) => `<li class="${candidate.severity}"><strong>${escapeHtml(candidate.path)}</strong>: ${escapeHtml(candidate.message)}</li>`).join("")}</ul></div>` : ""}
        <div class="section">${FIELD_DEFINITIONS.filter((field) => field.section === this.activeSection).map((field) => renderField(field, this._config)).join("")}${sectionContent.body}${sectionContent.extra ?? ""}</div>
        <div class="section-footer"><button type="button" data-section-step="previous" ${sectionIndex === 0 ? "disabled" : ""}>← Vorige</button><span>${sectionIndex + 1} / ${EDITOR_SECTION_KEYS.length}</span><button type="button" data-section-step="next" ${sectionIndex === EDITOR_SECTION_KEYS.length - 1 ? "disabled" : ""}>Volgende →</button></div>
      </section></div>
    </fieldset>`;
    this.configureSelectors();
    this.bindEvents();
    if (this.focusActiveSection) {
      const selected = this.shadowRoot.querySelector<HTMLButtonElement>("[data-section-nav][aria-selected=true]");
      queueMicrotask(() => selected?.focus());
      this.focusActiveSection = false;
    } else if (focusData) {
      const candidates = Array.from(this.shadowRoot.querySelectorAll<HTMLElement>("input,select,button,ha-selector"));
      const target = candidates.find((candidate) => Object.entries(focusData).every(([key, value]) => key === "id" ? !value || candidate.id === value : candidate.dataset[key] === value));
      target?.focus();
    }
  }
}

export function registerHomeDashboardEditor(): void {
  if (typeof customElements === "undefined" || customElements.get("home-dashboard-strategy-editor")) return;
  customElements.define("home-dashboard-strategy-editor", HomeDashboardStrategyEditor);
}
