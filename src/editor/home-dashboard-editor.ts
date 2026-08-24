import { createCameraConfig, createDefaultConfig } from "../config/defaults";
import { migrateConfig } from "../config/migrate";
import { parseImportedConfig, serializeConfig } from "../config/compiler";
import { ROOM_CAPABILITIES, type ActionConfig, type HomeDashboardConfigV1, type PersonConfig, type RoomConfig, type ValidationIssue } from "../config/types";
import { validateConfig } from "../config/validate";
import { validateConfigSchema } from "../config/schema-validator";
import { FIELD_DEFINITIONS, type FieldDefinition } from "./fields";

interface HomeAssistantLike {
  states: Record<string, unknown>;
}

type MutableRecord = Record<string, unknown>;

const SECTION_TITLES: Record<string, string> = {
  general: "Algemeen",
  today: "Vandaag",
  persons: "Personen",
  security: "Security",
  rooms: "Kamers",
  energy: "Energie",
  actions: "Acties",
  specialists: "Kia, robot, tuin en zwembad",
  layout: "Layout",
  diagnostics: "Diagnostiek"
};
export const EDITOR_SECTION_KEYS = Object.keys(SECTION_TITLES);

export function getEditorItemToken(collection: string, item: object, index: number): string {
  const key = (item as { key?: unknown }).key;
  return `${collection}:${typeof key === "string" && key.trim() ? key.trim() : `#${index}`}`;
}

export function getEditorSectionForKey(current: string, key: string): string {
  const currentIndex = Math.max(0, EDITOR_SECTION_KEYS.indexOf(current));
  if (key === "Home") return EDITOR_SECTION_KEYS[0] ?? "general";
  if (key === "End") return EDITOR_SECTION_KEYS.at(-1) ?? "general";
  const direction = ["ArrowLeft", "ArrowUp"].includes(key) ? -1 : ["ArrowRight", "ArrowDown"].includes(key) ? 1 : 0;
  return EDITOR_SECTION_KEYS[(currentIndex + direction + EDITOR_SECTION_KEYS.length) % EDITOR_SECTION_KEYS.length] ?? "general";
}

