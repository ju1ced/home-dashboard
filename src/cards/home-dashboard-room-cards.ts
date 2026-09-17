import { HomeDashboardRoomControls } from "./home-dashboard-room-controls";
import type { RoomConfig } from "../config/types";
import { applyDashboardPalette, type DashboardPalette, type ThemeMode } from "../theme/palettes";

type StateLike = { state?: string; attributes?: Record<string, unknown> };
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
    ...(room.control_entities ?? []),
    room.control_light_entity ?? "", room.control_cover_entity ?? "", room.control_awning_entity ?? "", room.control_media_entity ?? "",
    ...room.light_entities,
    ...room.cover_entities,
    room.hvac.entity,
    ...room.hvac.comfort_entities,
    ...room.media_entities,
    ...room.safety_entities,
    ...room.camera_entities,
    ...room.power_entities,
    room.image_entity ?? "",
    room.temperature_history_entity ?? "",
    ...(room.smart_plugs ?? []).flatMap((plug) => [plug.switch_entity, plug.power_entity, plug.energy_entity, plug.voltage_entity]),
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
      :host{display:block;min-width:0}.overview{display:grid;gap:20px}.hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px;border-radius:22px;background:var(--hd-hero,var(--primary-color,#245c4d));color:var(--hd-hero-text,#fff)}
      .hero-copy{display:grid;gap:4px}.eyebrow{font-size:.74rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.8}.hero h2{margin:0;font-size:1.7rem}.hero p{margin:0;opacity:.78}.count{display:grid;text-align:right}.count strong{font-size:2rem}.count span{font-size:.78rem;opacity:.8}
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
  public setConfig(config: RoomDetailConfig): void {
    if (!config.room?.key) throw new Error("Kamer ontbreekt.");
    this.config = config;
    applyDashboardPalette(this, config.palette, config.theme_mode);
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


  private callService(entity: string, domain: string, service: string, data: Record<string, unknown> = {}): void {
    if (!actionable(this.currentHass?.states?.[entity]) || !this.currentHass?.callService) return;
    void this.currentHass.callService(domain, service, { entity_id: entity, ...data }).catch(() => undefined);
  }

  private command(label: string, entity: string, domain: string, service: string, data: Record<string, unknown> = {}): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "command";
    button.textContent = label;
    button.disabled = !actionable(this.currentHass?.states?.[entity]) || !this.currentHass?.callService;
    button.addEventListener("click", () => this.callService(entity, domain, service, data));
    return button;
  }

  private confirmedCommand(label: string, entity: string, domain: string, service: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "command";
    button.textContent = label;
    button.disabled = !actionable(this.currentHass?.states?.[entity]) || !this.currentHass?.callService;
    let armed = false;
    button.addEventListener("click", () => {
      if (!armed) {
        armed = true;
        button.textContent = `Bevestig ${label.toLowerCase()}`;
        button.setAttribute("aria-label", `Bevestig ${label.toLowerCase()} ${friendlyName(this.currentHass?.states?.[entity], entity)}`);
        return;
      }
      this.callService(entity, domain, service);
    });
    return button;
  }

  private informationGroup(titleText: string, sources: Array<[string, DeviceRole]>): HTMLElement | undefined {
    const unique = sources.filter(([entity]) => entity);
    if (!unique.length) return undefined;
    const group = document.createElement("section"); group.className = "group";
    const heading = document.createElement("header"); heading.className = "group-heading";
    const title = document.createElement("strong"); title.textContent = titleText;
    heading.append(document.createElement("span"), title);
    const list = document.createElement("div"); list.className = "info-list";
    unique.forEach(([entity, role], index) => {
      const presentation = devicePresentation(this.currentHass, entity, role, index);
      const row = document.createElement("div"); row.className = `info ${presentation.tone}`;
      row.setAttribute("aria-label", `${presentation.label}: ${presentation.value}`);
      row.textContent = `${presentation.label} · ${presentation.value}`;
      list.append(row);
    });
    group.append(heading, list); return group;
  }

  private directControls(room: RoomConfig): HTMLElement | undefined {
    const controls = document.createElement("section");
    controls.className = "direct-controls";
    const heading = document.createElement("header");
    heading.className = "group-heading";
    const headingIcon = document.createElement("span");
    headingIcon.className = "group-icon";
    headingIcon.append(icon("mdi:gesture-tap-button"));
    const copy = document.createElement("span");
    copy.className = "group-heading-copy";
    const title = document.createElement("strong");
    title.textContent = "Nu bedienen";
    copy.append(title); heading.append(headingIcon, copy); controls.append(heading);
    const grid = document.createElement("div"); grid.className = "direct-grid";
    const add = (entity: string, label: string, commands: HTMLButtonElement[]): void => {
      if (!entity) return;
      const card = document.createElement("section"); card.className = "direct-card";
      const presentation = devicePresentation(this.currentHass, entity, entity.startsWith("light.") ? "light" : entity.startsWith("cover.") ? "cover" : entity.startsWith("media_player.") ? "media" : "climate");
      const name = document.createElement("strong"); name.textContent = label || presentation.label;
      const value = document.createElement("small"); value.textContent = presentation.value;
      commands.forEach((command) => command.setAttribute("aria-label", `${command.textContent} ${name.textContent}`));
      const actions = document.createElement("div"); actions.className = "commands"; actions.append(...commands);
      card.append(name, value, actions); grid.append(card);
    };
    room.light_entities.forEach((entity, index) => add(entity, friendlyName(this.currentHass?.states?.[entity], `Licht ${index + 1}`), [this.command(this.currentHass?.states?.[entity]?.state === "on" ? "Uit" : "Aan", entity, "light", this.currentHass?.states?.[entity]?.state === "on" ? "turn_off" : "turn_on")]));
    room.cover_entities.forEach((entity, index) => add(entity, friendlyName(this.currentHass?.states?.[entity], `Rolluik ${index + 1}`), [this.confirmedCommand("Open", entity, "cover", "open_cover"), this.command("Stop", entity, "cover", "stop_cover"), this.confirmedCommand("Dicht", entity, "cover", "close_cover")]));
    room.media_entities.forEach((entity, index) => add(entity, friendlyName(this.currentHass?.states?.[entity], `Media ${index + 1}`), [this.command(this.currentHass?.states?.[entity]?.state === "playing" ? "Pauze" : "Speel", entity, "media_player", this.currentHass?.states?.[entity]?.state === "playing" ? "media_pause" : "media_play")]));
    if (room.hvac.entity) {
      const target = numberAttribute(this.currentHass?.states?.[room.hvac.entity], "temperature");
      add(room.hvac.entity, friendlyName(this.currentHass?.states?.[room.hvac.entity], "Klimaat"), target === undefined ? [] : [this.command("− 0,5°", room.hvac.entity, "climate", "set_temperature", { temperature: target - 0.5 }), this.command("+ 0,5°", room.hvac.entity, "climate", "set_temperature", { temperature: target + 0.5 })]);
    }
    if (!grid.childElementCount) return undefined;
    controls.append(grid); return controls;
  }

  private smartPlugCard(plug: NonNullable<RoomConfig["smart_plugs"]>[number]): HTMLElement {
    const card = document.createElement("section"); card.className = "plug-card";
    const state = this.currentHass?.states?.[plug.switch_entity];
    const title = document.createElement("strong"); title.textContent = plug.name || friendlyName(state, "Smart plug");
    const values = document.createElement("small");
    values.textContent = [plug.power_entity, plug.energy_entity, plug.voltage_entity].filter(Boolean).map(entity => stateText(this.currentHass?.states?.[entity])).join(" · ") || stateText(state);
    const lock = document.createElement("button"); lock.type = "button"; lock.className = "plug-lock"; lock.textContent = "Ontgrendel om te schakelen";
    const confirm = document.createElement("button"); confirm.type = "button"; confirm.className = "command"; confirm.hidden = true;
    lock.addEventListener("click", () => { confirm.hidden = false; confirm.textContent = state?.state === "on" ? "Bevestig uitschakelen" : "Bevestig inschakelen"; lock.textContent = "Bevestiging vereist"; });
    confirm.addEventListener("click", () => this.callService(plug.switch_entity, "switch", state?.state === "on" ? "turn_off" : "turn_on"));
    card.append(title, values, lock, confirm); return card;
  }

  private async mountCard(host: HTMLElement, config: Record<string, unknown>): Promise<void> {
    const helpers = await window.loadCardHelpers?.();
    if (!helpers || !this.isConnected || !host.isConnected) return;
    const card = helpers.createCardElement(config); card.hass = this.currentHass; host.replaceChildren(card);
  }


  private render(): void {
    if (!this.shadowRoot || !this.config) return;
    const sourceRoom = this.config.room;
    const selectedControls = sourceRoom.control_entities ?? [];
    const room = { ...sourceRoom,
      light_entities: [...new Set([...sourceRoom.light_entities, sourceRoom.control_light_entity, ...selectedControls.filter(entity => entity.startsWith("light."))].filter((value): value is string => Boolean(value)))],
      cover_entities: [...new Set([...sourceRoom.cover_entities, sourceRoom.control_cover_entity, sourceRoom.control_awning_entity, ...selectedControls.filter(entity => entity.startsWith("cover."))].filter((value): value is string => Boolean(value)))],
      media_entities: [...new Set([...sourceRoom.media_entities, sourceRoom.control_media_entity, ...selectedControls.filter(entity => entity.startsWith("media_player."))].filter((value): value is string => Boolean(value)))]
    };
    const style = document.createElement("style");
    style.textContent = `
      :host{display:block;min-width:0}.detail{display:grid;gap:22px;width:100%;margin:0 auto}.hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px;border-radius:22px;background:var(--hd-hero,var(--primary-color,#245c4d));color:var(--hd-hero-text,#fff)}.hero-copy{display:grid;gap:4px}.eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.75}.hero h1{margin:0;font-size:1.85rem}.hero p{margin:0;opacity:.75}.hero-pills{display:flex;justify-content:flex-end;gap:7px;flex-wrap:wrap}.hero-pill{padding:7px 10px;border:1px solid color-mix(in srgb,currentColor 28%,transparent);border-radius:999px;font-size:.78rem;font-weight:650}
      .group{display:grid;gap:10px}.group-heading{display:grid;grid-template-columns:34px 1fr;align-items:center;gap:9px;min-height:44px}.group-icon{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:color-mix(in srgb,var(--primary-color) 10%,transparent);color:var(--primary-color)}.group-heading-copy{display:grid}.group-heading-copy>small{color:var(--secondary-text-color)}.info-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}.info{padding:10px;border:1px solid var(--divider-color);border-radius:12px;background:var(--ha-card-background,var(--card-background-color));color:var(--primary-text-color)}.info.warning{border-color:var(--error-color,#b3261e)}.info.unavailable{opacity:.72}
      .direct-controls{display:grid;gap:10px;padding:14px;border:1px solid color-mix(in srgb,var(--primary-color) 30%,var(--divider-color));border-radius:18px;background:color-mix(in srgb,var(--primary-color) 5%,var(--ha-card-background,var(--card-background-color)))}.direct-grid,.plug-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:9px}.direct-card,.plug-card{display:grid;gap:6px;padding:12px;border:1px solid var(--divider-color);border-radius:14px;background:var(--ha-card-background,var(--card-background-color))}.direct-card small,.plug-card small{color:var(--secondary-text-color)}.commands{display:flex;flex-wrap:wrap;gap:7px}.command,.plug-lock{min-height:44px;padding:8px 10px;border:1px solid var(--divider-color);border-radius:10px;background:var(--ha-card-background,var(--card-background-color));color:var(--primary-text-color);font:inherit;cursor:pointer}.command:focus-visible,.plug-lock:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.plug-lock{color:var(--primary-color);font-weight:700}.room-photo{width:110px;min-height:96px;border-radius:16px;background:linear-gradient(135deg,color-mix(in srgb,#fff 20%,transparent),transparent),var(--hd-hero);background-size:cover;background-position:center;flex:0 0 auto}.embedded-card{min-height:120px}.embedded-card:empty::before{content:"Grafiek wordt geladen…";display:block;padding:16px;color:var(--secondary-text-color)}
      @media(max-width:600px){.detail{gap:18px}.hero{align-items:flex-start;flex-direction:column;padding:18px}.hero h1{font-size:1.55rem}.hero-pills{justify-content:flex-start}.room-photo{width:100%;min-height:130px;order:-1}.direct-grid,.plug-grid{grid-template-columns:1fr}}
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
    subtitle.textContent = "Status en bediening via Details.";
    heroCopy.append(eyebrow, title, subtitle);
    const heroPills = document.createElement("div");
    heroPills.className = "hero-pills";
    [getRoomMetric(this.currentHass, room)].forEach((value) => {
      const pill = document.createElement("span");
      pill.className = "hero-pill";
      pill.textContent = value;
      heroPills.append(pill);
    });
    hero.append(heroCopy, heroPills);
    const picture = room.image_entity ? this.currentHass?.states?.[room.image_entity]?.attributes?.entity_picture : undefined;
    const photo = document.createElement("div");
    photo.className = "room-photo";
    photo.setAttribute("role", "img");
    photo.setAttribute("aria-label", `Foto ${room.name}`);
    if (typeof picture === "string" && picture) photo.style.backgroundImage = `url("${picture.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"")}")`;
    hero.append(photo);
    root.append(hero);


    const directControls = this.directControls(room);
    if (directControls) root.append(directControls);

    [
      this.informationGroup("Comfort & klimaat", [[room.hvac.entity, "climate"], ...room.hvac.comfort_entities.map((entity): [string, DeviceRole] => [entity, "comfort"])]),
      this.informationGroup("Veiligheid", room.safety_entities.map((entity): [string, DeviceRole] => [entity, "safety"])),
      this.informationGroup("Camera's", room.camera_entities.map((entity): [string, DeviceRole] => [entity, "camera"])),
      this.informationGroup("Apparaten & energie", room.power_entities.map((entity): [string, DeviceRole] => [entity, "power"])),
      this.informationGroup("Historie", [...room.history_entities, ...room.hvac.history_entities].map((entity): [string, DeviceRole] => [entity, "history"]))
    ].forEach((group) => { if (group) root.append(group); });

    if ((room.smart_plugs?.length ?? 0) > 0) {
      const plugGroup = document.createElement("section"); plugGroup.className = "group";
      const heading = document.createElement("header"); heading.className = "group-heading";
      const headingIcon = document.createElement("span"); headingIcon.className = "group-icon"; headingIcon.append(icon("mdi:power-socket-eu"));
      const copy = document.createElement("span"); copy.className = "group-heading-copy";
      const title = document.createElement("strong"); title.textContent = "Smart plugs & energie";
      const subtitle = document.createElement("small"); subtitle.textContent = "Verbruik en beveiligd schakelen";
      copy.append(title, subtitle); heading.append(headingIcon, copy);
      const grid = document.createElement("div"); grid.className = "plug-grid";
      room.smart_plugs?.forEach((plug) => grid.append(this.smartPlugCard(plug)));
      plugGroup.append(heading, grid); root.append(plugGroup);
    }

    if (room.temperature_history_entity) {
      const trend = document.createElement("section"); trend.className = "group";
      const heading = document.createElement("header"); heading.className = "group-heading";
      const trendIcon = document.createElement("span"); trendIcon.className = "group-icon"; trendIcon.append(icon("mdi:chart-line"));
      const copy = document.createElement("span"); copy.className = "group-heading-copy";
      const title = document.createElement("strong"); title.textContent = "Temperatuurtrend";
      copy.append(title); heading.append(trendIcon, copy);
      const graph = document.createElement("div"); graph.className = "embedded-card temperature-graph";
      trend.append(heading, graph); root.append(trend);
      void this.mountCard(graph, { type: "statistics-graph", entities: [room.temperature_history_entity], chart_type: "line", days_to_show: 1, period: "hour", title: "Temperatuurtrend" });
    }

    if (room.desk && Object.keys(room.desk.card_config).length > 0) {
      const desk = document.createElement("section"); desk.className = "group";
      const heading = document.createElement("header"); heading.className = "group-heading";
      const deskIcon = document.createElement("span"); deskIcon.className = "group-icon"; deskIcon.append(icon("mdi:desk"));
      const copy = document.createElement("span"); copy.className = "group-heading-copy";
      const title = document.createElement("strong"); title.textContent = "Bureau";
      const subtitle = document.createElement("small"); subtitle.textContent = "IKEA LINAK / IDÅSEN";
      copy.append(title, subtitle); heading.append(deskIcon, copy);
      const card = document.createElement("div"); card.className = "embedded-card desk-card";
      desk.append(heading, card); root.append(desk);
      void this.mountCard(card, { ...room.desk.card_config, type: "custom:linak-desk-card" });
    }


    this.shadowRoot.replaceChildren(style, root);
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
