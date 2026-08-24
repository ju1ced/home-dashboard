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

function entityIcon(entity: string): string {
  const domain = entity.split(".")[0] ?? "";
  const icons: Record<string, string> = {
    light: "mdi:lightbulb-outline", cover: "mdi:window-shutter", climate: "mdi:thermostat", media_player: "mdi:speaker",
    camera: "mdi:cctv", binary_sensor: "mdi:shield-check-outline", sensor: "mdi:gauge", switch: "mdi:toggle-switch-outline"
  };
  return icons[domain] ?? "mdi:devices";
}

function roomDeviceChips(room: RoomConfig): Array<{ label: string; entity: string }> {
  return [
    { label: "Licht", entity: room.light_entities[0] ?? "" },
    { label: "Cover", entity: room.cover_entities[0] ?? "" },
    { label: "Klimaat", entity: room.hvac.entity },
    { label: "Media", entity: room.media_entities[0] ?? "" },
    { label: "Veiligheid", entity: room.safety_entities[0] ?? "" },
    { label: "Energie", entity: room.power_entities[0] ?? "" }
  ].filter((candidate): candidate is { label: string; entity: string } => Boolean(candidate.entity)).slice(0, 4);
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
      .chips{display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px;border-top:1px solid var(--divider-color)}.chip{display:inline-flex;align-items:center;gap:4px;padding:6px 9px;border:0;border-radius:9px;background:color-mix(in srgb,var(--primary-color) 10%,transparent);color:var(--primary-color);font-size:.72rem;font-weight:700;cursor:pointer}.chip:hover{background:color-mix(in srgb,var(--primary-color) 18%,transparent)}.chip span{color:var(--secondary-text-color);font-weight:500}
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
        for (const device of roomDeviceChips(room)) {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "chip";
          chip.textContent = device.label;
          const deviceState = document.createElement("span");
          deviceState.textContent = stateText(this.currentHass?.states?.[device.entity]);
          chip.append(deviceState);
          chip.setAttribute("aria-label", `Open ${device.label} voor ${room.name}`);
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

  private entityCard(entity: string, compact = false): HTMLButtonElement {
    const state = this.currentHass?.states?.[entity];
    const button = document.createElement("button");
    button.type = "button";
    button.className = compact ? "entity compact" : "entity";
    button.setAttribute("aria-label", `Open ${friendlyName(state, entity)}`);
    const entityIconElement = document.createElement("span");
    entityIconElement.className = "entity-icon";
    entityIconElement.append(icon(entityIcon(entity)));
    const copy = document.createElement("span");
    copy.className = "entity-copy";
    const name = document.createElement("strong");
    name.textContent = friendlyName(state, entity);
    const value = document.createElement("small");
    value.textContent = stateText(state);
    copy.append(name, value);
    const chevron = icon("mdi:chevron-right");
    chevron.className = "entity-chevron";
    button.append(entityIconElement, copy, chevron);
    button.addEventListener("click", () => showMoreInfo(this, entity));
    return button;
  }

  private group(titleText: string, subtitleText: string, entities: string[], compact = false): HTMLElement | undefined {
    const unique = [...new Set(entities.filter(Boolean))];
    if (unique.length === 0) return undefined;
    const section = document.createElement("section");
    section.className = "group";
    const header = document.createElement("header");
    const title = document.createElement("strong");
    title.textContent = titleText;
    const subtitle = document.createElement("small");
    subtitle.textContent = subtitleText;
    header.append(title, subtitle);
    const grid = document.createElement("div");
    grid.className = compact ? "entity-list" : "entity-grid";
    unique.forEach((entity) => grid.append(this.entityCard(entity, compact)));
    section.append(header, grid);
    return section;
  }

  private render(): void {
    if (!this.shadowRoot || !this.config) return;
    const room = this.config.room;
    const style = document.createElement("style");
    style.textContent = `
      :host{display:block;min-width:0}.detail{display:grid;gap:22px;max-width:1180px;margin:0 auto}.hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px;border-radius:22px;background:var(--primary-color,#245c4d);color:var(--text-primary-color,#fff)}.hero-copy{display:grid;gap:4px}.eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.75}.hero h1{margin:0;font-size:1.85rem}.hero p{margin:0;opacity:.75}.hero-pills{display:flex;justify-content:flex-end;gap:7px;flex-wrap:wrap}.hero-pill{padding:7px 10px;border:1px solid color-mix(in srgb,currentColor 28%,transparent);border-radius:999px;font-size:.78rem;font-weight:650}
      .group{display:grid;gap:10px}.group header{display:grid}.group header>strong{font-size:1.05rem}.group header>small{color:var(--secondary-text-color)}.status-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.status{display:grid;gap:5px;min-height:72px;padding:12px;border:1px solid var(--divider-color);border-radius:14px;background:var(--ha-card-background,var(--card-background-color))}.status ha-icon{color:var(--primary-color)}.status small{color:var(--secondary-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.status strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .columns{display:grid;grid-template-columns:minmax(0,2fr) minmax(250px,1fr);gap:20px;align-items:start}.columns.side-only{grid-template-columns:1fr}.main,.side{display:grid;gap:20px}.entity-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.entity-list{display:grid;gap:8px}.entity{display:grid;grid-template-columns:42px minmax(0,1fr) 22px;align-items:center;gap:10px;min-height:74px;padding:12px;border:1px solid var(--divider-color);border-radius:15px;background:var(--ha-card-background,var(--card-background-color));color:var(--primary-text-color);cursor:pointer;text-align:left}.entity:hover{border-color:var(--primary-color)}.entity.compact{min-height:60px}.entity-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:color-mix(in srgb,var(--primary-color) 12%,transparent);color:var(--primary-color)}.entity-copy{display:grid;min-width:0}.entity-copy strong,.entity-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.entity-copy small{color:var(--secondary-text-color)}.entity-chevron{color:var(--secondary-text-color)}
      .climate{display:grid;grid-template-columns:minmax(210px,.8fr) minmax(0,2fr);gap:12px;padding:16px;border:1px solid var(--divider-color);border-radius:16px;background:var(--ha-card-background,var(--card-background-color))}.climate-main{display:grid;align-content:center;gap:5px}.climate-main span{color:var(--secondary-text-color);font-size:.78rem}.climate-main strong{font-size:2rem}.climate-main button{justify-self:start;border:0;background:none;color:var(--primary-color);padding:0;cursor:pointer}.climate-sensors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.history-note{padding:12px;border-radius:12px;background:var(--secondary-background-color);color:var(--secondary-text-color);font-size:.82rem}
      @media(max-width:900px){.status-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.columns{grid-template-columns:1fr}.side{grid-template-columns:repeat(2,minmax(0,1fr))}.climate{grid-template-columns:1fr}}
      @media(max-width:600px){.detail{gap:18px}.hero{align-items:flex-start;flex-direction:column;padding:18px}.hero h1{font-size:1.55rem}.hero-pills{justify-content:flex-start}.status-grid,.entity-grid,.climate-sensors,.side{grid-template-columns:repeat(2,minmax(0,1fr))}.entity{grid-template-columns:36px minmax(0,1fr);min-height:70px}.entity-chevron{display:none}.entity-icon{width:36px;height:36px}.entity-copy strong{font-size:.88rem}.side{display:grid}.status{min-height:66px}}
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

    const statusEntities = [...new Set([...room.hvac.comfort_entities, ...room.safety_entities, ...room.history_entities].filter(Boolean))].slice(0, 6);
    if (statusEntities.length > 0) {
      const statusGroup = document.createElement("section");
      statusGroup.className = "group";
      const header = document.createElement("header");
      const headerTitle = document.createElement("strong");
      headerTitle.textContent = "Ruimtestatus";
      const headerCopy = document.createElement("small");
      headerCopy.textContent = "De belangrijkste sensoren blijven op mobiel direct zichtbaar";
      header.append(headerTitle, headerCopy);
      const grid = document.createElement("div");
      grid.className = "status-grid";
      statusEntities.forEach((entity) => {
        const state = this.currentHass?.states?.[entity];
        const card = document.createElement("button");
        card.type = "button";
        card.className = "status";
        card.append(icon(entityIcon(entity)));
        const label = document.createElement("small");
        label.textContent = friendlyName(state, entity);
        const value = document.createElement("strong");
        value.textContent = stateText(state);
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
    const primary = this.group("Bediening", "Licht, covers en primaire toestanden", [...room.light_entities, ...room.cover_entities, room.hvac.entity]);
    if (primary) main.append(primary);
    if (room.hvac.entity || room.hvac.comfort_entities.length > 0) {
      const climateGroup = document.createElement("section");
      climateGroup.className = "group";
      const header = document.createElement("header");
      const headerTitle = document.createElement("strong");
      headerTitle.textContent = "Comfort & klimaat";
      const headerCopy = document.createElement("small");
      headerCopy.textContent = "Actuele toestand, doel en omgevingswaarden";
      header.append(headerTitle, headerCopy);
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
      room.hvac.comfort_entities.forEach((entity) => sensors.append(this.entityCard(entity, true)));
      if (sensors.childElementCount > 0) panel.append(sensors);
      climateGroup.append(header, panel);
      main.append(climateGroup);
    }
    const power = this.group("Apparaten & energie", "Actuele apparaat- en verbruiksstatus", room.power_entities);
    if (power) main.append(power);
    columns.append(main);
    const side = document.createElement("aside");
    side.className = "side";
    const media = this.group("Media", "Spelers en audio", room.media_entities, true);
    const safety = this.group("Veiligheid", "Openingen, melders en camera's", [...room.safety_entities, ...room.camera_entities], true);
    if (media) side.append(media);
    if (safety) side.append(safety);
    if (side.childElementCount > 0) columns.append(side);
    if (main.childElementCount === 0 && side.childElementCount > 0) columns.classList.add("side-only");
    if (main.childElementCount > 0 || side.childElementCount > 0) root.append(columns);

    const historyCount = new Set([...room.history_entities, ...room.hvac.history_entities].filter(Boolean)).size;
    if (historyCount > 0) {
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