export function mergeEditorIssues(schemaIssues: ValidationIssue[], semanticIssues: ValidationIssue[]): ValidationIssue[] {
  const usefulSchemaIssues = schemaIssues.filter((schemaIssue) => schemaIssue.code !== "schema_any_of" || !semanticIssues.some((semanticIssue) =>
    semanticIssue.path === schemaIssue.path || semanticIssue.path.startsWith(`${schemaIssue.path}.`) || semanticIssue.path.startsWith(`${schemaIssue.path}[`)
  ));
  return [...usefulSchemaIssues, ...semanticIssues];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
    control = `<select data-path="${escapeHtml(field.path)}">${(field.options ?? []).map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
  } else {
    control = `<input data-path="${escapeHtml(field.path)}" type="${field.kind}" value="${escapeHtml(value)}">`;
  }
  return `<label class="field"><span><strong>${escapeHtml(field.label)}</strong><small>${escapeHtml(field.description)}</small></span>${control}</label>`;
}

function renderSelector(collection: string, index: number, field: string, value: unknown, selector: Record<string, unknown>): string {
  return `<ha-selector class="collection-selector" data-collection="${collection}" data-index="${index}" data-field="${field}" data-selector="${escapeHtml(JSON.stringify(selector))}" data-value="${escapeHtml(JSON.stringify(value))}"></ha-selector>`;
}

function renderPersons(config: HomeDashboardConfigV1, expandedItems: Set<string>): string {
  return config.persons.map((personConfig, index) => `<details class="item" data-item-token="${escapeHtml(getEditorItemToken("persons", personConfig, index))}" ${expandedItems.has(getEditorItemToken("persons", personConfig, index)) ? "open" : ""}>
    <summary>${escapeHtml(personConfig.label || personConfig.key || `Persoon ${index + 1}`)}</summary><div class="item-body">
    <div class="item-toolbar"><button type="button" aria-label="Verwijder persoon ${escapeHtml(personConfig.label || personConfig.key || index + 1)}" data-remove="persons" data-index="${index}">Verwijder</button></div>
    <label>Logische sleutel<input data-collection="persons" data-index="${index}" data-field="key" value="${escapeHtml(personConfig.key)}"></label>
    <label>Label<input data-collection="persons" data-index="${index}" data-field="label" value="${escapeHtml(personConfig.label)}"></label>
    <label>Person-entiteit${renderSelector("persons", index, "entity", personConfig.entity, { entity: { domain: "person" } })}</label>
    <label>Freshness (minuten)<input type="number" data-collection="persons" data-index="${index}" data-field="freshness_minutes" value="${personConfig.freshness_minutes}"></label>
    <label class="check"><input type="checkbox" data-collection="persons" data-index="${index}" data-field="show_location" ${personConfig.show_location ? "checked" : ""}> Toon thuis/zone/andere locatie</label>
    <label>Toegestane zones${renderSelector("persons", index, "zone_entities", personConfig.zone_entities, { entity: { domain: "zone", multiple: true } })}</label>
    <label>Batterijbronnen${renderSelector("persons", index, "battery_entities", personConfig.battery_entities, { entity: { multiple: true } })}</label>
  </div></details>`).join("");
}

function renderCameras(config: HomeDashboardConfigV1, expandedItems: Set<string>): string {
  const actionOptions = [`<option value="">Geen</option>`, ...config.actions.map((action) => `<option value="${escapeHtml(action.key)}">${escapeHtml(action.label || action.key)} · risico: ${escapeHtml(action.risk)}</option>`)].join("");
  return config.security.cameras.map((cameraConfig, index) => `<details class="item" data-item-token="${escapeHtml(getEditorItemToken("security.cameras", cameraConfig, index))}" ${expandedItems.has(getEditorItemToken("security.cameras", cameraConfig, index)) ? "open" : ""}>
    <summary>${escapeHtml(cameraConfig.name || cameraConfig.key || `Camera ${index + 1}`)}</summary><div class="item-body">
    <div class="item-toolbar"><button type="button" aria-label="Verwijder camera ${escapeHtml(cameraConfig.name || cameraConfig.key || index + 1)}" data-remove="security.cameras" data-index="${index}">Verwijder</button></div>
    <label>Logische sleutel<input data-collection="security.cameras" data-index="${index}" data-field="key" value="${escapeHtml(cameraConfig.key)}"></label>
    <label>Naam<input data-collection="security.cameras" data-index="${index}" data-field="name" value="${escapeHtml(cameraConfig.name)}"></label>
    <label>Camera${renderSelector("security.cameras", index, "camera_entity", cameraConfig.camera_entity, { entity: { domain: "camera" } })}</label>
    <label>Privacyinstelling${renderSelector("security.cameras", index, "privacy_entity", cameraConfig.privacy_entity, { entity: { domain: ["switch", "input_boolean", "binary_sensor"] } })}</label>
    <label>Privacyactie <small>Optioneel. Laat op Geen voor alleen status; maak een bedieningsactie eerst onder Acties.</small><select data-collection="security.cameras" data-index="${index}" data-field="privacy_action_key">${actionOptions.replace(`value="${escapeHtml(cameraConfig.privacy_action_key)}"`, `value="${escapeHtml(cameraConfig.privacy_action_key)}" selected`)}</select></label>
    <label>Fallback<select data-collection="security.cameras" data-index="${index}" data-field="fallback">${["placeholder", "last_image", "hidden"].map((value) => `<option ${cameraConfig.fallback === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    <label class="check"><input type="checkbox" data-collection="security.cameras" data-index="${index}" data-field="confirm_privacy_disable" ${cameraConfig.confirm_privacy_disable ? "checked" : ""}> Extra bevestiging bij privacy uitschakelen <small>Optioneel en onafhankelijk van de risicoklasse van de gekozen actie.</small></label>
  </div></details>`).join("");
}

function renderRooms(config: HomeDashboardConfigV1, expandedItems: Set<string>): string {
  return config.rooms.map((roomConfig, index) => `<details class="item" data-item-token="${escapeHtml(getEditorItemToken("rooms", roomConfig, index))}" ${expandedItems.has(getEditorItemToken("rooms", roomConfig, index)) ? "open" : ""}>
    <summary>${escapeHtml(roomConfig.name || roomConfig.key || `Kamer ${index + 1}`)}</summary><div class="item-body">
    <div class="item-toolbar"><span class="item-actions"><button type="button" aria-label="Verplaats ${escapeHtml(roomConfig.name || roomConfig.key || `kamer ${index + 1}`)} omhoog" data-room-move="up" data-index="${index}" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" aria-label="Verplaats ${escapeHtml(roomConfig.name || roomConfig.key || `kamer ${index + 1}`)} omlaag" data-room-move="down" data-index="${index}" ${index === config.rooms.length - 1 ? "disabled" : ""}>↓</button><button type="button" aria-label="Verwijder kamer ${escapeHtml(roomConfig.name || roomConfig.key || index + 1)}" data-remove="rooms" data-index="${index}">Verwijder</button></span></div>
    <label>Logische sleutel<input data-collection="rooms" data-index="${index}" data-field="key" value="${escapeHtml(roomConfig.key)}"></label>
    <label>Naam<input data-collection="rooms" data-index="${index}" data-field="name" value="${escapeHtml(roomConfig.name)}"></label>
    <label>Icoon${renderSelector("rooms", index, "icon", roomConfig.icon, { icon: {} })}</label>
    <label>Verdieping${renderSelector("rooms", index, "floor_id", roomConfig.floor_id, { floor: {} })}</label>
    <label>Area${renderSelector("rooms", index, "area_id", roomConfig.area_id, { area: {} })}</label>
    <label>Extra devices${renderSelector("rooms", index, "device_ids", roomConfig.device_ids, { device: { multiple: true } })}</label>
    <label>Functies<select multiple data-collection="rooms" data-index="${index}" data-field="capabilities">${ROOM_CAPABILITIES.map((value) => `<option value="${value}" ${roomConfig.capabilities.includes(value) ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    <label>Quick actions (max. 2)<select multiple data-collection="rooms" data-index="${index}" data-field="quick_actions">${config.actions.map((action) => `<option value="${escapeHtml(action.key)}" ${roomConfig.quick_actions.includes(action.key) ? "selected" : ""}>${escapeHtml(action.label || action.key)}</option>`).join("")}</select></label>
    <h4>Bronmappings</h4>
    <label>Verlichting${renderSelector("rooms", index, "light_entities", roomConfig.light_entities, { entity: { domain: "light", multiple: true } })}</label>
    <label>Covers en openingen${renderSelector("rooms", index, "cover_entities", roomConfig.cover_entities, { entity: { multiple: true } })}</label>
    <label>Media${renderSelector("rooms", index, "media_entities", roomConfig.media_entities, { entity: { domain: "media_player", multiple: true } })}</label>
    <label>Safety${renderSelector("rooms", index, "safety_entities", roomConfig.safety_entities, { entity: { multiple: true } })}</label>
    <label>Camera's${renderSelector("rooms", index, "camera_entities", roomConfig.camera_entities, { entity: { domain: "camera", multiple: true } })}</label>
    <label>Apparaten en power${renderSelector("rooms", index, "power_entities", roomConfig.power_entities, { entity: { multiple: true } })}</label>
    <label>Overige historie${renderSelector("rooms", index, "history_entities", roomConfig.history_entities, { entity: { multiple: true } })}</label>
    <h4>Klimaatdetail</h4>
    <label>Klimaatbron${renderSelector("rooms", index, "hvac.entity", roomConfig.hvac.entity, { entity: { domain: "climate" } })}</label>
    <label>Comfort en luchtkwaliteit${renderSelector("rooms", index, "hvac.comfort_entities", roomConfig.hvac.comfort_entities, { entity: { multiple: true } })}</label>
    <label>Klimaathistorie${renderSelector("rooms", index, "hvac.history_entities", roomConfig.hvac.history_entities, { entity: { multiple: true } })}</label>
    <label>Toegestane modes<input data-collection="rooms" data-index="${index}" data-field="hvac.modes" value="${escapeHtml(roomConfig.hvac.modes.join(", "))}"></label>
    <label>Presets<input data-collection="rooms" data-index="${index}" data-field="hvac.presets" value="${escapeHtml(roomConfig.hvac.presets.join(", "))}"></label>
    <label>Fan modes<input data-collection="rooms" data-index="${index}" data-field="hvac.fan_modes" value="${escapeHtml(roomConfig.hvac.fan_modes.join(", "))}"></label>
    <label>Swing modes<input data-collection="rooms" data-index="${index}" data-field="hvac.swing_modes" value="${escapeHtml(roomConfig.hvac.swing_modes.join(", "))}"></label>
  </div></details>`).join("");
}

function renderActions(config: HomeDashboardConfigV1, expandedItems: Set<string>): string {
  return config.actions.map((action, index) => `<details class="item" data-item-token="${escapeHtml(getEditorItemToken("actions", action, index))}" ${expandedItems.has(getEditorItemToken("actions", action, index)) ? "open" : ""}>
    <summary>${escapeHtml(action.label || action.key || `Actie ${index + 1}`)}</summary><div class="item-body">
    <div class="item-toolbar"><button type="button" aria-label="Verwijder actie ${escapeHtml(action.label || action.key || index + 1)}" data-remove="actions" data-index="${index}">Verwijder</button></div>
    <label>Logische sleutel<input data-collection="actions" data-index="${index}" data-field="key" value="${escapeHtml(action.key)}"></label>
    <label>Label<input data-collection="actions" data-index="${index}" data-field="label" value="${escapeHtml(action.label)}"></label>
    <label>Home Assistant-acties${renderSelector("actions", index, "sequence", action.sequence, { action: {} })}</label>
    <label>Risico<select data-collection="actions" data-index="${index}" data-field="risk">${["safe", "privacy", "costly", "destructive"].map((value) => `<option ${action.risk === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    <label>Bevestigingstekst<input data-collection="actions" data-index="${index}" data-field="confirmation_text" value="${escapeHtml(action.confirmation_text)}"></label>
    <label class="check"><input type="checkbox" data-collection="actions" data-index="${index}" data-field="hold_required" ${action.hold_required ? "checked" : ""}> Hold-to-confirm</label>
    <label>Resultaatcontrole${renderSelector("actions", index, "verification_entity", action.verification_entity, { entity: {} })}</label>
  </div></details>`).join("");
}

function renderSpecialists(config: HomeDashboardConfigV1): string {
  return Object.entries(config.specialists).map(([key, specialist]) => {
    const tag = specialist.card_type.replace(/^custom:/, "");
    const available = typeof customElements !== "undefined" && Boolean(customElements.get(tag));
    const resourceStatus = !specialist.enabled
      ? "Uitgeschakeld."
      : available
        ? "Resource is geladen."
        : "Resource niet gevonden. Installeer of update deze kaart via HACS en herlaad de browser.";
    return `<article class="item">
    <strong>${escapeHtml(key)}</strong><code>${escapeHtml(specialist.card_type)}</code>
    <p class="${specialist.enabled && !available ? "warning" : ""}">${escapeHtml(resourceStatus)}</p>
    <label class="check"><input type="checkbox" data-specialist="${key}" data-field="enabled" ${specialist.enabled ? "checked" : ""}> Inschakelen</label>
    <label>Geteste minimumversie<input data-specialist="${key}" data-field="minimum_version" value="${escapeHtml(specialist.minimum_version)}"></label>
    <label>Logische mappingsleutels<input data-specialist="${key}" data-field="mapping_keys" value="${escapeHtml(specialist.mapping_keys.join(", "))}"></label>
  </article>`;
  }).join("");
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
      if (last) fieldTarget[last] = value;
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
        light_entities: [], cover_entities: [], media_entities: [], safety_entities: [], camera_entities: [], power_entities: [], history_entities: [],
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

  private configureSelectors(): void {
    if (!this.shadowRoot) return;
    this.shadowRoot.querySelectorAll<HTMLElement & { hass: HomeAssistantLike | undefined; selector?: Record<string, unknown>; value?: unknown; required?: boolean }>("ha-selector").forEach((element) => {
      element.hass = this._hass;
      const path = element.dataset.path;
      const field = path ? FIELD_DEFINITIONS.find((candidate) => candidate.path === path) : undefined;
      const encodedSelector = element.dataset.selector;
      element.selector = field?.selector ?? (encodedSelector ? JSON.parse(encodedSelector) as Record<string, unknown> : { entity: {} });
      element.value = JSON.parse(element.dataset.value ?? "null") as unknown;
      if (path) element.required = false;
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
        setPath(this._config, path, value);
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
    this.shadowRoot.querySelectorAll<HTMLButtonElement>("[data-room-move]").forEach((controlButton) => controlButton.addEventListener("click", () => this.moveItem(this._config.rooms, Number(controlButton.dataset.index), controlButton.dataset.roomMove as "up" | "down")));
    this.shadowRoot.querySelectorAll<HTMLButtonElement>("[data-view-move]").forEach((controlButton) => controlButton.addEventListener("click", () => this.moveItem(this._config.layout.view_order, Number(controlButton.dataset.index), controlButton.dataset.viewMove as "up" | "down")));
    this.shadowRoot.querySelectorAll<HTMLDetailsElement>("details[data-item-token]").forEach((details) => {
      const token = details.dataset.itemToken;
      if (!token) return;
      details.addEventListener("toggle", () => details.open ? this.expandedItems.add(token) : this.expandedItems.delete(token));
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
    this.shadowRoot.querySelectorAll<HTMLInputElement>("[data-specialist]").forEach((element) => element.addEventListener("change", () => {
      const specialist = this._config.specialists[element.dataset.specialist as keyof typeof this._config.specialists];
      const field = element.dataset.field as "enabled" | "minimum_version" | "mapping_keys";
      if (!specialist || !field) return;
      if (field === "enabled") specialist.enabled = element.checked;
      else if (field === "mapping_keys") specialist.mapping_keys = element.value.split(",").map((value) => value.trim()).filter(Boolean);
      else specialist.minimum_version = element.value;
      this.commit();
    }));
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
      security: { body: `<aside class="guidance"><strong>Privacybediening is optioneel</strong><p>Laat Privacyactie op Geen om alleen de status te tonen. Wil je bedienen, maak dan onder Acties een actie met expliciete target en resultaatcontrole. Risicoklasse en bevestiging stel je bij de actie zelf in.</p><button type="button" data-go-section="actions">Ga naar Acties →</button></aside><div class="items">${renderCameras(this._config, this.expandedItems)}</div>`, extra: `<button class="add" type="button" data-add="security.cameras">Camera toevoegen</button>` },
      rooms: { body: `<div class="items">${renderRooms(this._config, this.expandedItems)}</div>`, extra: `<button class="add" type="button" data-add="rooms">Kamer toevoegen</button>` },
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
      h2,p{margin:0}.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:end}.toolbar label,.toolbar button{border:1px solid var(--divider-color);border-radius:10px;padding:9px 12px;background:var(--secondary-background-color);color:inherit;cursor:pointer}.toolbar label{display:grid;gap:5px}.toolbar input[type=file]{max-width:240px;padding:4px}
      .editor-layout{display:grid;grid-template-columns:minmax(170px,220px) minmax(0,1fr);gap:12px;margin-top:12px}.section-nav{display:grid;gap:6px;align-self:start;position:sticky;top:8px}.section-tab{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:44px;padding:10px 12px;border:1px solid var(--divider-color);border-radius:10px;background:var(--card-background-color);color:inherit;text-align:left;cursor:pointer}.section-tab[aria-selected=true]{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,var(--card-background-color));font-weight:700}.nav-state{display:grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:var(--secondary-background-color);font-size:.78rem}.nav-state.valid{color:var(--success-color,#27824a)}
      .section-panel{min-width:0;border:1px solid var(--divider-color);border-radius:14px;background:var(--card-background-color);overflow:hidden}.section-heading{padding:16px;border-bottom:1px solid var(--divider-color)}.section-heading h3{margin:0;font-size:1.25rem}.section{display:grid;gap:12px;padding:14px}
      .field,label{display:grid;gap:5px}.field{grid-template-columns:minmax(180px,1fr) minmax(220px,1fr);align-items:center;padding:9px 0;border-top:1px solid var(--divider-color)}small{display:block;color:var(--secondary-text-color);margin-top:3px}
      input,select{width:100%;padding:10px;border:1px solid var(--divider-color);border-radius:8px;background:var(--secondary-background-color);color:inherit}input[type=checkbox]{width:22px;height:22px}.check{display:flex;align-items:center;gap:8px}
      .items{display:grid;gap:10px}.item{margin:0;border:1px solid var(--divider-color);border-radius:12px;background:var(--secondary-background-color);overflow:hidden}.item summary{padding:12px;font-weight:700;cursor:pointer}.item-body{display:grid;gap:10px;padding:0 12px 12px}.item-toolbar{display:flex;justify-content:flex-end}.item-actions{display:flex;gap:4px}.item button{color:var(--error-color);background:transparent;border:0;min-width:40px;min-height:40px;cursor:pointer}.item button[disabled]{opacity:.35;cursor:not-allowed}code{display:block;overflow-wrap:anywhere;color:var(--secondary-text-color)}
      fieldset.config{border:0;margin:0;padding:0;min-width:0}.config[disabled]{pointer-events:none;opacity:.72}.order{display:grid;gap:6px}.order>div{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border:1px solid var(--divider-color);border-radius:8px}.order button{min-width:40px;min-height:40px;border:0;border-radius:8px;margin-left:4px}.fatal{color:var(--error-color);font-weight:700}
      .add{justify-self:start;padding:9px 12px;border:0;border-radius:9px;background:var(--accent);color:var(--text-primary-color,#fff);cursor:pointer}.guidance{display:grid;gap:8px;padding:12px;border:1px solid color-mix(in srgb,var(--accent) 35%,var(--divider-color));border-radius:12px;background:color-mix(in srgb,var(--accent) 8%,var(--card-background-color))}.guidance button{justify-self:start;min-height:42px;padding:8px 12px;border:1px solid var(--accent);border-radius:9px;background:var(--card-background-color);color:var(--accent);font-weight:700;cursor:pointer}.issues{margin:0;padding-left:20px}.error{color:var(--error-color)}.warning{color:var(--warning-color,#b26a00)}.section-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;border-top:1px solid var(--divider-color)}.section-footer button{min-height:42px;padding:8px 14px;border:1px solid var(--divider-color);border-radius:9px;background:var(--secondary-background-color);color:inherit}.section-footer button[disabled]{opacity:.45}
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
