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

interface RoomHeroConfig {
  type: "custom:home-dashboard-room-hero";
  room: RoomConfig;
}

interface RoomClimateConfig {
  type: "custom:home-dashboard-room-climate";
  room: RoomConfig;
}

interface CustomCardMetadata {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
}

declare global {
  interface Window {
    customCards?: CustomCardMetadata[];
  }
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

const capabilityLabels: Record<string, string> = {
  lights: "Licht",
  covers: "Covers",
  climate: "Klimaat",
  media: "Media",
  security: "Veiligheid",
  power: "Energie",
  air_quality: "Luchtkwaliteit",
  presence: "Aanwezigheid"
};

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
  const value = state?.state;
  if (!value || value === "unknown") return "Onbekend";
  if (value === "unavailable") return "Niet beschikbaar";
  const unit = typeof state.attributes?.unit_of_measurement === "string" ? state.attributes.unit_of_measurement : "";
  return `${value}${unit ? ` ${unit}` : ""}`;
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
  const entities = [...room.hvac.comfort_entities, ...room.safety_entities, ...room.power_entities];
  return entities.slice(0, 3).map((entity) => stateText(hass?.states?.[entity]));
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
      .chips{display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px;border-top:1px solid var(--divider-color)}.chip{padding:5px 8px;border-radius:8px;background:color-mix(in srgb,var(--primary-color) 10%,transparent);color:var(--primary-color);font-size:.72rem;font-weight:600}
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
        for (const capability of room.capabilities.slice(0, 4)) {
          const chip = document.createElement("span");
          chip.className = "chip";
          chip.textContent = capabilityLabels[capability] ?? capability;
          chips.append(chip);
        }
        article.append(link, chips);
        grid.append(article);
      }
      section.append(heading, grid);
      root.append(section);
    });
    this.shadowRoot.replaceChildren(style, root);
  }
}

export class HomeDashboardRoomHero extends RoomCardBase<RoomHeroConfig> {
  public setConfig(config: RoomHeroConfig): void {
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

  public connectedCallback(): void {
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot || !this.config) return;
    const style = document.createElement("style");
    style.textContent = `
      :host{display:block}.hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px;border-radius:22px;background:var(--primary-color,#245c4d);color:var(--text-primary-color,#fff)}.copy{display:grid;gap:4px}.eyebrow{font-size:.74rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.78}.hero h2{margin:0;font-size:1.8rem}.hero p{margin:0;opacity:.75}.context{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}.context span{padding:7px 10px;border:1px solid color-mix(in srgb,currentColor 28%,transparent);border-radius:999px;font-size:.78rem;font-weight:600}
      @media(max-width:700px){.hero{align-items:flex-start;flex-direction:column;padding:18px}.hero h2{font-size:1.5rem}.context{justify-content:flex-start}}
    `;
    const hero = document.createElement("section");
    hero.className = "hero";
    const copy = document.createElement("div");
    copy.className = "copy";
    const eyebrow = document.createElement("span");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Kamer";
    const title = document.createElement("h2");
    title.textContent = this.config.room.name;
    const subtitle = document.createElement("p");
    subtitle.textContent = "Primaire status, comfort, veiligheid, apparaten en historie.";
    copy.append(eyebrow, title, subtitle);
    const context = document.createElement("div");
    context.className = "context";
    const values = [getRoomMetric(this.currentHass, this.config.room), ...roomContext(this.currentHass, this.config.room)].slice(0, 3);
    values.forEach((value) => {
      const pill = document.createElement("span");
      pill.textContent = value;
      context.append(pill);
    });
    hero.append(copy, context);
    this.shadowRoot.replaceChildren(style, hero);
  }
}

