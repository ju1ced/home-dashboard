import type { RoomConfig } from "../config/types";

type StateLike = { state?: string; attributes?: Record<string, unknown> };
type HomeAssistantLike = {
  states?: Record<string, StateLike>;
  floors?: Array<{ floor_id?: string; id?: string; name?: string }> | Record<string, { name?: string }>;
};

interface RoomOverviewConfig {
  type: "custom:home-dashboard-room-overview";
  rooms: RoomConfig[];
}

interface RoomDetailConfig {
  type: "custom:home-dashboard-room-detail";
  room: RoomConfig;
}

interface CustomCardMetadata {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
}

type DeviceRole = "light" | "cover" | "climate" | "media" | "comfort" | "safety" | "camera" | "power" | "history";
type DevicePresentation = { entity: string; icon: string; label: string; value: string; tone: "normal" | "active" | "warning" | "unavailable" };

declare global {
  interface Window {
    customCards?: CustomCardMetadata[];
  }
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

export function roomPath(room: Pick<RoomConfig, "key">): string {
  return `room-${room.key.replaceAll("_", "-")}`;
}

function roomEntities(room: RoomConfig): string[] {
  return [...new Set([
    ...room.light_entities,
    ...room.cover_entities,
    room.hvac.entity,
    ...room.hvac.comfort_entities,
    ...room.media_entities,
    ...room.safety_entities,
    ...room.camera_entities,
    ...room.power_entities,
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
      attributes?.swing_mode ?? ""
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

function showMoreInfo(host: HTMLElement, entity: string): void {
  host.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
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

function roomDeviceChips(hass: HomeAssistantLike | undefined, room: RoomConfig): DevicePresentation[] {
  return [
    room.light_entities[0] ? devicePresentation(hass, room.light_entities[0], "light") : undefined,
    room.cover_entities[0] ? devicePresentation(hass, room.cover_entities[0], "cover") : undefined,
    room.hvac.entity ? devicePresentation(hass, room.hvac.entity, "climate") : undefined,
    room.media_entities[0] ? devicePresentation(hass, room.media_entities[0], "media") : undefined,
    room.safety_entities[0] ? devicePresentation(hass, room.safety_entities[0], "safety") : undefined,
    room.power_entities[0] ? devicePresentation(hass, room.power_entities[0], "power") : undefined
  ].filter((candidate): candidate is DevicePresentation => Boolean(candidate)).slice(0, 4);
}

export function getRoomMetric(hass: HomeAssistantLike | undefined, room: RoomConfig): string {
  const operationalEntities = [...room.light_entities, ...room.cover_entities, room.hvac.entity, ...room.media_entities, ...room.safety_entities].filter(Boolean);
  const states = operationalEntities.map((entity) => hass?.states?.[entity]);
  if (states.some((state) => state?.state === "unavailable")) return "Deels offline";
  const openCovers = room.cover_entities.filter((entity) => ["open", "opening"].includes(hass?.states?.[entity]?.state ?? ""));
  if (openCovers.length > 0) return openCovers.length === 1 ? "1 opening open" : `${openCovers.length} open`;
  const lightsOn = room.light_entities.filter((entity) => hass?.states?.[entity]?.state === "on").length;
  if (lightsOn > 0) return lightsOn === 1 ? "1 lamp aan" : `${lightsOn} lampen aan`;
  const climate = room.hvac.entity ? hass?.states?.[room.hvac.entity] : undefined;
  const currentTemperature = numberAttribute(climate, "current_temperature");
  if (currentTemperature !== undefined) return `${currentTemperature} °C`;
  const comfort = room.hvac.comfort_entities[0];
  if (comfort) return stateText(hass?.states?.[comfort]);
  return "Normaal";
}

function roomContext(hass: HomeAssistantLike | undefined, room: RoomConfig): string[] {
  const presentations = [
    ...room.safety_entities.map((entity, index) => devicePresentation(hass, entity, "safety", index)),
    ...room.hvac.comfort_entities.map((entity, index) => devicePresentation(hass, entity, "comfort", index)),
    ...room.power_entities.map((entity, index) => devicePresentation(hass, entity, "power", index))
  ];
  presentations.sort((left, right) => {
    const priority = { warning: 0, unavailable: 1, active: 2, normal: 3 };
    return priority[left.tone] - priority[right.tone];
  });
  return presentations.slice(0, 3).map((item) => `${item.label}: ${item.value}`);
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
    this.signature = "";
    this.render();
  }

  public set hass(value: HomeAssistantLike) {
    this.currentHass = value;
    const next = (this.config?.rooms ?? []).map((room) => stateSignature(value, room)).join("||");
    if (next !== this.signature) {
      this.signature = next;
      this.render();
    }
  }

  public connectedCallback(): void {
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot || !this.config) return;
    const style = document.createElement("style");
    style.textContent = `
      :host{display:block;min-width:0}.overview{display:grid;gap:20px}.hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px;border-radius:22px;background:var(--primary-color,#245c4d);color:var(--text-primary-color,#fff)}
      .hero-copy{display:grid;gap:4px}.eyebrow{font-size:.74rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.8}.hero h2{margin:0;font-size:1.7rem}.hero p{margin:0;opacity:.78}.count{display:grid;text-align:right}.count strong{font-size:2rem}.count span{font-size:.78rem;opacity:.8}
      .floor{display:grid;gap:10px}.floor-heading{display:grid;gap:2px;padding-inline:2px}.floor-heading h3{margin:0;font-size:1.25rem}.floor-heading span{font-size:.82rem;color:var(--secondary-text-color)}.room-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .room{display:grid;border-radius:16px;background:var(--ha-card-background,var(--card-background-color));box-shadow:var(--ha-card-box-shadow);overflow:hidden}.room-main{display:grid;grid-template-columns:44px minmax(0,1fr) auto 24px;align-items:center;gap:10px;padding:14px;color:var(--primary-text-color);text-decoration:none;min-height:66px}.room-main:focus-visible{outline:2px solid var(--primary-color);outline-offset:-3px}
      .room-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:color-mix(in srgb,var(--primary-color) 14%,transparent);color:var(--primary-color)}.room-icon ha-icon{width:24px;height:24px}.room-copy{display:grid;min-width:0}.room-copy strong,.room-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.room-copy small{color:var(--secondary-text-color)}.metric{padding:6px 9px;border:1px solid var(--divider-color);border-radius:999px;font-size:.76rem;white-space:nowrap}.chevron{color:var(--secondary-text-color)}
      .chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:8px 12px;border-top:1px solid var(--divider-color)}.chip{display:grid;grid-template-columns:28px minmax(0,1fr);align-items:center;gap:7px;min-height:44px;padding:6px 8px;border:1px solid transparent;border-radius:11px;background:color-mix(in srgb,var(--primary-color) 9%,transparent);color:var(--primary-color);cursor:pointer;text-align:left}.chip:hover{background:color-mix(in srgb,var(--primary-color) 16%,transparent)}.chip:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.chip.warning{color:var(--error-color,#b3261e);background:color-mix(in srgb,var(--error-color,#b3261e) 10%,transparent)}.chip.unavailable{color:var(--secondary-text-color);background:var(--secondary-background-color)}.chip ha-icon{width:22px;height:22px}.chip-copy{display:grid;min-width:0}.chip-copy strong,.chip-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.chip-copy strong{font-size:.75rem;color:var(--primary-text-color)}.chip-copy small{font-size:.7rem;color:var(--secondary-text-color);font-weight:500}
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
        const article = document.createElement("article");
        article.className = "room";
        const link = document.createElement("a");
        link.className = "room-main";
        link.href = roomPath(room);
        link.setAttribute("aria-label", `Open details van ${room.name}`);
        const roomIcon = document.createElement("span");
        roomIcon.className = "room-icon";
        roomIcon.append(icon(room.icon));
        const copy = document.createElement("span");
        copy.className = "room-copy";
        const name = document.createElement("strong");
        name.textContent = room.name;
        const meta = document.createElement("small");
        meta.textContent = roomContext(this.currentHass, room).join(" · ") || "Basisstatus";
        copy.append(name, meta);
        const metric = document.createElement("span");
        metric.className = "metric";
        metric.textContent = getRoomMetric(this.currentHass, room);
        const chevron = document.createElement("span");
        chevron.className = "chevron";
        chevron.append(icon("mdi:chevron-right"));
        link.append(roomIcon, copy, metric, chevron);
        const chips = document.createElement("div");
        chips.className = "chips";
        for (const device of roomDeviceChips(this.currentHass, room)) {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = `chip ${device.tone}`;
          chip.append(icon(device.icon));
          const chipCopy = document.createElement("span");
          chipCopy.className = "chip-copy";
          const deviceName = document.createElement("strong");
          deviceName.textContent = device.label;
          const deviceState = document.createElement("small");
          deviceState.textContent = device.value;
          chipCopy.append(deviceName, deviceState);
          chip.append(chipCopy);
          chip.setAttribute("aria-label", `Open ${device.label}: ${device.value}`);
          chip.title = `${device.label} · ${device.value}`;
          chip.addEventListener("click", () => showMoreInfo(this, device.entity));
          chips.append(chip);
        }
        article.append(link);
        if (chips.childElementCount > 0) article.append(chips);
        grid.append(article);
      }
      section.append(heading, grid);
      root.append(section);
    });
    this.shadowRoot.replaceChildren(style, root);
  }
}

export class HomeDashboardRoomDetail extends RoomCardBase<RoomDetailConfig> {
  public setConfig(config: RoomDetailConfig): void {
    if (!config.room?.key) throw new Error("Kamer ontbreekt.");
    this.config = config;
    this.signature = "";
    this.render();
  }

  public set hass(value: HomeAssistantLike) {
    this.currentHass = value;
    const next = this.config ? stateSignature(value, this.config.room) : "";
    if (next !== this.signature) {
      this.signature = next;
      this.render();
    }
  }

  public connectedCallback(): void { this.render(); }

  private entityCard(entity: string, role: DeviceRole, compact = false, index = 0): HTMLButtonElement {
    const presentation = devicePresentation(this.currentHass, entity, role, index);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `${compact ? "entity compact" : "entity"} ${presentation.tone}`;
    button.setAttribute("aria-label", `Open ${presentation.label}: ${presentation.value}`);
    const entityIconElement = document.createElement("span");
    entityIconElement.className = "entity-icon";
    entityIconElement.append(icon(presentation.icon));
    const copy = document.createElement("span");
    copy.className = "entity-copy";
    const name = document.createElement("strong");
    name.textContent = presentation.label;
    const value = document.createElement("small");
    value.textContent = presentation.value;
    copy.append(name, value);
    const chevron = icon("mdi:chevron-right");
    chevron.className = "entity-chevron";
    button.append(entityIconElement, copy, chevron);
    button.addEventListener("click", () => showMoreInfo(this, entity));
    return button;
  }

  private group(titleText: string, subtitleText: string, entities: string[], role: DeviceRole, compact = false, progressive = false): HTMLElement | undefined {
    const unique = [...new Set(entities.filter(Boolean))];
    if (unique.length === 0) return undefined;
    const section = document.createElement(progressive ? "details" : "section") as HTMLElement & { open?: boolean };
    section.className = progressive ? "group disclosure" : "group";
    if (progressive) section.open = typeof window === "undefined" || !window.matchMedia?.("(max-width: 600px)").matches;
    const header = document.createElement(progressive ? "summary" : "header");
    header.className = "group-heading";
    const headingIcon = document.createElement("span");
    headingIcon.className = "group-icon";
    headingIcon.append(icon({ light: "mdi:lightbulb-group-outline", cover: "mdi:window-shutter", climate: "mdi:thermostat", media: "mdi:speaker-multiple", comfort: "mdi:home-thermometer-outline", safety: "mdi:shield-home-outline", camera: "mdi:cctv", power: "mdi:flash-outline", history: "mdi:chart-timeline-variant" }[role]));
    const copy = document.createElement("span");
    copy.className = "group-heading-copy";
    const title = document.createElement("strong");
    title.textContent = titleText;
    const subtitle = document.createElement("small");
    subtitle.textContent = subtitleText;
    copy.append(title, subtitle);
    header.append(headingIcon, copy);
    const grid = document.createElement("div");
    grid.className = compact ? "entity-list" : "entity-grid";
    unique.forEach((entity, index) => grid.append(this.entityCard(entity, role, compact, index)));
    section.append(header, grid);
    return section;
  }

  private render(): void {
    if (!this.shadowRoot || !this.config) return;
    const room = this.config.room;
    const style = document.createElement("style");
    style.textContent = `
      :host{display:block;min-width:0}.detail{display:grid;gap:22px;max-width:1180px;margin:0 auto}.hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px;border-radius:22px;background:var(--primary-color,#245c4d);color:var(--text-primary-color,#fff)}.hero-copy{display:grid;gap:4px}.eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.75}.hero h1{margin:0;font-size:1.85rem}.hero p{margin:0;opacity:.75}.hero-pills{display:flex;justify-content:flex-end;gap:7px;flex-wrap:wrap}.hero-pill{padding:7px 10px;border:1px solid color-mix(in srgb,currentColor 28%,transparent);border-radius:999px;font-size:.78rem;font-weight:650}
      .group{display:grid;gap:10px}.group-heading{display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:9px;min-height:44px}.group-icon{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:color-mix(in srgb,var(--primary-color) 10%,transparent);color:var(--primary-color)}.group-heading-copy{display:grid}.group-heading-copy>strong{font-size:1.05rem}.group-heading-copy>small{color:var(--secondary-text-color)}.disclosure{border:0}.disclosure>summary{cursor:pointer;list-style:none}.disclosure>summary::-webkit-details-marker{display:none}.disclosure>summary::after{content:"›";justify-self:end;grid-column:3;transform:rotate(90deg);font-size:1.35rem;color:var(--secondary-text-color)}.disclosure:not([open])>summary::after{transform:rotate(0)}.disclosure>summary:focus-visible{outline:2px solid var(--primary-color);outline-offset:3px;border-radius:10px}.disclosure[open]>.entity-grid,.disclosure[open]>.entity-list{margin-top:10px}.status-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.status{display:grid;gap:5px;min-height:72px;padding:12px;border:1px solid var(--divider-color);border-radius:14px;background:var(--ha-card-background,var(--card-background-color));color:var(--primary-text-color);text-align:left;cursor:pointer}.status ha-icon{color:var(--primary-color)}.status small{color:var(--secondary-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.status strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.status.warning{border-color:color-mix(in srgb,var(--error-color,#b3261e) 45%,var(--divider-color));background:color-mix(in srgb,var(--error-color,#b3261e) 7%,var(--card-background-color))}.status.unavailable{opacity:.75}.status:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
      .columns{display:grid;grid-template-columns:minmax(0,2fr) minmax(250px,1fr);gap:20px;align-items:start}.columns.side-only{grid-template-columns:1fr}.main,.side{display:grid;gap:20px}.entity-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.entity-list{display:grid;gap:8px}.entity{display:grid;grid-template-columns:42px minmax(0,1fr) 22px;align-items:center;gap:10px;min-height:74px;padding:12px;border:1px solid var(--divider-color);border-radius:15px;background:var(--ha-card-background,var(--card-background-color));color:var(--primary-text-color);cursor:pointer;text-align:left}.entity:hover{border-color:var(--primary-color)}.entity:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.entity.warning{border-color:color-mix(in srgb,var(--error-color,#b3261e) 45%,var(--divider-color));background:color-mix(in srgb,var(--error-color,#b3261e) 7%,var(--card-background-color))}.entity.unavailable{opacity:.72}.entity.compact{min-height:60px}.entity-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:color-mix(in srgb,var(--primary-color) 12%,transparent);color:var(--primary-color)}.entity.warning .entity-icon{color:var(--error-color,#b3261e);background:color-mix(in srgb,var(--error-color,#b3261e) 12%,transparent)}.entity-copy{display:grid;min-width:0}.entity-copy strong,.entity-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.entity-copy small{color:var(--secondary-text-color)}.entity-chevron{color:var(--secondary-text-color)}
      .climate{display:grid;grid-template-columns:minmax(210px,.8fr) minmax(0,2fr);gap:12px;padding:16px;border:1px solid var(--divider-color);border-radius:16px;background:var(--ha-card-background,var(--card-background-color))}.climate-main{display:grid;align-content:center;gap:5px}.climate-main span{color:var(--secondary-text-color);font-size:.78rem}.climate-main strong{font-size:2rem}.climate-main button{justify-self:start;min-height:44px;border:0;background:none;color:var(--primary-color);padding:8px 0;cursor:pointer;font:inherit;font-weight:700}.climate-main button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px;border-radius:6px}.climate-sensors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.history-note{padding:12px;border-radius:12px;background:var(--secondary-background-color);color:var(--secondary-text-color);font-size:.82rem}
      @media(max-width:900px){.status-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.columns{grid-template-columns:1fr}.side{grid-template-columns:repeat(2,minmax(0,1fr))}.climate{grid-template-columns:1fr}}
      @media(max-width:600px){.detail{gap:18px}.hero{align-items:flex-start;flex-direction:column;padding:18px}.hero h1{font-size:1.55rem}.hero-pills{justify-content:flex-start}.status-grid,.entity-grid,.climate-sensors{grid-template-columns:repeat(2,minmax(0,1fr))}.entity{grid-template-columns:36px minmax(0,1fr);min-height:70px}.entity-chevron{display:none}.entity-icon{width:36px;height:36px}.entity-copy strong{font-size:.88rem}.side{display:grid;grid-template-columns:1fr}.status{min-height:66px}}
    `;
    const root = document.createElement("main");
    root.className = "detail";
    const hero = document.createElement("section");
    hero.className = "hero";
    const heroCopy = document.createElement("div");
    heroCopy.className = "hero-copy";
    const eyebrow = document.createElement("span");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Kamer";
    const title = document.createElement("h1");
    title.textContent = room.name;
    const subtitle = document.createElement("p");
    subtitle.textContent = "Status en bediening via de standaard Home Assistant-detailvensters.";
    heroCopy.append(eyebrow, title, subtitle);
    const heroPills = document.createElement("div");
    heroPills.className = "hero-pills";
    [getRoomMetric(this.currentHass, room), ...roomContext(this.currentHass, room)].slice(0, 3).forEach((value) => {
      const pill = document.createElement("span");
      pill.className = "hero-pill";
      pill.textContent = value;
      heroPills.append(pill);
    });
    hero.append(heroCopy, heroPills);
    root.append(hero);

    const statusEntities = [...new Set([...room.safety_entities, ...room.hvac.comfort_entities].filter(Boolean))].slice(0, 6);
    if (statusEntities.length > 0) {
      const statusGroup = document.createElement("section");
      statusGroup.className = "group";
      const header = document.createElement("header");
      header.className = "group-heading";
      const statusIcon = document.createElement("span");
      statusIcon.className = "group-icon";
      statusIcon.append(icon("mdi:home-heart"));
      const statusCopy = document.createElement("span");
      statusCopy.className = "group-heading-copy";
      const headerTitle = document.createElement("strong");
      headerTitle.textContent = "Ruimtestatus";
      const headerCopy = document.createElement("small");
      headerCopy.textContent = "De belangrijkste sensoren blijven op mobiel direct zichtbaar";
      statusCopy.append(headerTitle, headerCopy);
      header.append(statusIcon, statusCopy);
      const grid = document.createElement("div");
      grid.className = "status-grid";
      statusEntities.forEach((entity, index) => {
        const role: DeviceRole = room.safety_entities.includes(entity) ? "safety" : "comfort";
        const presentation = devicePresentation(this.currentHass, entity, role, index);
        const card = document.createElement("button");
        card.type = "button";
        card.className = `status ${presentation.tone}`;
        card.setAttribute("aria-label", `Open ${presentation.label}: ${presentation.value}`);
        card.append(icon(presentation.icon));
        const label = document.createElement("small");
        label.textContent = presentation.label;
        const value = document.createElement("strong");
        value.textContent = presentation.value;
        card.append(label, value);
        card.addEventListener("click", () => showMoreInfo(this, entity));
        grid.append(card);
      });
      statusGroup.append(header, grid);
      root.append(statusGroup);
    }

    const columns = document.createElement("div");
    columns.className = "columns";
    const main = document.createElement("div");
    main.className = "main";
    const lights = this.group("Verlichting", "Lampen, groepen en scènes via Home Assistant", room.light_entities, "light");
    const covers = this.group("Covers & openingen", "Rolluiken, gordijnen en andere gemapte covers", room.cover_entities, "cover");
    if (lights) main.append(lights);
    if (covers) main.append(covers);
    if (room.hvac.entity || room.hvac.comfort_entities.length > 0) {
      const climateGroup = document.createElement("section");
      climateGroup.className = "group";
      const header = document.createElement("header");
      header.className = "group-heading";
      const headerIcon = document.createElement("span");
      headerIcon.className = "group-icon";
      headerIcon.append(icon("mdi:thermostat"));
      const headerText = document.createElement("span");
      headerText.className = "group-heading-copy";
      const headerTitle = document.createElement("strong");
      headerTitle.textContent = "Comfort & klimaat";
      const headerCopy = document.createElement("small");
      headerCopy.textContent = "Actuele toestand, doel en omgevingswaarden";
      headerText.append(headerTitle, headerCopy);
      header.append(headerIcon, headerText);
      const panel = document.createElement("div");
      panel.className = "climate";
      if (room.hvac.entity) {
        const state = this.currentHass?.states?.[room.hvac.entity];
        const current = numberAttribute(state, "current_temperature");
        const target = numberAttribute(state, "temperature");
        const climateMain = document.createElement("div");
        climateMain.className = "climate-main";
        const label = document.createElement("span");
        label.textContent = friendlyName(state, "Klimaat");
        const value = document.createElement("strong");
        value.textContent = current === undefined ? stateText(state) : `${current} °C`;
        const targetLabel = document.createElement("span");
        targetLabel.textContent = target === undefined ? "Geen doeltemperatuur" : `Doel ${target} °C · ${state?.state ?? "onbekend"}`;
        const open = document.createElement("button");
        open.type = "button";
        open.textContent = "Open klimaatbediening →";
        open.addEventListener("click", () => showMoreInfo(this, room.hvac.entity));
        climateMain.append(label, value, targetLabel, open);
        panel.append(climateMain);
      }
      const sensors = document.createElement("div");
      sensors.className = "climate-sensors";
      room.hvac.comfort_entities.forEach((entity, index) => sensors.append(this.entityCard(entity, "comfort", true, index)));
      if (sensors.childElementCount > 0) panel.append(sensors);
      climateGroup.append(header, panel);
      main.append(climateGroup);
    }
    const power = this.group("Apparaten & energie", "Actuele apparaat- en verbruiksstatus", room.power_entities, "power", false, true);
    if (power) main.append(power);
    columns.append(main);
    const side = document.createElement("aside");
    side.className = "side";
    const media = this.group("Media", "Spelers, bron en afspeelstatus", room.media_entities, "media", true);
    const safety = this.group("Veiligheid", "Openingen, melders en afwijkingen", room.safety_entities, "safety", true);
    const cameras = this.group("Camera's", "Lokale beelden openen in Home Assistant", room.camera_entities, "camera", true, true);
    if (media) side.append(media);
    if (safety) side.append(safety);
    if (cameras) side.append(cameras);
    if (side.childElementCount > 0) columns.append(side);
    if (main.childElementCount === 0 && side.childElementCount > 0) columns.classList.add("side-only");
    if (main.childElementCount > 0 || side.childElementCount > 0) root.append(columns);

    const historyCount = new Set([...room.history_entities, ...room.hvac.history_entities].filter(Boolean)).size;
    if (historyCount > 0) {
      const historySources = this.group("Historie", "Bronnen in de 72-uurs grafiek onder dit kamerdashboard", [...room.history_entities, ...room.hvac.history_entities], "history", true, true);
      if (historySources) root.append(historySources);
      const note = document.createElement("div");
      note.className = "history-note";
      note.textContent = `Onder dit kamerdashboard volgt de 72-uurs historie voor ${historyCount} geselecteerde bron${historyCount === 1 ? "" : "nen"}.`;
      root.append(note);
    }
    this.shadowRoot.replaceChildren(style, root);
  }
}

export function registerHomeDashboardRoomCards(): void {
  if (typeof customElements === "undefined" || typeof window === "undefined") return;
  const cards: Array<[string, CustomElementConstructor, string, string]> = [
    ["home-dashboard-room-overview", HomeDashboardRoomOverview, "Home Dashboard Room Overview", "Verdiepingsgewijs kameroverzicht met compacte statuskaarten."],
    ["home-dashboard-room-detail", HomeDashboardRoomDetail, "Home Dashboard Room Detail", "Samenhangend kamerdashboard met status, bediening via HA-detailvensters, comfort, media en veiligheid."]
  ];
  window.customCards ??= [];
  for (const [tag, constructor, name, description] of cards) {
    if (!customElements.get(tag)) customElements.define(tag, constructor);
    if (!window.customCards.some((card) => card.type === tag)) window.customCards.push({ type: tag, name, description, preview: true });
  }
}
