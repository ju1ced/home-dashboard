import { HomeDashboardRoomControls, planEntityControl } from "./home-dashboard-room-controls";
import type { RoomConfig } from "../config/types";
import { applyDashboardPalette, type DashboardPalette, type ThemeMode } from "../theme/palettes";

type StateLike = { state?: string; attributes?: Record<string, unknown>; last_updated?: string };
type HomeAssistantLike = {
  states?: Record<string, StateLike>;
  callService?: (domain: string, service: string, data: Record<string, unknown>) => Promise<unknown>;
  floors?: Array<{ floor_id?: string; id?: string; name?: string }> | Record<string, { name?: string }>;
};
type LovelaceCardElement = HTMLElement & { hass?: HomeAssistantLike; setConfig?: (config: Record<string, unknown>) => void };
type CardHelpers = { createCardElement: (config: Record<string, unknown>) => LovelaceCardElement };

interface RoomOverviewConfig {
  type: "custom:home-dashboard-room-overview";
  rooms: RoomConfig[];
  show_controls?: boolean;
  palette?: DashboardPalette;
  theme_mode?: ThemeMode;
}

interface RoomDetailConfig {
  type: "custom:home-dashboard-room-detail";
  room: RoomConfig;
  palette?: DashboardPalette;
  theme_mode?: ThemeMode;
}

interface CustomCardMetadata {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
}

type DeviceRole = "light" | "cover" | "climate" | "media" | "comfort" | "safety" | "camera" | "power" | "history";
type DevicePresentation = { entity: string; icon: string; label: string; value: string; tone: "normal" | "active" | "warning" | "unavailable" };
type DetailKind = "light" | "cover" | "media" | "climate" | "plug";
type DetailCommand = "toggle" | "open" | "stop" | "close" | "set_temperature";
type DetailPlan = { entity: string; domain: string; service: string; data: Record<string, unknown> };
export type LightGroupState = "off" | "on" | "partial" | "unknown" | "unavailable";