export class HomeDashboardRoomClimate extends RoomCardBase<RoomClimateConfig> {
  public setConfig(config: RoomClimateConfig): void {
    if (!config.room?.hvac.entity) throw new Error("Klimaatbron ontbreekt.");
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

  public connectedCallback(): void {
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot || !this.config) return;
    const room = this.config.room;
    const climate = this.currentHass?.states?.[room.hvac.entity];
    const attribute = (key: string): string => {
      const value = climate?.attributes?.[key];
      return typeof value === "string" || typeof value === "number" ? String(value) : "—";
    };
    const style = document.createElement("style");
    style.textContent = `
      :host{display:block}.climate{display:grid;gap:16px;padding:18px;border-radius:16px;background:var(--ha-card-background,var(--card-background-color));box-shadow:var(--ha-card-box-shadow)}.top{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:16px}.state{display:grid;gap:3px}.state span,.target span,.label{font-size:.76rem;color:var(--secondary-text-color)}.state strong{font-size:1.65rem}.state small{color:var(--secondary-text-color)}.target{display:grid;text-align:right}.target strong{font-size:1.5rem}.groups{display:grid;gap:12px}.group{display:grid;gap:6px}.chips{display:flex;gap:6px;flex-wrap:wrap}.chip{padding:7px 10px;border-radius:999px;background:var(--secondary-background-color);font-size:.78rem}.chip.active{background:var(--primary-color);color:var(--text-primary-color,#fff);font-weight:700}.readouts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.readout{display:grid;padding:9px;border-radius:10px;background:var(--secondary-background-color)}.readout span{font-size:.72rem;color:var(--secondary-text-color)}.readout strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      @media(max-width:600px){.top{grid-template-columns:1fr}.target{text-align:left}.readouts{grid-template-columns:1fr}}
    `;
    const panel = document.createElement("article");
    panel.className = "climate";
    const top = document.createElement("div");
    top.className = "top";
    const state = document.createElement("div");
    state.className = "state";
    const stateLabel = document.createElement("span");
    stateLabel.textContent = "Kamertemperatuur";
    const stateValue = document.createElement("strong");
    const current = numberAttribute(climate, "current_temperature");
    stateValue.textContent = current === undefined ? "—" : `${current} °C`;
    const stateDetail = document.createElement("small");
    stateDetail.textContent = climate?.state && !["unknown", "unavailable"].includes(climate.state) ? climate.state : "Niet beschikbaar";
    state.append(stateLabel, stateValue, stateDetail);
    const target = document.createElement("div");
    target.className = "target";
    const targetLabel = document.createElement("span");
    targetLabel.textContent = "Doel";
    const targetValue = document.createElement("strong");
    const targetTemperature = numberAttribute(climate, "temperature");
    targetValue.textContent = targetTemperature === undefined ? "—" : `${targetTemperature} °C`;
    target.append(targetLabel, targetValue);
    top.append(state, target);
    panel.append(top);

    if (room.hvac.modes.length > 0) {
      const group = document.createElement("div");
      group.className = "group";
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = "Modi";
      const chips = document.createElement("div");
      chips.className = "chips";
      room.hvac.modes.forEach((mode) => {
        const chip = document.createElement("span");
        chip.className = `chip${climate?.state === mode ? " active" : ""}`;
        chip.textContent = mode;
        chips.append(chip);
      });
      group.append(label, chips);
      panel.append(group);
    }

    const readouts = document.createElement("div");
    readouts.className = "readouts";
    const values: Array<[string, string]> = [];
    if (room.hvac.presets.length > 0) values.push(["Preset", attribute("preset_mode")]);
    if (room.hvac.fan_modes.length > 0) values.push(["Ventilator", attribute("fan_mode")]);
    if (room.hvac.swing_modes.length > 0) values.push(["Swing", attribute("swing_mode")]);
    values.forEach(([label, value]) => {
      const readout = document.createElement("div");
      readout.className = "readout";
      const readoutLabel = document.createElement("span");
      readoutLabel.textContent = label;
      const readoutValue = document.createElement("strong");
      readoutValue.textContent = value;
      readout.append(readoutLabel, readoutValue);
      readouts.append(readout);
    });
    if (values.length > 0) panel.append(readouts);
    this.shadowRoot.replaceChildren(style, panel);
  }
}

export function registerHomeDashboardRoomCards(): void {
  if (typeof customElements === "undefined" || typeof window === "undefined") return;
  const cards: Array<[string, CustomElementConstructor, string, string]> = [
    ["home-dashboard-room-overview", HomeDashboardRoomOverview, "Home Dashboard Room Overview", "Verdiepingsgewijs kameroverzicht met compacte statuskaarten."],
    ["home-dashboard-room-hero", HomeDashboardRoomHero, "Home Dashboard Room Hero", "Contextheader voor een kamerdetail-subview."],
    ["home-dashboard-room-climate", HomeDashboardRoomClimate, "Home Dashboard Room Climate", "Read-only klimaatcontext met modi, doel, preset, ventilator en swing."]
  ];
  window.customCards ??= [];
  for (const [tag, constructor, name, description] of cards) {
    if (!customElements.get(tag)) customElements.define(tag, constructor);
    if (!window.customCards.some((card) => card.type === tag)) window.customCards.push({ type: tag, name, description, preview: true });
  }
}
