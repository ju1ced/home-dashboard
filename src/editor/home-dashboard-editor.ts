import { createCameraConfig, createDefaultConfig } from "../config/defaults";
import { migrateConfig } from "../config/migrate";
import { parseImportedConfig, serializeConfig } from "../config/compiler";
import { ROOM_CAPABILITIES, type ActionConfig, type HomeDashboardConfigV1, type PersonConfig, type RoomConfig } from "../config/types";
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

function renderPersons(config: HomeDashboardConfigV1): string {
  return config.persons.map((personConfig, index) => `<article class="item">
    <div class="item-title"><strong>${escapeHtml(personConfig.label || personConfig.key || `Persoon ${index + 1}`)}</strong><button type="button" aria-label="Verwijder persoon ${escapeHtml(personConfig.label || personConfig.key || index + 1)}" data-remove="persons" data-index="${index}">Verwijder</button></div>
    <label>Logische sleutel<input data-collection="persons" data-index="${index}" data-field="key" value="${escapeHtml(personConfig.key)}"></label>
    <label>Label<input data-collection="persons" data-index="${index}" data-field="label" value="${escapeHtml(personConfig.label)}"></label>
    <label>Person-entiteit${renderSelector("persons", index, "entity", personConfig.entity, { entity: { domain: "person" } })}</label>
    <label>Freshness (minuten)<input type="number" data-collection="persons" data-index="${index}" data-field="freshness_minutes" value="${personConfig.freshness_minutes}"></label>
    <label class="check"><input type="checkbox" data-collection="persons" data-index="${index}" data-field="show_location" ${personConfig.show_location ? "checked" : ""}> Toon thuis/zone/andere locatie</label>
    <label>Toegestane zones${renderSelector("persons", index, "zone_entities", personConfig.zone_entities, { entity: { domain: "zone", multiple: true } })}</label>
    <label>Batterijbronnen${renderSelector("persons", index, "battery_entities", personConfig.battery_entities, { entity: { multiple: true } })}</label>
  </article>`).join("");
}