declare global {
  interface Window {
    customCards?: CustomCardMetadata[];
  }
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;
const roomStyles = `:host{display:block;min-width:0;--room-surface:var(--ha-card-background,var(--card-background-color))}.hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px;border-radius:22px;background:var(--hd-hero,var(--primary-color,#245c4d));color:var(--hd-hero-text,#fff)}.hero-copy{display:grid;gap:4px}.eyebrow{font-size:.74rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.8}.hero h1,.hero h2{margin:0;font-size:1.7rem}.hero p{margin:0;opacity:.78}@media(max-width:600px){.hero{padding:18px}.hero h1,.hero h2{font-size:1.55rem}}`;

export function roomPath(room: Pick<RoomConfig, "key">): string {
  return `room-${room.key.replaceAll("_", "-")}`;
}

export function resolveLightGroupState(states: Record<string, StateLike>, entities: readonly string[]): LightGroupState {
  if (entities.length === 0) return "unknown";
  const values = entities.map((entity) => states[entity]?.state);
  if (values.some((value) => value === "unavailable")) return "unavailable";
  if (values.some((value) => !value || value === "unknown")) return "unknown";
  if (values.every((value) => value === "on")) return "on";
  if (values.every((value) => value === "off")) return "off";
  return "partial";
}

function roomEntities(room: RoomConfig): string[] {
  return [...new Set([
    ...(room.control_entities ?? []),
    room.control_light_entity ?? "", room.control_cover_entity ?? "", room.control_awning_entity ?? "", room.control_media_entity ?? "",
    ...room.light_entities,
    ...(room.light_switch_entities ?? []),
    ...(room.light_groups ?? []).flatMap((group) => [group.control_entity, ...group.member_entities]),
    ...room.cover_entities,
    ...(room.cover_controls ?? []).map((cover) => cover.entity),
    room.hvac.entity,
    ...room.hvac.comfort_entities,
    ...room.media_entities,
    ...room.safety_entities,
    ...room.camera_entities,
    ...room.power_entities,
    room.image_entity ?? "",
    room.temperature_history_entity ?? "",
    ...(room.smart_plugs ?? []).flatMap((plug) => [plug.switch_entity, plug.power_entity, plug.energy_entity, plug.voltage_entity, plug.energy_day_entity ?? "", plug.energy_month_entity ?? "", plug.energy_year_entity ?? ""]),
    room.room_energy?.power_entity ?? "", room.room_energy?.day_entity ?? "", room.room_energy?.month_entity ?? "", room.room_energy?.year_entity ?? "",
    ...room.history_entities,
    ...room.hvac.history_entities
  ].filter(Boolean))];
}

function stateSignature(hass: HomeAssistantLike | undefined, room: RoomConfig): string {
  return roomEntities(room).map((entity) => {
    const current = hass?.states?.[entity];
    const attributes = current?.attributes;
    return [
      entity,
      current?.state ?? "missing",
      attributes?.current_temperature ?? "",
      attributes?.temperature ?? "",
      attributes?.unit_of_measurement ?? "",
      attributes?.preset_mode ?? "",
      attributes?.fan_mode ?? "",
      attributes?.swing_mode ?? "",
      attributes?.brightness ?? "", attributes?.current_position ?? "",
      attributes?.media_title ?? "", attributes?.source ?? "",
      attributes?.friendly_name ?? "", attributes?.icon ?? "", attributes?.entity_picture ?? "",
      attributes?.supported_features ?? "", attributes?.device_class ?? ""
    ].join(":");
  }).join("|");
}

function numberAttribute(state: StateLike | undefined, key: string): number | undefined {
  const value = state?.attributes?.[key];
  return typeof value === "number" ? value : undefined;
}

function stateText(state: StateLike | undefined): string {
  if (!state) return "Niet gevonden";
  const value = state?.state;
  if (!value || value === "unknown") return "Onbekend";
  if (value === "unavailable") return "Niet beschikbaar";
  const translations: Record<string, string> = {
    on: "Aan", off: "Uit", open: "Open", closed: "Gesloten", opening: "Opent", closing: "Sluit",
    heat: "Verwarmen", cool: "Koelen", auto: "Automatisch", idle: "Stand-by", playing: "Speelt", paused: "Gepauzeerd", home: "Thuis"
  };
  const unit = typeof state.attributes?.unit_of_measurement === "string" ? state.attributes.unit_of_measurement : "";
  return `${translations[value] ?? value}${unit ? ` ${unit}` : ""}`;
}

function friendlyName(state: StateLike | undefined, fallback: string): string {
  return typeof state?.attributes?.friendly_name === "string" ? state.attributes.friendly_name : fallback;
}

function sourceContext(state: StateLike | undefined, fallback: string): string {
  const source = friendlyName(state, fallback);
  const updated = state?.last_updated ? new Date(state.last_updated) : undefined;
  const ageMinutes = updated && Number.isFinite(updated.getTime()) ? Math.max(0, Math.floor((Date.now() - updated.getTime()) / 60_000)) : undefined;
  const freshness = ageMinutes === undefined ? "versheid onbekend" : ageMinutes < 15 ? "recent" : ageMinutes < 1_440 ? `${Math.floor(ageMinutes / 60)} uur oud` : `${Math.floor(ageMinutes / 1_440)} dagen oud`;
  const updateText = updated && Number.isFinite(updated.getTime())
    ? `bijgewerkt ${updated.toLocaleDateString("nl-BE")} ${updated.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })} · ${freshness}`
    : "update en versheid onbekend";
  return `Bron: ${source} · ${updateText}`;
}

function periodContext(status: "running" | "completed" | undefined, label: string): string {
  if (status === "running") return `Lopende ${label.toLowerCase()}`;
  if (status === "completed") return `Afgesloten ${label.toLowerCase()}`;
  return `Periodestatus voor ${label.toLowerCase()} niet gemapt`;
}

function energyKwh(state: StateLike | undefined): number | undefined {
  const value = Number(state?.state);
  const unit = state?.attributes?.unit_of_measurement;
  if (!Number.isFinite(value) || typeof unit !== "string") return undefined;
  if (unit === "Wh") return value / 1000;
  if (unit === "kWh") return value;
  if (unit === "MWh") return value * 1000;
  return undefined;
}


function actionable(state: StateLike | undefined): boolean {
  return Boolean(state?.state && !["unknown", "unavailable"].includes(state.state));
}

function entityIcon(entity: string, state?: StateLike): string {
  const configuredIcon = state?.attributes?.icon;
  if (typeof configuredIcon === "string" && configuredIcon) return configuredIcon;
  const domain = entity.split(".")[0] ?? "";
  const icons: Record<string, string> = {
    light: "mdi:lightbulb-outline", cover: "mdi:window-shutter", climate: "mdi:thermostat", media_player: "mdi:speaker",
    camera: "mdi:cctv", binary_sensor: "mdi:shield-check-outline", sensor: "mdi:gauge", switch: "mdi:toggle-switch-outline"
  };
  return icons[domain] ?? "mdi:devices";
}

function roleFallback(role: DeviceRole, index = 0): string {
  const labels: Record<DeviceRole, string> = {
    light: "Verlichting", cover: "Cover", climate: "Klimaat", media: "Media", comfort: "Comfortsensor",
    safety: "Veiligheid", camera: "Camera", power: "Energie", history: "Historie"
  };
  return index > 0 ? `${labels[role]} ${index + 1}` : labels[role];
}

function percentAttribute(state: StateLike | undefined, key: string): number | undefined {
  const value = numberAttribute(state, key);
  if (value === undefined) return undefined;
  return Math.round(key === "brightness" ? (value / 255) * 100 : value);
}

function deviceValue(state: StateLike | undefined, role: DeviceRole): string {
  if (!state || state.state === "unavailable" || state.state === "unknown") return stateText(state);
  if (role === "light" && state.state === "on") {
    const brightness = percentAttribute(state, "brightness");
    return brightness === undefined ? "Aan" : `Aan · ${brightness}%`;
  }
  if (role === "cover") {
    const position = percentAttribute(state, "current_position");
    return position === undefined ? stateText(state) : `${stateText(state)} · ${position}%`;
  }
  if (role === "climate") {
    const current = numberAttribute(state, "current_temperature");
    const target = numberAttribute(state, "temperature");
    if (current !== undefined && target !== undefined) return `${current} °C · doel ${target} °C`;
    if (current !== undefined) return `${current} °C · ${stateText(state)}`;
  }
  if (role === "media" && state.state === "playing") {
    const title = state.attributes?.media_title;
    const source = state.attributes?.source;
    if (typeof title === "string" && title) return `Speelt · ${title}`;
    if (typeof source === "string" && source) return `Speelt · ${source}`;
  }
  return stateText(state);
}

function deviceTone(state: StateLike | undefined, role: DeviceRole): DevicePresentation["tone"] {
  if (!state || ["unknown", "unavailable"].includes(state.state ?? "")) return "unavailable";
  if (role === "safety" && ["on", "open", "problem", "unsafe", "unlocked"].includes(state.state ?? "")) return "warning";
  if (
    (role === "light" && state.state === "on") ||
    (role === "cover" && ["open", "opening", "closing"].includes(state.state ?? "")) ||
    (role === "media" && state.state === "playing") ||
    (role === "climate" && !["off", "idle"].includes(state.state ?? ""))
  ) return "active";
  return "normal";
}

function devicePresentation(hass: HomeAssistantLike | undefined, entity: string, role: DeviceRole, index = 0): DevicePresentation {
  const state = hass?.states?.[entity];
  return {
    entity,
    icon: entityIcon(entity, state),
    label: friendlyName(state, roleFallback(role, index)),
    value: deviceValue(state, role),
    tone: deviceTone(state, role)
  };
}


export function getRoomMetric(hass: HomeAssistantLike | undefined, room: RoomConfig): string {
  const operationalEntities = [...room.light_entities, ...(room.light_switch_entities ?? []), ...room.cover_entities, room.hvac.entity, ...room.media_entities, ...room.safety_entities].filter(Boolean);
  const states = operationalEntities.map((entity) => hass?.states?.[entity]);
  if (states.some((state) => state?.state === "unavailable")) return "Deels offline";
  const openCovers = room.cover_entities.filter((entity) => ["open", "opening"].includes(hass?.states?.[entity]?.state ?? ""));
  if (openCovers.length > 0) return openCovers.length === 1 ? "1 opening geopend" : `${openCovers.length} openingen geopend`;
  const lightsOn = [...room.light_entities, ...(room.light_switch_entities ?? [])].filter((entity) => hass?.states?.[entity]?.state === "on").length;
  if (lightsOn > 0) return lightsOn === 1 ? "1 lamp aan" : `${lightsOn} lampen aan`;
  const climate = room.hvac.entity ? hass?.states?.[room.hvac.entity] : undefined;
  const currentTemperature = numberAttribute(climate, "current_temperature");
  if (currentTemperature !== undefined) return `${currentTemperature} °C`;
  const comfort = room.hvac.comfort_entities[0];
  if (comfort) return stateText(hass?.states?.[comfort]);
  return "Normaal";
}


function resolveFloorName(hass: HomeAssistantLike | undefined, floorId: string, fallbackIndex: number): string {
  if (!floorId) return "Overige ruimtes";
  const floors = hass?.floors;
  if (Array.isArray(floors)) {
    const floor = floors.find((candidate) => candidate.floor_id === floorId || candidate.id === floorId);
    if (floor?.name) return floor.name;
  } else if (floors?.[floorId]?.name) return floors[floorId].name ?? `Verdieping ${fallbackIndex + 1}`;
  return `Verdieping ${fallbackIndex + 1}`;
}

function icon(name: string): HTMLElement {
  const element = document.createElement("ha-icon") as HTMLElement & { icon?: string };
  element.icon = name || "mdi:sofa-outline";
  return element;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", text = ""): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

function group(title: string, content: HTMLElement): HTMLElement {
  const section = element("section", "group");
  const heading = element("header", "group-heading");
  heading.append(element("strong", "", title));
  section.append(heading, content);
  return section;
}

abstract class RoomCardBase<TConfig> extends HTMLElementBase {
  protected config?: TConfig;
  protected currentHass?: HomeAssistantLike;
  protected signature = "";

  public constructor() {
    super();
    this.attachShadow?.({ mode: "open" });
  }

  public getCardSize(): number {
    return 4;
  }

  public getGridOptions(): Record<string, unknown> {
    return { columns: "full", rows: "auto", min_columns: 6 };
  }
}

export class HomeDashboardRoomOverview extends RoomCardBase<RoomOverviewConfig> {
  public setConfig(config: RoomOverviewConfig): void {
    if (!Array.isArray(config.rooms)) throw new Error("Kamers ontbreken.");
    this.config = { ...config, rooms: config.rooms.filter((room) => room.key && room.name) };
    applyDashboardPalette(this, config.palette, config.theme_mode);
    this.signature = "";
    this.render();
  }

  public set hass(value: HomeAssistantLike) {
    this.currentHass = value;
    this.shadowRoot?.querySelectorAll<HomeDashboardRoomControls>("home-dashboard-room-controls").forEach(card => { card.hass = value; });
  }

  public connectedCallback(): void {
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot || !this.config) return;
    const style = document.createElement("style");
    style.textContent = `
      ${roomStyles}.overview{display:grid;gap:20px}.count{display:grid;text-align:right}.count strong{font-size:2rem}.count span{font-size:.78rem;opacity:.8}
      .floor{display:grid;gap:10px}.floor-heading{display:grid;gap:2px;padding-inline:2px}.floor-heading h3{margin:0;font-size:1.25rem}.floor-heading span{font-size:.82rem;color:var(--secondary-text-color)}.room-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      @media(max-width:700px){.hero{padding:18px}.hero h2{font-size:1.45rem}.hero p{display:none}.room-grid{grid-template-columns:1fr}.room-main{grid-template-columns:40px minmax(0,1fr) auto 20px}.metric{max-width:110px;overflow:hidden;text-overflow:ellipsis}}
    `;
    const root = document.createElement("div");
    root.className = "overview";
    const hero = document.createElement("section");
    hero.className = "hero";
    const heroCopy = document.createElement("div");
    heroCopy.className = "hero-copy";
    const eyebrow = document.createElement("span");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Alle echte ruimtes";
    const title = document.createElement("h2");
    title.textContent = "Kamers";
    const description = document.createElement("p");
    description.textContent = "Gegroepeerd per verdieping, met primaire status en een afzonderlijk detailpad.";
    heroCopy.append(eyebrow, title, description);
    const count = document.createElement("div");
    count.className = "count";
    const countValue = document.createElement("strong");
    countValue.textContent = String(this.config.rooms.length);
    const countLabel = document.createElement("span");
    countLabel.textContent = "ruimtes";
    count.append(countValue, countLabel);
    hero.append(heroCopy, count);
    root.append(hero);

    const floorIds = [...new Set(this.config.rooms.map((room) => room.floor_id || ""))];
    floorIds.forEach((floorId, floorIndex) => {
      const section = document.createElement("section");
      section.className = "floor";
      const heading = document.createElement("div");
      heading.className = "floor-heading";
      const headingTitle = document.createElement("h3");
      headingTitle.textContent = resolveFloorName(this.currentHass, floorId, floorIndex);
      const headingCopy = document.createElement("span");
      headingCopy.textContent = "Dagelijkse status en functies";
      heading.append(headingTitle, headingCopy);
      const grid = document.createElement("div");
      grid.className = "room-grid";
      for (const room of this.config?.rooms.filter((candidate) => (candidate.floor_id || "") === floorId) ?? []) {
        const article = document.createElement("home-dashboard-room-controls") as HomeDashboardRoomControls;
        article.setConfig({ room, show_controls: this.config?.show_controls !== false });
        if (this.currentHass) article.hass = this.currentHass;
        grid.append(article);
      }
      section.append(heading, grid);
      root.append(section);
    });
    this.shadowRoot.replaceChildren(style, root);
  }
}

export class HomeDashboardRoomDetail extends RoomCardBase<RoomDetailConfig> {
  private generation = 0;
  private actionSequence = 0;
  private pendingActions = new Set<string>();
  private actionFeedback = new Map<string, { tone: "pending" | "success" | "error"; message: string; sequence: number }>();
  private activeDetailTab: "controls" | "devices" | "energy" | "history" = "controls";
  private activeEnergyPeriod: "day" | "month" | "year" = "day";
  private activeCapability: RoomConfig["capabilities"][number] | "devices" | undefined;

  public setConfig(config: RoomDetailConfig): void {
    if (!config.room?.key) throw new Error("Kamer ontbreekt.");
    this.disconnectedCallback();
    this.config = config;
    this.activeDetailTab = "controls";
    this.activeEnergyPeriod = "day";
    this.activeCapability = undefined;
    this.pendingActions.clear();
    this.actionFeedback.clear();
    applyDashboardPalette(this, config.palette, config.theme_mode);
    this.signature = "";
    this.render();
  }

  public set hass(value: HomeAssistantLike) {
    this.currentHass = value;
    const next = this.config ? stateSignature(value, this.config.room) : "";
    if (next !== this.signature) {
      this.signature = next;
      this.render(true);
    }
    this.shadowRoot?.querySelectorAll<LovelaceCardElement>(".embedded-card > *").forEach(card => { card.hass = value; });
  }

  public connectedCallback(): void { this.render(); }
  public disconnectedCallback(): void { this.generation++; this.pendingActions.clear(); this.shadowRoot?.querySelectorAll("dialog").forEach(dialog => dialog.remove()); }

  private actionKey(entity: string, kind: DetailKind, command: DetailCommand): string {
    return `${kind}:${entity}:${command}`;
  }

  private planAction(entity: string, kind: DetailKind, command: DetailCommand, data: Record<string, unknown> = {}): DetailPlan | undefined {
    const room = this.config?.room;
    const hass = this.currentHass;
    if (!room || !hass?.callService) return undefined;
    if (kind === "climate") {
      const temperature = data.temperature;
      const features = Number(hass.states?.[entity]?.attributes?.supported_features ?? 0);
      return actionable(hass.states?.[entity]) && (features & 1) !== 0 && room.controls_enabled === true && room.hvac.entity === entity && entity.startsWith("climate.") && command === "set_temperature" && typeof temperature === "number" && Number.isFinite(temperature)
        ? { entity, domain: "climate", service: "set_temperature", data }
        : undefined;
    }
    if (kind === "plug") {
      const plug = room.smart_plugs?.find(candidate => candidate.switch_entity === entity);
      const state = hass.states?.[entity]?.state;
      return room.controls_enabled === true && plug && !plug.protected && entity.startsWith("switch.") && command === "toggle" && ["on", "off"].includes(state ?? "")
        ? { entity, domain: "switch", service: state === "on" ? "turn_off" : "turn_on", data }
        : undefined;
    }
    if (command === "set_temperature") return undefined;
    const controlRoom = kind === "light"
      ? { ...room, light_entities: [...new Set([...room.light_entities, ...(room.light_groups ?? []).flatMap((groupConfig) => [groupConfig.control_entity, ...groupConfig.member_entities])])] }
      : kind === "cover"
        ? { ...room, cover_entities: [...new Set([...room.cover_entities, ...(room.cover_controls ?? []).map((coverConfig) => coverConfig.entity)])] }
        : room;
    const plan = planEntityControl(controlRoom, hass, entity, kind, command);
    return plan ? { entity: plan.entity, domain: plan.domain, service: plan.service, data } : undefined;
  }

  private callService(entity: string, kind: DetailKind, command: DetailCommand, data: Record<string, unknown> = {}): void {
    const plan = this.planAction(entity, kind, command, data);
    const hass = this.currentHass;
    const generation = this.generation;
    const sequence = ++this.actionSequence;
    const roomKey = this.config?.room.key;
    const actionKey = this.actionKey(entity, kind, command);
    if (!plan || !hass?.callService || this.pendingActions.has(actionKey)) return;
    this.pendingActions.add(actionKey);
    this.actionFeedback.set(actionKey, { tone: "pending", message: "Bediening wordt uitgevoerd…", sequence });
    this.render(true);
    let request: Promise<unknown>;
    try {
      request = hass.callService(plan.domain, plan.service, { ...plan.data, entity_id: plan.entity });
    } catch {
      request = Promise.reject();
    }
    void request.then(() => {
      this.pendingActions.delete(actionKey);
      if (generation !== this.generation || roomKey !== this.config?.room.key || !this.isConnected) return;
      this.actionFeedback.set(actionKey, { tone: "success", message: "Bediening bevestigd door Home Assistant.", sequence });
      this.render(true);
    }, () => {
      this.pendingActions.delete(actionKey);
      if (generation !== this.generation || roomKey !== this.config?.room.key || !this.isConnected) return;
      this.actionFeedback.set(actionKey, { tone: "error", message: "Bediening mislukt. Controleer de toestand en probeer opnieuw.", sequence });
      this.render(true);
    });
  }

  private command(label: string, entity: string, kind: DetailKind, command: DetailCommand, data: Record<string, unknown> = {}): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "command";
    button.textContent = label;
    button.dataset.controlKey = `${kind}:${entity}:${command}`;
    button.disabled = this.pendingActions.has(this.actionKey(entity, kind, command)) || !this.planAction(entity, kind, command, data);
    button.addEventListener("click", () => this.callService(entity, kind, command, data));
    return button;
  }

  private confirmedCommand(label: string, entity: string, command: "open" | "close"): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "command";
    button.textContent = label;
    button.dataset.controlKey = `cover:${entity}:${command}`;
    button.disabled = this.pendingActions.has(this.actionKey(entity, "cover", command)) || !this.planAction(entity, "cover", command);
    let armed = false;
    const reset = (): void => {
      armed = false;
      button.textContent = label;
      button.setAttribute("aria-label", `${label} ${friendlyName(this.currentHass?.states?.[entity], entity)}`);
    };
    button.addEventListener("click", () => {
      if (!armed) {
        armed = true;
        button.textContent = `Bevestig ${label.toLowerCase()}`;
        button.setAttribute("aria-label", `Bevestig ${label.toLowerCase()} ${friendlyName(this.currentHass?.states?.[entity], entity)}`);
        return;
      }
      this.callService(entity, "cover", command);
      reset();
    });
    return button;
  }

  private informationGroup(titleText: string, sources: Array<[string, DeviceRole]>, keyPrefix = titleText): HTMLElement | undefined {
    const unique = sources.filter(([entity]) => entity);
    if (!unique.length) return undefined;
    const list = element("div", "info-list");
    unique.forEach(([entity, role], index) => {
      const presentation = devicePresentation(this.currentHass, entity, role, index);
      const row = document.createElement(titleText === "Historie" ? "button" : "div"); row.className = `${titleText === "Historie" ? "history-card" : "info"} ${presentation.tone}`;
      row.setAttribute("aria-label", `${presentation.label}: ${presentation.value}`);
      row.textContent = `${presentation.label} · ${presentation.value}`;
      if (titleText === "Historie") {
        (row as HTMLButtonElement).type = "button";
        row.dataset.historyEntity = entity;
        row.dataset.controlKey = `${keyPrefix}:${entity}:${index}`;
        row.addEventListener("click", () => this.openHistory(entity, row.dataset.controlKey!));
      }
      list.append(row);
    });
    return group(titleText, list);
  }

  private mushroomCard(entity: string, role: DeviceRole, actions: HTMLButtonElement[] = [], toggle = false): HTMLElement {
    const state = this.currentHass?.states?.[entity];
    const presentation = devicePresentation(this.currentHass, entity, role);
    const card = document.createElement(toggle ? "button" : "section");
    card.className = `mushroom-card ${role}-card ${presentation.tone}`;
    if (toggle) {
      (card as HTMLButtonElement).type = "button";
      card.dataset.controlKey = `light:${entity}:toggle`;
      (card as HTMLButtonElement).disabled = this.pendingActions.has(this.actionKey(entity, "light", "toggle")) || !this.planAction(entity, "light", "toggle");
      card.setAttribute("aria-label", `${presentation.label}: ${presentation.value}. Schakel`);
      card.addEventListener("click", () => this.callService(entity, "light", "toggle"));
    }
    const symbol = element("span", "mushroom-icon"); symbol.append(icon(presentation.icon));
    const copy = element("span", "mushroom-copy");
    const name = element("strong", "", presentation.label);
    const value = element("small", "", presentation.value);
    copy.append(name, value); card.append(symbol, copy);
    if (actions.length) {
      const controls = element("div", "commands");
      actions.forEach((action) => action.setAttribute("aria-label", `${action.textContent} ${presentation.label}`));
      controls.append(...actions); card.append(controls);
    }
    return card;
  }

  private lightGroupCard(groupConfig: NonNullable<RoomConfig["light_groups"]>[number]): HTMLElement {
    const state = resolveLightGroupState(this.currentHass?.states ?? {}, groupConfig.member_entities);
    const labels: Record<LightGroupState, string> = { off: "Uit", on: "Aan", partial: "Gedeeltelijk aan", unknown: "Onbekend", unavailable: "Niet beschikbaar" };
    const card = document.createElement("button");
    card.type = "button";
    card.className = `mushroom-card light-card light-group-card ${state === "on" || state === "partial" ? "active" : state}`;
    card.dataset.controlKey = `light:${groupConfig.control_entity}:toggle`;
    card.disabled = state === "unknown" || state === "unavailable" || this.pendingActions.has(this.actionKey(groupConfig.control_entity, "light", "toggle")) || !this.planAction(groupConfig.control_entity, "light", "toggle");
    card.setAttribute("aria-label", `${groupConfig.name}: ${labels[state]}. Schakel groep van ${groupConfig.member_entities.length} lampen`);
    card.addEventListener("click", () => this.callService(groupConfig.control_entity, "light", "toggle"));
    const symbol = element("span", "mushroom-icon"); symbol.append(icon("mdi:lightbulb-group-outline"));
    const copy = element("span", "mushroom-copy");
    copy.append(element("strong", "", groupConfig.name), element("small", "status", labels[state]), element("small", "scope", `${groupConfig.member_entities.length} lampen`));
    card.append(symbol, copy);
    return card;
  }

  private coverCard(coverConfig: NonNullable<RoomConfig["cover_controls"]>[number]): HTMLElement {
    const extendedLabels = coverConfig.kind === "awning" || coverConfig.kind === "screen";
    const openLabel = extendedLabels ? "Uit" : "Open";
    const closeLabel = extendedLabels ? "In" : "Dicht";
    const action = (label: string, command: "open" | "close") => coverConfig.confirmation === "movement"
      ? this.confirmedCommand(label, coverConfig.entity, command)
      : this.command(label, coverConfig.entity, "cover", command);
    return this.mushroomCard(coverConfig.entity, "cover", [action(openLabel, "open"), this.command("Stop", coverConfig.entity, "cover", "stop"), action(closeLabel, "close")]);
  }

  private mushroomControls(room: RoomConfig): HTMLElement | undefined {
    const controls = element("div", "mushroom-controls");
    const add = (capability: RoomConfig["capabilities"][number], title: string, cards: HTMLElement[]): void => {
      if (!cards.length) return;
      const grid = element("div", "mushroom-grid"); grid.append(...cards);
      const section = group(title, grid);
      section.dataset.capabilitySection = capability;
      controls.append(section);
    };
    const groupTargets = new Set((room.light_groups ?? []).map((groupConfig) => groupConfig.control_entity));
    add("lights", "Verlichting", [
      ...(room.light_groups ?? []).map((groupConfig) => this.lightGroupCard(groupConfig)),
      ...[...room.light_entities, ...(room.light_switch_entities ?? [])].filter((entity) => !groupTargets.has(entity)).map((entity) => this.mushroomCard(entity, "light", [], true))
    ]);
    const typedCovers = new Set((room.cover_controls ?? []).map((coverConfig) => coverConfig.entity));
    add("covers", "Openingen", [
      ...(room.cover_controls ?? []).map((coverConfig) => this.coverCard(coverConfig)),
      ...room.cover_entities.filter((entity) => !typedCovers.has(entity)).map((entity) => this.mushroomCard(entity, "cover", [this.confirmedCommand("Open", entity, "open"), this.command("Stop", entity, "cover", "stop"), this.confirmedCommand("Dicht", entity, "close")]))
    ]);
    if (room.hvac.entity) {
      const target = numberAttribute(this.currentHass?.states?.[room.hvac.entity], "temperature");
      add("climate", "Klimaat", [this.mushroomCard(room.hvac.entity, "climate", target === undefined ? [] : [this.command("− 0,5°", room.hvac.entity, "climate", "set_temperature", { temperature: target - .5 }), this.command("+ 0,5°", room.hvac.entity, "climate", "set_temperature", { temperature: target + .5 })])]);
    }
    add("media", "Media", room.media_entities.map((entity) => this.mushroomCard(entity, "media", [this.command(this.currentHass?.states?.[entity]?.state === "playing" ? "Pauze" : "Speel", entity, "media", "toggle")] )));
    return controls.childElementCount ? controls : undefined;
  }

  private smartPlugCard(plug: NonNullable<RoomConfig["smart_plugs"]>[number]): HTMLElement {
    const card = element("section", `smart-plug-card mushroom-card${plug.protected ? " protected" : ""}`);
    const state = this.currentHass?.states?.[plug.switch_entity];
    const title = element("strong", "", plug.name || friendlyName(state, "Smart plug"));
    const values = document.createElement("small");
    values.textContent = [plug.power_entity, plug.energy_entity, plug.voltage_entity].filter(Boolean).map(entity => stateText(this.currentHass?.states?.[entity])).join(" · ") || stateText(state);
    const lock = document.createElement("button"); lock.type = "button"; lock.className = "plug-lock"; lock.textContent = plug.protected ? "Beveiligd apparaat" : "Ontgrendel om te schakelen";
    const confirm = document.createElement("button"); confirm.type = "button"; confirm.className = "command"; confirm.hidden = true;
    lock.dataset.controlKey = `plug:${plug.switch_entity}:unlock`;
    confirm.dataset.controlKey = `plug:${plug.switch_entity}:confirm`;
    lock.disabled = confirm.disabled = plug.protected === true || this.pendingActions.has(this.actionKey(plug.switch_entity, "plug", "toggle")) || !this.planAction(plug.switch_entity, "plug", "toggle");
    lock.addEventListener("click", () => { confirm.hidden = false; confirm.textContent = state?.state === "on" ? "Bevestig uitschakelen" : "Bevestig inschakelen"; lock.textContent = "Bevestiging vereist"; });
    confirm.addEventListener("click", () => {
      this.callService(plug.switch_entity, "plug", "toggle");
      confirm.hidden = true;
      lock.textContent = "Ontgrendel om te schakelen";
      lock.focus();
    });
    card.append(title, values);
    if (plug.protected) card.append(element("small", "protection-reason", plug.protection_reason || "Bediening is voor dit apparaat uitgeschakeld."));
    card.append(lock, confirm); return card;
  }

  private energyPeriodGroup(room: RoomConfig): HTMLElement | undefined {
    const configured = Boolean(room.room_energy && Object.values(room.room_energy).some(Boolean)) || (room.smart_plugs ?? []).some((plug) => plug.energy_day_entity || plug.energy_month_entity || plug.energy_year_entity);
    if (!configured) return undefined;
    const wrapper = element("div", "energy-period energy-period-card");
    const periods = [["day", "Vandaag"], ["month", "Maand"], ["year", "Jaar"]] as const;
    const periodLabel = periods.find(([period]) => period === this.activeEnergyPeriod)?.[1] ?? "Periode";
    const selector = element("div", "period-selector");
    selector.setAttribute("role", "group");
    selector.setAttribute("aria-label", "Energieperiode");
    periods.forEach(([period, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.setAttribute("aria-pressed", String(this.activeEnergyPeriod === period));
      button.dataset.controlKey = `energy-period:${period}`;
      button.addEventListener("click", () => { this.activeEnergyPeriod = period; this.render(true); });
      selector.append(button);
    });
    const grid = element("div", "energy-grid");
    const roomEntity = this.activeEnergyPeriod === "day" ? room.room_energy?.day_entity : this.activeEnergyPeriod === "month" ? room.room_energy?.month_entity : room.room_energy?.year_entity;
    const roomPeriod = this.activeEnergyPeriod === "day" ? room.room_energy?.day_period : this.activeEnergyPeriod === "month" ? room.room_energy?.month_period : room.room_energy?.year_period;
    if (room.room_energy?.power_entity || roomEntity) {
      const card = element("article", "info energy-card");
      const roomState = roomEntity ? this.currentHass?.states?.[roomEntity] : undefined;
      card.append(
        element("strong", "", `${room.name} totaal`),
        element("small", "", [room.room_energy?.power_entity ? stateText(this.currentHass?.states?.[room.room_energy.power_entity]) : "", roomEntity ? stateText(roomState) : "Niet geconfigureerd"].filter(Boolean).join(" · ")),
        element("small", "energy-period-context", periodContext(roomPeriod, periodLabel)),
        element("small", "energy-source-context", roomEntity ? sourceContext(roomState, `${room.name} energie`) : "Bron: niet geconfigureerd")
      );
      grid.append(card);
    }
    const comparisons: Array<{ name: string; value: number; source: string }> = [];
    (room.smart_plugs ?? []).forEach((plug) => {
      const entity = this.activeEnergyPeriod === "day" ? plug.energy_day_entity : this.activeEnergyPeriod === "month" ? plug.energy_month_entity : plug.energy_year_entity;
      const plugPeriod = this.activeEnergyPeriod === "day" ? plug.energy_day_period : this.activeEnergyPeriod === "month" ? plug.energy_month_period : plug.energy_year_period;
      if (!entity) return;
      const state = this.currentHass?.states?.[entity];
      const card = element("article", "info energy-card");
      card.append(
        element("strong", "", plug.name),
        element("small", "", stateText(state)),
        element("small", "energy-period-context", periodContext(plugPeriod, periodLabel)),
        element("small", "energy-source-context", sourceContext(state, `${plug.name} energie`))
      );
      grid.append(card);
      const value = energyKwh(state);
      if (value !== undefined) comparisons.push({ name: plug.name, value, source: friendlyName(state, `${plug.name} energie`) });
    });
    wrapper.append(selector, grid.childElementCount ? grid : element("p", "info unavailable", "Geen bron voor deze periode geconfigureerd."));
    if (comparisons.length > 1) {
      const maximum = Math.max(...comparisons.map((entry) => entry.value), 0);
      const figure = element("figure", "energy-comparison");
      figure.setAttribute("role", "img");
      figure.setAttribute("aria-label", `Apparaatvergelijking voor ${periodLabel.toLowerCase()} in kilowattuur. Schaal nul tot ${maximum.toLocaleString("nl-BE")} kilowattuur. ${comparisons.map((entry) => `${entry.name} ${entry.value.toLocaleString("nl-BE")} kilowattuur`).join("; ")}.`);
      figure.append(element("figcaption", "", `Apparaatvergelijking · ${periodLabel} · kWh`), element("small", "energy-scale", `Schaal 0–${maximum.toLocaleString("nl-BE")} kWh · periodestatus per bron`));
      const bars = element("div", "energy-bars");
      comparisons.forEach((entry) => {
        const row = element("div", "energy-bar-row");
        const label = element("span", "energy-bar-label", entry.name);
        const track = element("span", "energy-bar-track");
        const bar = element("span", "energy-bar");
        bar.style.setProperty("--energy-share", `${maximum > 0 ? Math.max((entry.value / maximum) * 100, 2) : 0}%`);
        track.append(bar);
        row.append(label, track, element("strong", "energy-bar-value", `${entry.value.toLocaleString("nl-BE")} kWh`));
        row.title = `Bron: ${entry.source}`;
        bars.append(row);
      });
      figure.append(bars, element("small", "energy-comparison-note", "Vergelijking van afzonderlijk gemapte apparaatbronnen; niet optellen tot een woningtotaal."));
      wrapper.append(figure);
    }
    return group("Kamerenergie", wrapper);
  }

  private openHistory(entity: string, controlKey: string): void {
    const dialog = element("dialog", "history-dialog");
    dialog.setAttribute("aria-label", `Historie ${friendlyName(this.currentHass?.states?.[entity], "bron")}`);
    const close = document.createElement("button"); close.type = "button"; close.className = "command"; close.textContent = "Sluiten";
    const graph = element("div", "embedded-card");
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      dialog.remove();
      Array.from(this.shadowRoot?.querySelectorAll<HTMLElement>("[data-control-key]") ?? []).find(control => control.dataset.controlKey === controlKey)?.focus();
    });
    dialog.append(close, graph); this.shadowRoot?.append(dialog); dialog.showModal();
    void this.mountCard(graph, { type: "history-graph", entities: [entity], hours_to_show: 24 });
  }

  private async mountCard(host: HTMLElement, config: Record<string, unknown>): Promise<void> {
    try {
      const helpers = await window.loadCardHelpers?.();
      if (!this.isConnected || !host.isConnected) return;
      if (!helpers) throw new Error();
      const card = helpers.createCardElement(config); card.hass = this.currentHass; host.replaceChildren(card);
    } catch {
      if (host.isConnected) host.textContent = "Kaart niet beschikbaar.";
    }
  }


  private render(preserveFocus = false): void {
    if (!this.shadowRoot || !this.config) return;
    const focusKey = preserveFocus ? (this.shadowRoot.activeElement as HTMLElement | null)?.dataset.controlKey : undefined;
    const sourceRoom = this.config.room;
    const selectedControls = sourceRoom.control_entities ?? [];
    const room = { ...sourceRoom,
      light_entities: [...new Set([...sourceRoom.light_entities, ...(sourceRoom.light_groups ?? []).flatMap((groupConfig) => [groupConfig.control_entity, ...groupConfig.member_entities]), sourceRoom.control_light_entity, ...selectedControls.filter(entity => entity.startsWith("light."))].filter((value): value is string => Boolean(value)))],
      light_switch_entities: [...new Set(sourceRoom.light_switch_entities ?? [])],
      cover_entities: [...new Set([...sourceRoom.cover_entities, ...(sourceRoom.cover_controls ?? []).map((coverConfig) => coverConfig.entity), sourceRoom.control_cover_entity, sourceRoom.control_awning_entity, ...selectedControls.filter(entity => entity.startsWith("cover."))].filter((value): value is string => Boolean(value)))],
      media_entities: [...new Set([...sourceRoom.media_entities, sourceRoom.control_media_entity, ...selectedControls.filter(entity => entity.startsWith("media_player."))].filter((value): value is string => Boolean(value)))]
    };
    const style = document.createElement("style");
    style.textContent = `
      ${roomStyles}
      .detail,.control-deck,.room-layout-primary,.room-column,.mushroom-controls,.group,.detail-panel{display:grid;gap:18px;min-width:0;align-content:start}.detail{width:100%}.control-deck{grid-template-columns:minmax(150px,.24fr) minmax(0,1fr);gap:12px}.capability-rail{display:grid;gap:7px;align-content:start}.capability-rail button,.detail-tabs button{min-height:44px;border:1px solid var(--divider-color);border-radius:11px;padding:9px 12px;background:var(--room-surface);color:var(--primary-text-color);font:inherit;text-align:left}.capability-rail button[aria-pressed=true],.detail-tabs button[aria-selected=true]{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,var(--room-surface));color:var(--primary-color);font-weight:700}.deck-content{display:grid;gap:12px;min-width:0}.detail-tabs{display:flex;gap:7px;overflow-x:auto}.detail-tabs button{flex:1 0 auto;text-align:center}.detail-panel[hidden]{display:none}.room-layout-primary{grid-template-columns:1.2fr .8fr .7fr}.group{gap:10px}.group-heading{min-height:32px;display:flex;align-items:center}
      .info-list,.mushroom-grid,.plug-grid,.energy-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:9px}.energy-period{display:grid;gap:10px}.period-selector{display:flex;gap:7px;flex-wrap:wrap}.period-selector button{min-height:44px;padding:8px 13px;border:1px solid var(--divider-color);border-radius:999px;background:var(--room-surface);color:inherit}.period-selector button[aria-pressed=true]{border-color:var(--primary-color);background:var(--primary-color);color:var(--text-primary-color,#fff);font-weight:700}.energy-card{display:grid;gap:4px}.energy-comparison{display:grid;gap:9px;margin:0;padding:12px;border:1px solid var(--divider-color);border-radius:12px;background:var(--room-surface)}.energy-comparison figcaption{font-weight:700}.energy-bars{display:grid;gap:8px}.energy-bar-row{display:grid;grid-template-columns:minmax(90px,.7fr) minmax(100px,1.4fr) auto;gap:8px;align-items:center}.energy-bar-track{height:12px;border-radius:999px;background:var(--secondary-background-color);overflow:hidden}.energy-bar{display:block;width:var(--energy-share);height:100%;border-radius:inherit;background:var(--primary-color)}.energy-bar-value{font-variant-numeric:tabular-nums}.action-feedback{margin:0;padding:10px 12px;border:1px solid var(--divider-color);border-radius:12px;background:var(--room-surface)}.action-feedback.pending{border-color:var(--primary-color)}.action-feedback.success{border-color:var(--success-color,#2e7d32)}.action-feedback.error{border-color:var(--error-color,#b3261e)}
      .info,.history-card,.mushroom-card,.command,.plug-lock,.history-dialog{background:var(--room-surface);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:12px;padding:10px;font:inherit;overflow-wrap:anywhere}.info,.history-card,.mushroom-card{text-align:left}.warning{border-color:var(--error-color,#b3261e)}.unavailable{opacity:.72}
      button{cursor:pointer;min-height:44px;min-width:44px}button:disabled{cursor:default;opacity:.48;background:var(--secondary-background-color)}button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.mushroom-card{display:grid;grid-template-columns:40px minmax(0,1fr);gap:10px;align-items:center;min-height:76px;padding:12px;border-radius:16px}.light-card.active{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,var(--room-surface))}.mushroom-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--secondary-background-color);color:var(--primary-color)}.mushroom-copy{display:grid;gap:2px}small{color:var(--secondary-text-color)}.commands{grid-column:1/-1}.smart-plug-card{grid-template-columns:minmax(0,1fr)}.plug-lock{color:var(--primary-color);font-weight:700}
      .room-photo{width:110px;min-height:96px;border-radius:16px;background:linear-gradient(135deg,#ffffff33,transparent),var(--hd-hero);background-size:cover;background-position:center;flex:none}.embedded-card{min-height:120px}.embedded-card:empty::before{content:"Kaart wordt geladen…"}.history-dialog{box-sizing:border-box;width:min(720px,calc(100% - 32px));padding:16px;border:0;border-radius:18px}.history-dialog::backdrop{background:#0007}
      @media(max-width:1100px){.control-deck{grid-template-columns:1fr}.capability-rail{display:flex;overflow-x:auto}.capability-rail button{flex:0 0 auto}.room-layout-primary{grid-template-columns:1fr 1fr}.operations{grid-column:1/-1}.energy{grid-column:auto}}@media(max-width:600px){.hero{align-items:flex-start;flex-direction:column}.room-photo{width:100%;min-height:130px;order:-1}.detail-tabs button{min-width:max-content}.room-layout-primary{grid-template-columns:1fr}.operations,.energy{grid-column:auto}.mushroom-grid,.plug-grid{grid-template-columns:1fr}.energy-bar-row{grid-template-columns:minmax(90px,1fr) 1.2fr}.energy-bar-value{grid-column:1/-1}}
    `;
    const root = element("main", "detail");
    const hero = element("section", "hero");
    const heroCopy = element("div", "hero-copy");
    const eyebrow = element("span", "eyebrow", "Kamer");
    const title = element("h1", "", room.name);
    const subtitle = element("p", "", "Status en bediening per functie.");
    heroCopy.append(eyebrow, title, subtitle);
    const heroPills = element("div", "hero-pills");
    heroPills.append(element("span", "hero-pill", getRoomMetric(this.currentHass, room)));
    hero.append(heroCopy, heroPills);
    const picture = room.image_entity ? this.currentHass?.states?.[room.image_entity]?.attributes?.entity_picture : undefined;
    const photo = element("div", "room-photo");
    if (typeof picture === "string" && picture) {
      photo.setAttribute("role", "img");
      photo.setAttribute("aria-label", `Foto ${room.name}`);
      photo.style.backgroundImage = `url("${picture.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"")}")`;
    } else {
      photo.setAttribute("aria-hidden", "true");
    }
    hero.append(photo);
    root.append(hero);
    [...this.actionFeedback.values()].sort((left, right) => left.sequence - right.sequence).forEach((entry) => {
      const feedback = element("p", `action-feedback ${entry.tone}`, entry.message);
      feedback.setAttribute("role", entry.tone === "error" ? "alert" : "status");
      feedback.setAttribute("aria-live", entry.tone === "error" ? "assertive" : "polite");
      root.append(feedback);
    });

    const deck = element("section", "control-deck");
    const capabilityRail = element("nav", "capability-rail");
    capabilityRail.setAttribute("aria-label", "Kamerfuncties");
    const hasEnergy = Boolean(room.room_energy && Object.values(room.room_energy).some(Boolean)) || (room.smart_plugs ?? []).some((plug) => plug.energy_day_entity || plug.energy_month_entity || plug.energy_year_entity);
    const capabilityLabels: Array<[RoomConfig["capabilities"][number] | "devices", string, "controls" | "devices" | "energy", boolean]> = [
      ["lights", "Verlichting", "controls", room.light_entities.length > 0 || (room.light_switch_entities?.length ?? 0) > 0 || (room.light_groups?.length ?? 0) > 0],
      ["covers", "Openingen", "controls", room.cover_entities.length > 0 || (room.cover_controls?.length ?? 0) > 0],
      ["climate", "Comfort", "controls", Boolean(room.hvac.entity) || room.hvac.comfort_entities.length > 0],
      ["media", "Media", "controls", room.media_entities.length > 0],
      ["security", "Veiligheid", "controls", room.safety_entities.length > 0 || room.camera_entities.length > 0],
      ["devices", "Smart plugs", "devices", (room.smart_plugs?.length ?? 0) > 0],
      ["power", "Energie", "energy", hasEnergy || room.power_entities.length > 0]
    ];
    capabilityLabels.filter(([, , , configured]) => configured).forEach(([capability, label, targetTab]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.controlKey = `capability:${capability}`;
      button.setAttribute("aria-pressed", String(this.activeCapability === capability));
      button.addEventListener("click", () => {
        this.activeCapability = capability;
        this.activeDetailTab = targetTab;
        this.render(true);
        this.shadowRoot?.querySelector<HTMLElement>(`[data-capability-section="${capability}"]`)?.scrollIntoView({ block: "nearest" });
      });
      capabilityRail.append(button);
    });
    const deckContent = element("div", "deck-content");
    const tabs = element("div", "detail-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Kamerdetails");
    const tabDefinitions = [["controls", "Bediening"], ["devices", "Apparaten"], ["energy", "Energie"], ["history", "Historie"]] as const;
    const panels = new Map<(typeof tabDefinitions)[number][0], HTMLElement>();
    tabDefinitions.forEach(([key, label], index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.id = `room-tab-${room.key}-${key}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(this.activeDetailTab === key));
      button.setAttribute("aria-controls", `room-panel-${room.key}-${key}`);
      button.tabIndex = this.activeDetailTab === key ? 0 : -1;
      button.textContent = label;
      button.dataset.controlKey = `tab:${key}`;
      button.addEventListener("click", () => { this.activeCapability = undefined; this.activeDetailTab = key; this.render(true); });
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const current = tabDefinitions.findIndex(([candidate]) => candidate === key);
        const target = event.key === "Home" ? 0 : event.key === "End" ? tabDefinitions.length - 1 : (current + (event.key === "ArrowLeft" ? -1 : 1) + tabDefinitions.length) % tabDefinitions.length;
        const targetKey = tabDefinitions[target]![0];
        this.activeCapability = undefined;
        this.activeDetailTab = targetKey;
        this.render();
        this.shadowRoot?.querySelector<HTMLElement>(`[data-control-key="tab:${targetKey}"]`)?.focus();
      });
      tabs.append(button);
      const panel = element("section", "detail-panel");
      panel.id = `room-panel-${room.key}-${key}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.hidden = this.activeDetailTab !== key;
      panels.set(key, panel);
    });

    const layout = element("div", "room-layout-primary");
    const operations = element("div", "room-column operations");
    const climate = element("div", "room-column climate");
    const energy = element("div", "room-column energy");


    const capabilityCards = this.mushroomControls(room);
    if (capabilityCards) operations.append(capabilityCards);

    const comfort = this.informationGroup("Comfort & klimaat", [[room.hvac.entity, "climate"], ...room.hvac.comfort_entities.map((entity): [string, DeviceRole] => [entity, "comfort"])]);
    const safety = this.informationGroup("Veiligheid", room.safety_entities.map((entity): [string, DeviceRole] => [entity, "safety"]));
    const cameras = this.informationGroup("Camera's", room.camera_entities.map((entity): [string, DeviceRole] => [entity, "camera"]));
    const power = this.informationGroup("Apparaten & energie", room.power_entities.map((entity): [string, DeviceRole] => [entity, "power"]));
    const periodEnergy = this.energyPeriodGroup(room);
    const history = this.informationGroup("Historie", [...room.history_entities, ...room.hvac.history_entities].map((entity): [string, DeviceRole] => [entity, "history"]));
    if (comfort) { comfort.dataset.capabilitySection = "climate"; climate.append(comfort); }
    if (safety) { safety.dataset.capabilitySection = "security"; operations.append(safety); }
    if (cameras) { cameras.dataset.capabilitySection = "security"; operations.append(cameras); }
    if (power) { power.dataset.capabilitySection = "power"; energy.append(power); }
    if (periodEnergy) { periodEnergy.dataset.capabilitySection = "power"; energy.append(periodEnergy); }
    if (history) panels.get("history")?.append(history);

    if ((room.smart_plugs?.length ?? 0) > 0) {
      const grid = element("div", "plug-grid");
      room.smart_plugs?.forEach((plug) => grid.append(this.smartPlugCard(plug)));
      const plugGroup = group("Smart plugs & energie", grid);
      plugGroup.dataset.capabilitySection = "devices";
      panels.get("devices")?.append(plugGroup);
    }

    if (room.temperature_history_entity) panels.get("history")?.append(this.informationGroup("Historie", [[room.temperature_history_entity, "history"]], "Temperatuurhistorie")!);

    if (room.desk && Object.keys(room.desk.card_config).length > 0) {
      const card = element("div", "embedded-card desk-card");
      panels.get("devices")?.append(group("Bureau", card));
      void this.mountCard(card, { ...room.desk.card_config, type: "custom:linak-desk-card" });
    }
    [operations, climate].forEach((column) => { if (column.childElementCount) layout.append(column); });
    if (layout.childElementCount) panels.get("controls")?.append(layout);
    if (energy.childElementCount) panels.get("energy")?.append(energy);
    for (const [key, panel] of panels) {
      if (!panel.childElementCount) panel.append(element("p", "info unavailable", key === "history" ? "Geen historiebronnen geconfigureerd." : "Geen gegevens voor dit onderdeel geconfigureerd."));
    }
    deckContent.append(tabs, ...panels.values());
    deck.append(capabilityRail, deckContent);
    root.append(deck);
    const previous = this.shadowRoot.querySelector("main");
    if (previous) { previous.replaceWith(root); this.shadowRoot.querySelector("style")?.replaceWith(style); }
    else this.shadowRoot.replaceChildren(style, root);
    if (focusKey) Array.from(this.shadowRoot.querySelectorAll<HTMLElement>("[data-control-key]")).find(control => control.dataset.controlKey === focusKey)?.focus();
  }
}

export function registerHomeDashboardRoomCards(): void {
  if (typeof customElements === "undefined" || typeof window === "undefined") return;
  const cards: Array<[string, CustomElementConstructor, string, string]> = [
    ["home-dashboard-room-overview", HomeDashboardRoomOverview, "Home Dashboard Room Overview", "Verdiepingsgewijs kameroverzicht met compacte statuskaarten."],
    ["home-dashboard-room-detail", HomeDashboardRoomDetail, "Home Dashboard Room Detail", "Kamerdetail met directe bediening en status."]
  ];
  window.customCards ??= [];
  for (const [tag, constructor, name, description] of cards) {
    if (!customElements.get(tag)) customElements.define(tag, constructor);
    if (!window.customCards.some((card) => card.type === tag)) window.customCards.push({ type: tag, name, description, preview: true });
  }
}