function renderCameras(config: HomeDashboardConfigV1): string {
  const actionOptions = [`<option value="">Geen</option>`, ...config.actions.map((action) => `<option value="${escapeHtml(action.key)}">${escapeHtml(action.label || action.key)}</option>`)].join("");
  return config.security.cameras.map((cameraConfig, index) => `<article class="item">
    <div class="item-title"><strong>${escapeHtml(cameraConfig.name || cameraConfig.key || `Camera ${index + 1}`)}</strong><button type="button" aria-label="Verwijder camera ${escapeHtml(cameraConfig.name || cameraConfig.key || index + 1)}" data-remove="security.cameras" data-index="${index}">Verwijder</button></div>
    <label>Logische sleutel<input data-collection="security.cameras" data-index="${index}" data-field="key" value="${escapeHtml(cameraConfig.key)}"></label>
    <label>Naam<input data-collection="security.cameras" data-index="${index}" data-field="name" value="${escapeHtml(cameraConfig.name)}"></label>
    <label>Camera${renderSelector("security.cameras", index, "camera_entity", cameraConfig.camera_entity, { entity: { domain: "camera" } })}</label>
    <label>Privacyinstelling${renderSelector("security.cameras", index, "privacy_entity", cameraConfig.privacy_entity, { entity: { domain: ["switch", "input_boolean", "binary_sensor"] } })}</label>
    <label>Privacyactie<select data-collection="security.cameras" data-index="${index}" data-field="privacy_action_key">${actionOptions.replace(`value="${escapeHtml(cameraConfig.privacy_action_key)}"`, `value="${escapeHtml(cameraConfig.privacy_action_key)}" selected`)}</select></label>
    <label>Fallback<select data-collection="security.cameras" data-index="${index}" data-field="fallback">${["placeholder", "last_image", "hidden"].map((value) => `<option ${cameraConfig.fallback === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    <label class="check"><input type="checkbox" data-collection="security.cameras" data-index="${index}" data-field="confirm_privacy_disable" ${cameraConfig.confirm_privacy_disable ? "checked" : ""}> Bevestig privacy uitschakelen</label>
  </article>`).join("");
}

function renderRooms(config: HomeDashboardConfigV1): string {
  return config.rooms.map((roomConfig, index) => `<article class="item">
    <div class="item-title"><strong>${escapeHtml(roomConfig.name || roomConfig.key || `Kamer ${index + 1}`)}</strong><span class="item-actions"><button type="button" aria-label="Verplaats ${escapeHtml(roomConfig.name || roomConfig.key || `kamer ${index + 1}`)} omhoog" data-room-move="up" data-index="${index}" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" aria-label="Verplaats ${escapeHtml(roomConfig.name || roomConfig.key || `kamer ${index + 1}`)} omlaag" data-room-move="down" data-index="${index}" ${index === config.rooms.length - 1 ? "disabled" : ""}>↓</button><button type="button" aria-label="Verwijder kamer ${escapeHtml(roomConfig.name || roomConfig.key || index + 1)}" data-remove="rooms" data-index="${index}">Verwijder</button></span></div>
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
  </article>`).join("");
}

function renderActions(config: HomeDashboardConfigV1): string {
  return config.actions.map((action, index) => `<article class="item">
    <div class="item-title"><strong>${escapeHtml(action.label || action.key || `Actie ${index + 1}`)}</strong><button type="button" aria-label="Verwijder actie ${escapeHtml(action.label || action.key || index + 1)}" data-remove="actions" data-index="${index}">Verwijder</button></div>
    <label>Logische sleutel<input data-collection="actions" data-index="${index}" data-field="key" value="${escapeHtml(action.key)}"></label>
    <label>Label<input data-collection="actions" data-index="${index}" data-field="label" value="${escapeHtml(action.label)}"></label>
    <label>Home Assistant-acties${renderSelector("actions", index, "sequence", action.sequence, { action: {} })}</label>
    <label>Risico<select data-collection="actions" data-index="${index}" data-field="risk">${["safe", "privacy", "costly", "destructive"].map((value) => `<option ${action.risk === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    <label>Bevestigingstekst<input data-collection="actions" data-index="${index}" data-field="confirmation_text" value="${escapeHtml(action.confirmation_text)}"></label>
    <label class="check"><input type="checkbox" data-collection="actions" data-index="${index}" data-field="hold_required" ${action.hold_required ? "checked" : ""}> Hold-to-confirm</label>
    <label>Resultaatcontrole${renderSelector("actions", index, "verification_entity", action.verification_entity, { entity: {} })}</label>
  </article>`).join("");
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
      const segments = field.split(".");
      const last = segments.pop();
      let fieldTarget = item;
      for (const segment of segments) fieldTarget = fieldTarget[segment] as MutableRecord;
      if (last) fieldTarget[last] = value;
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
    } else if (collection === "security.cameras" && this._config.security.cameras.length < 3) {
      this._config.security.cameras.push(createCameraConfig(this._config.security.cameras.length));
    } else if (collection === "rooms") {
      const room: RoomConfig = {
        key: `room_${this._config.rooms.length + 1}`, name: "", icon: "mdi:sofa", floor_id: "", area_id: "", device_ids: [], capabilities: [], quick_actions: [],
        light_entities: [], cover_entities: [], media_entities: [], safety_entities: [], camera_entities: [], power_entities: [], history_entities: [],
        hvac: { entity: "", comfort_entities: [], history_entities: [], modes: [], presets: [], fan_modes: [], swing_modes: [] }
      };
      this._config.rooms.push(room);
    } else if (collection === "actions") {
      const action: ActionConfig = { key: `action_${this._config.actions.length + 1}`, label: "", sequence: [], risk: "safe", confirmation_text: "", hold_required: false, verification_entity: "" };
      this._config.actions.push(action);
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
    this.shadowRoot.querySelectorAll<HTMLElement & { hass: HomeAssistantLike | undefined; selector?: Record<string, unknown>; value?: unknown }>("ha-selector").forEach((element) => {
      element.hass = this._hass;
      const path = element.dataset.path;
      const field = path ? FIELD_DEFINITIONS.find((candidate) => candidate.path === path) : undefined;
      const encodedSelector = element.dataset.selector;
      element.selector = field?.selector ?? (encodedSelector ? JSON.parse(encodedSelector) as Record<string, unknown> : { entity: {} });
      element.value = JSON.parse(element.dataset.value ?? "null") as unknown;
    });
  }

  private bindEvents(): void {
    if (!this.shadowRoot) return;
    this.shadowRoot.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-path]").forEach((element) => {
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
    const issues = [...validateConfigSchema(this._config), ...validateConfig(this._config)];
    const summary = `${this._config.rooms.length} kamers · ${this._config.persons.length} personen · ${this._config.security.cameras.length}/3 camera's · ${this._config.actions.length} acties`;
    const section = (key: string, body: string, extra = "") => `<details open><summary>${SECTION_TITLES[key]}</summary><div class="section">${FIELD_DEFINITIONS.filter((field) => field.section === key).map((field) => renderField(field, this._config)).join("")}${body}${extra}</div></details>`;
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,system-ui);--accent:var(--primary-color,#276b5b)}
      *{box-sizing:border-box}header{display:grid;gap:12px;padding:16px;border:1px solid var(--divider-color);border-radius:16px;background:var(--card-background-color)}
      h2,p{margin:0}.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:end}.toolbar label,.toolbar button{border:1px solid var(--divider-color);border-radius:10px;padding:9px 12px;background:var(--secondary-background-color);color:inherit;cursor:pointer}.toolbar label{display:grid;gap:5px}.toolbar input[type=file]{max-width:240px;padding:4px}
      details{margin-top:12px;border:1px solid var(--divider-color);border-radius:14px;background:var(--card-background-color);overflow:hidden}summary{font-size:1.05rem;font-weight:700;padding:14px;cursor:pointer}.section{display:grid;gap:12px;padding:0 14px 14px}
      .field,label{display:grid;gap:5px}.field{grid-template-columns:minmax(180px,1fr) minmax(220px,1fr);align-items:center;padding:9px 0;border-top:1px solid var(--divider-color)}small{display:block;color:var(--secondary-text-color);margin-top:3px}
      input,select{width:100%;padding:10px;border:1px solid var(--divider-color);border-radius:8px;background:var(--secondary-background-color);color:inherit}input[type=checkbox]{width:22px;height:22px}.check{display:flex;align-items:center;gap:8px}
      .items{display:grid;gap:10px}.item{display:grid;gap:10px;padding:12px;border:1px solid var(--divider-color);border-radius:12px;background:var(--secondary-background-color)}.item-title{display:flex;justify-content:space-between;align-items:center;gap:8px}.item-actions{display:flex;gap:4px}.item button{color:var(--error-color);background:transparent;border:0;cursor:pointer}.item button[disabled]{opacity:.35;cursor:not-allowed}code{display:block;overflow-wrap:anywhere;color:var(--secondary-text-color)}
      fieldset.config{border:0;margin:0;padding:0;min-width:0}.config[disabled]{pointer-events:none;opacity:.72}.order{display:grid;gap:6px}.order>div{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border:1px solid var(--divider-color);border-radius:8px}.order button{min-width:40px;min-height:40px;border:0;border-radius:8px;margin-left:4px}.fatal{color:var(--error-color);font-weight:700}
      .add{justify-self:start;padding:9px 12px;border:0;border-radius:9px;background:var(--accent);color:var(--text-primary-color,#fff);cursor:pointer}.issues{margin:0;padding-left:20px}.error{color:var(--error-color)}.warning{color:var(--warning-color,#b26a00)}
      @media(max-width:600px){.field{grid-template-columns:1fr}.section{padding-inline:10px}header{padding:12px}}
    </style>
    <header><div><h2>Home Dashboard configuratie</h2><p>${escapeHtml(summary)}</p></div><div class="toolbar"><button id="export" type="button" ${this.blocked ? "disabled" : ""}>Exporteer privé-back-up</button><label>Importeer JSON<input id="import" type="file" accept="application/json"></label><button id="reset" type="button" ${this.blocked ? "disabled" : ""}>Herstel standaard</button></div><p role="status" aria-live="polite" class="${this.blocked ? "fatal" : ""}">${escapeHtml(this.message)}</p>${this.blocked ? "" : issues.length ? `<div role="alert"><ul class="issues">${issues.map((candidate) => `<li class="${candidate.severity}"><strong>${escapeHtml(candidate.path)}</strong>: ${escapeHtml(candidate.message)}</li>`).join("")}</ul></div>` : "<p>Schema v1 is geldig.</p>"}</header>
    <fieldset class="config" ${this.blocked ? "disabled" : ""}>
    ${section("general", "")}${section("today", "")}
    ${section("persons", `<div class="items">${renderPersons(this._config)}</div>`, `<button class="add" type="button" data-add="persons">Persoon toevoegen</button>`)}
    ${section("security", `<div class="items">${renderCameras(this._config)}</div>`, `<button class="add" type="button" data-add="security.cameras" ${this._config.security.cameras.length >= 3 ? "disabled" : ""}>Camera toevoegen</button>`)}
    ${section("rooms", `<div class="items">${renderRooms(this._config)}</div>`, `<button class="add" type="button" data-add="rooms">Kamer toevoegen</button>`)}
    ${section("energy", "")}
    ${section("actions", `<div class="items">${renderActions(this._config)}</div>`, `<button class="add" type="button" data-add="actions">Actie toevoegen</button>`)}
    ${section("specialists", `<div class="items">${renderSpecialists(this._config)}</div>`)}
    ${section("layout", `<div><strong>Viewvolgorde</strong><small>De vijf stabiele paden blijven aanwezig en kunnen worden herschikt.</small>${renderViewOrder(this._config)}</div>`)}
    ${section("diagnostics", "")}</fieldset>`;
    this.configureSelectors();
    this.bindEvents();
    if (focusData) {
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
