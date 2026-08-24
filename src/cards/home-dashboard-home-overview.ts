import type {
  DiagnosticsConfig,
  EnergyConfig,
  PersonConfig,
  RoomConfig,
  SecurityConfig,
  SpecialistsConfig,
  TodayConfig
} from "../config/types";
import { roomPath } from "./home-dashboard-room-cards";

type StateLike = { state?: string; attributes?: Record<string, unknown> };
type HomeAssistantLike = { states?: Record<string, StateLike> };
type LovelaceCardElement = HTMLElement & { hass: HomeAssistantLike | undefined; setConfig?: (config: Record<string, unknown>) => void };
type CardHelpers = { createCardElement: (config: Record<string, unknown>) => LovelaceCardElement };

interface HomeOverviewConfig {
  type: "custom:home-dashboard-home-overview";
  today?: TodayConfig;
  persons?: PersonConfig[];
  security?: SecurityConfig;
  rooms?: RoomConfig[];
  specialists?: SpecialistsConfig;
  diagnostics?: DiagnosticsConfig;
  energy?: EnergyConfig;
  show_weather?: boolean;
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

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function attentionEntities(hass: HomeAssistantLike | undefined, config: HomeOverviewConfig): string[] {
  const diagnosticAttention = config.diagnostics?.unavailable_policy === "hidden" ? [] : (config.diagnostics?.operational_entities ?? [])
    .filter((entity) => ["unknown", "unavailable"].includes(hass?.states?.[entity]?.state ?? ""));
  const safetyAttention = (config.rooms ?? []).flatMap((room) => room.safety_entities)
    .filter((entity) => ["on", "open", "problem", "unsafe", "unlocked"].includes(hass?.states?.[entity]?.state ?? ""));
  return unique([...diagnosticAttention, ...safetyAttention]);
}

export function getHomeStructureSignature(hass: HomeAssistantLike | undefined, config: HomeOverviewConfig): string {
  return attentionEntities(hass, config).join("|");
}

function formatState(state: StateLike | undefined): string {
  if (!state?.state || state.state === "unknown") return "Onbekend";
  if (state.state === "unavailable") return "Niet beschikbaar";
  const translations: Record<string, string> = {
    on: "Aan", off: "Uit", home: "Thuis", not_home: "Niet thuis", open: "Open", closed: "Gesloten", playing: "Speelt",
    rainy: "Regenachtig", cloudy: "Bewolkt", partlycloudy: "Halfbewolkt", sunny: "Zonnig", "clear-night": "Heldere nacht"
  };
  const value = translations[state.state] ?? state.state;
  const unit = typeof state.attributes?.unit_of_measurement === "string" ? state.attributes.unit_of_measurement : "";
  return `${value}${unit ? ` ${unit}` : ""}`;
}

function friendlyName(state: StateLike | undefined, fallback: string): string {
  return typeof state?.attributes?.friendly_name === "string" ? state.attributes.friendly_name : fallback;
}

function showMoreInfo(host: HTMLElement, entity: string): void {
  host.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
}

function navigationLink(label: string, iconName: string, path: string): HTMLAnchorElement {
  const link = document.createElement("a");
  link.className = "nav-card";
  link.href = path;
  const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
  icon.icon = iconName;
  const text = document.createElement("span");
  text.textContent = label;
  link.append(icon, text);
  return link;
}

function sectionHeader(titleText: string, subtitleText: string): HTMLElement {
  const header = document.createElement("header");
  header.className = "section-header";
  const copy = document.createElement("span");
  const title = document.createElement("strong");
  title.textContent = titleText;
  const subtitle = document.createElement("small");
  subtitle.textContent = subtitleText;
  copy.append(title, subtitle);
  header.append(copy);
  return header;
}

function stateButton(host: HTMLElement, hass: HomeAssistantLike | undefined, entity: string, label?: string): HTMLButtonElement {
  const state = hass?.states?.[entity];
  const button = document.createElement("button");
  button.type = "button";
  button.className = "state-card";
  button.dataset.entity = entity;
  if (label) button.dataset.label = label;
  button.setAttribute("aria-label", `Open ${friendlyName(state, label ?? entity)}`);
  const copy = document.createElement("span");
  copy.className = "state-copy";
  const name = document.createElement("strong");
  name.textContent = label ?? friendlyName(state, entity);
  const value = document.createElement("span");
  value.textContent = formatState(state);
  copy.append(name, value);
  button.append(copy);
  button.addEventListener("click", () => showMoreInfo(host, entity));
  return button;
}

function wasteButton(host: HTMLElement, hass: HomeAssistantLike | undefined, entity: string): HTMLButtonElement {
  const button = stateButton(host, hass, entity);
  button.classList.add("waste-card");
  const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
  icon.icon = "mdi:trash-can-outline";
  button.prepend(icon);
  return button;
}

export class HomeDashboardHomeOverview extends HTMLElementBase {
  private config?: HomeOverviewConfig;
  private currentHass?: HomeAssistantLike;
  private currentStructureSignature = "";
  private hasRendered = false;
  private renderToken = 0;
  private childCards: LovelaceCardElement[] = [];

  public constructor() {
    super();
    this.attachShadow?.({ mode: "open" });
  }

  public setConfig(config: HomeOverviewConfig): void {
    this.config = config;
    this.currentStructureSignature = "";
    this.hasRendered = false;
    void this.render();
  }

  public set hass(value: HomeAssistantLike) {
    this.currentHass = value;
    const next = this.config ? getHomeStructureSignature(value, this.config) : "";
    if (!this.hasRendered || next !== this.currentStructureSignature) {
      void this.render();
      return;
    }
    this.updateLiveState();
    this.childCards.forEach((card) => { card.hass = value; });
  }

  public connectedCallback(): void {
    void this.render();
  }

  public getCardSize(): number { return 12; }
  public getGridOptions(): Record<string, unknown> { return { columns: "full", rows: "auto", min_columns: 6 }; }

  private updateLiveState(): void {
    if (!this.shadowRoot || !this.config) return;
    const hass = this.currentHass;
    this.shadowRoot.querySelectorAll<HTMLButtonElement>(".state-card[data-entity]").forEach((button) => {
      const entity = button.dataset.entity;
      if (!entity) return;
      const state = hass?.states?.[entity];
      const label = button.dataset.label;
      const name = button.querySelector<HTMLElement>(".state-copy strong");
      const value = button.querySelector<HTMLElement>(".state-copy span");
      if (name) name.textContent = label ?? friendlyName(state, entity);
      if (value) value.textContent = formatState(state);
      button.setAttribute("aria-label", `Open ${friendlyName(state, label ?? entity)}`);
    });
    const homeCount = (this.config.persons ?? []).filter((person) => hass?.states?.[person.entity]?.state === "home").length;
    const homePill = this.shadowRoot.querySelector<HTMLElement>("[data-live='home-count']");
    if (homePill) homePill.textContent = `${homeCount} thuis`;
    const weatherPill = this.shadowRoot.querySelector<HTMLElement>("[data-live='weather']");
    const weather = this.config.today?.weather_entity ? hass?.states?.[this.config.today.weather_entity] : undefined;
    if (weatherPill) weatherPill.textContent = weather ? `${weather.attributes?.temperature ?? "—"}° · ${formatState(weather)}` : "Weer niet ingesteld";
    const attentionPill = this.shadowRoot.querySelector<HTMLElement>("[data-live='attention']");
    const attentionCount = attentionEntities(hass, this.config).length;
    if (attentionPill) attentionPill.textContent = `${attentionCount} aandachtspunt${attentionCount === 1 ? "" : "en"}`;
    this.shadowRoot.querySelectorAll<HTMLButtonElement>(".person[data-person-index]").forEach((button) => {
      const person = this.config?.persons?.[Number(button.dataset.personIndex)];
      if (!person) return;
      const state = hass?.states?.[person.entity];
      const name = button.querySelector<HTMLElement>(".person-copy strong");
      const context = button.querySelector<HTMLElement>(".person-copy small");
      const status = button.querySelector<HTMLElement>(".person-state");
      const location = person.show_location ? formatState(state) : state?.state === "home" ? "Thuis" : "Niet thuis";
      const batteries = person.battery_entities.map((entity) => formatState(hass?.states?.[entity])).filter((value) => value !== "Onbekend").slice(0, 3);
      if (name) name.textContent = person.label || friendlyName(state, "Bewoner");
      if (context) context.textContent = [location, ...batteries].join(" · ");
      if (status) status.textContent = person.show_location ? formatState(state) : state?.state === "home" ? "Thuis" : "Afwezig";
    });
  }

  private async render(): Promise<void> {
    if (!this.shadowRoot || !this.config) return;
    const token = ++this.renderToken;
    const cardLoader = typeof window !== "undefined"
      ? (window as unknown as { loadCardHelpers?: () => Promise<CardHelpers> }).loadCardHelpers
      : undefined;
    const helpers = cardLoader
      ? await cardLoader().catch(() => undefined)
      : undefined;
    if (token !== this.renderToken) return;
    this.childCards = [];
    const config = this.config;
    const hass = this.currentHass;
    const style = document.createElement("style");
    style.textContent = `
      :host{display:block;min-width:0}.home{display:grid;gap:24px;max-width:1180px;margin:0 auto}.top{display:flex;justify-content:space-between;align-items:end;gap:16px}.date{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--secondary-text-color)}h1{margin:3px 0 0;font-size:2rem}.pills{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.pill{padding:7px 10px;border:1px solid var(--divider-color);border-radius:999px;background:var(--ha-card-background,var(--card-background-color));font-size:.78rem}.pill.attention{background:color-mix(in srgb,var(--warning-color,#f0a000) 16%,var(--card-background-color));color:var(--primary-text-color)}
      .attention-banner{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:12px;padding:16px;border:1px solid color-mix(in srgb,var(--warning-color,#f0a000) 40%,var(--divider-color));border-radius:18px;background:color-mix(in srgb,var(--warning-color,#f0a000) 14%,var(--card-background-color))}.attention-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--card-background-color);color:var(--warning-color,#f0a000)}.attention-copy{display:grid}.attention-copy span{font-size:.76rem;color:var(--secondary-text-color)}
      section{display:grid;gap:10px}.section-header span{display:grid}.section-header strong{font-size:1.05rem}.section-header small{color:var(--secondary-text-color)}.today-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,1fr);gap:12px;align-items:start}.today-grid.with-security{grid-template-columns:minmax(300px,1.2fr) minmax(260px,1fr) minmax(270px,.9fr)}.today-side,.security-panel{display:grid;gap:10px;align-content:start}.kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.state-card{display:grid;text-align:left;gap:3px;padding:12px;border:1px solid var(--divider-color);border-radius:14px;background:var(--ha-card-background,var(--card-background-color));color:var(--primary-text-color);cursor:pointer}.state-card:hover{border-color:var(--primary-color)}.state-copy{display:grid;gap:3px;min-width:0}.state-copy strong,.state-copy span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.state-copy span{font-size:.8rem;color:var(--secondary-text-color)}.waste-group{display:grid;gap:7px;padding-top:2px}.waste-heading{display:grid}.waste-heading small{color:var(--secondary-text-color);font-size:.76rem}.waste{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.waste-card{grid-template-columns:28px minmax(0,1fr);align-items:center}.waste-card ha-icon{color:var(--primary-color)}
      .people{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.person{display:grid;grid-template-columns:46px minmax(0,1fr) auto;align-items:center;gap:10px;padding:10px;border:1px solid var(--divider-color);border-radius:15px;background:var(--ha-card-background,var(--card-background-color));color:var(--primary-text-color);cursor:pointer;text-align:left}.avatar{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;overflow:hidden;background:var(--primary-color);color:var(--text-primary-color,#fff);font-weight:700}.avatar img{width:100%;height:100%;object-fit:cover}.person-copy{display:grid}.person-copy small{color:var(--secondary-text-color)}.person-state{padding:6px 9px;border-radius:999px;background:color-mix(in srgb,var(--primary-color) 12%,transparent);color:var(--primary-color);font-size:.76rem;font-weight:700}
      .nav-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.nav-card{display:flex;align-items:center;gap:9px;min-height:48px;padding:10px 12px;border:1px solid var(--divider-color);border-radius:14px;background:var(--ha-card-background,var(--card-background-color));color:var(--primary-text-color);text-decoration:none;font-weight:650}.nav-card ha-icon{color:var(--primary-color)}.security{display:grid;gap:8px;align-items:start}.empty{padding:16px;border:1px dashed var(--divider-color);border-radius:14px;color:var(--secondary-text-color)}
      @media(max-width:1050px){.today-grid.with-security{grid-template-columns:minmax(0,1.2fr) minmax(280px,1fr)}.security-panel{grid-column:1/-1}}
      @media(max-width:800px){.home{gap:20px}.top{align-items:flex-start;flex-direction:column}.pills{justify-content:flex-start}.today-grid,.today-grid.with-security{grid-template-columns:1fr}.security-panel{grid-column:auto}.nav-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:560px){h1{font-size:1.65rem}.people,.waste{grid-template-columns:1fr}.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.attention-banner{grid-template-columns:38px minmax(0,1fr)}.attention-banner>a{display:none}.person{grid-template-columns:42px minmax(0,1fr) auto}}
    `;
    const root = document.createElement("main");
    root.className = "home";

    const now = new Date();
    const hour = now.getHours();
    const top = document.createElement("header");
    top.className = "top";
    const intro = document.createElement("div");
    const date = document.createElement("div");
    date.className = "date";
    date.textContent = new Intl.DateTimeFormat("nl-BE", { weekday: "long", day: "numeric", month: "long" }).format(now);
    const greeting = document.createElement("h1");
    greeting.textContent = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";
    intro.append(date, greeting);
    const pills = document.createElement("div");
    pills.className = "pills";
    const homeCount = (config.persons ?? []).filter((person) => hass?.states?.[person.entity]?.state === "home").length;
    const currentAttentionEntities = attentionEntities(hass, config);
    const weather = config.today?.weather_entity ? hass?.states?.[config.today.weather_entity] : undefined;
    const weatherTemperature = weather?.attributes?.temperature;
    for (const [text, attention, live] of [[`${homeCount} thuis`, false, "home-count"], [weather ? `${weatherTemperature ?? "—"}° · ${formatState(weather)}` : "Weer niet ingesteld", false, "weather"], [`${currentAttentionEntities.length} aandachtspunt${currentAttentionEntities.length === 1 ? "" : "en"}`, currentAttentionEntities.length > 0, "attention"]] as const) {
      const pill = document.createElement("span");
      pill.className = `pill${attention ? " attention" : ""}`;
      pill.dataset.live = live;
      pill.textContent = text;
      pills.append(pill);
    }
    top.append(intro, pills);
    root.append(top);

    if (currentAttentionEntities.length > 0) {
      const entity = currentAttentionEntities[0]!;
      const banner = document.createElement("div");
      banner.className = "attention-banner";
      const attentionIcon = document.createElement("span");
      attentionIcon.className = "attention-icon";
      const haIcon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
      haIcon.icon = "mdi:alert-outline";
      attentionIcon.append(haIcon);
      const copy = document.createElement("span");
      copy.className = "attention-copy";
      const label = document.createElement("span");
      label.textContent = "Aandacht nodig";
      const title = document.createElement("strong");
      title.textContent = friendlyName(hass?.states?.[entity], "Operationele bron");
      copy.append(label, title);
      const open = document.createElement("a");
      open.href = "more";
      open.textContent = "Bekijken →";
      banner.append(attentionIcon, copy, open);
      root.append(banner);
    }

    const buildSecurityPanel = (): HTMLElement | undefined => {
      if (!config.security?.enabled) return undefined;
      const panel = document.createElement("aside");
      panel.className = "security-panel";
      panel.append(sectionHeader("Beveiliging", "Camera, privacy en alarm in één compacte kolom"));
      const layout = document.createElement("div");
      layout.className = "security";
      if (config.security.cameras.some((camera) => camera.camera_entity)) {
        const cameraStrip = document.createElement("home-dashboard-camera-strip") as LovelaceCardElement;
        cameraStrip.className = "camera";
        cameraStrip.setConfig?.({ type: "custom:home-dashboard-camera-strip", cameras: config.security.cameras.filter((camera) => camera.camera_entity), compact: true });
        cameraStrip.hass = hass;
        this.childCards.push(cameraStrip);
        layout.append(cameraStrip);
      }
      if (config.security.alarm_entity) {
        const alarm = stateButton(this, hass, config.security.alarm_entity, "Alarm");
        alarm.classList.add("alarm");
        layout.append(alarm);
      }
      if (!layout.childElementCount) return undefined;
      panel.append(layout);
      return panel;
    };

    if (config.today?.enabled) {
      const today = document.createElement("section");
      today.append(sectionHeader("Vandaag", "Weer, ophaling en energiecontext in één compacte zone"));
      const grid = document.createElement("div");
      grid.className = "today-grid";
      if (config.show_weather !== false && config.today.weather_entity && helpers) {
        const weatherCard = helpers.createCardElement({ type: "weather-forecast", entity: config.today.weather_entity, forecast_type: "daily", show_forecast: true });
        weatherCard.hass = hass;
        this.childCards.push(weatherCard);
        grid.append(weatherCard);
      } else {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Selecteer een weerbron onder Vandaag.";
        grid.append(empty);
      }
      const side = document.createElement("div");
      side.className = "today-side";
      const namedKpis: Array<readonly [string, string]> = [
        [config.today.battery_soc_entity, "Thuisbatterij SoC"],
        [config.today.battery_charge_power_entity, "Batterij laden"],
        [config.today.battery_discharge_power_entity, "Batterij ontladen"],
        [config.today.solar_power_entity, "Zonnepanelen opbrengst"],
        [config.today.home_consumption_entity, "Huisverbruik zonder batterijladen"],
        [config.today.monthly_capacity_peak_entity, "Maandelijkse vermogenspiek"]
      ];
      const configuredKpis = namedKpis.filter((candidate): candidate is readonly [string, string] => Boolean(candidate[0]));
      const extraKpis = unique(config.today.energy_context_entities)
        .filter((entity) => !configuredKpis.some(([configured]) => configured === entity))
        .map((entity) => [entity, undefined] as const);
      const fallbackKpis = [config.energy?.solar_entities[0], config.energy?.electricity_entities[0], config.energy?.battery_entities[0], config.energy?.ev_power_entity]
        .filter((entity): entity is string => Boolean(entity))
        .map((entity) => [entity, undefined] as const);
      const kpiEntities = [...configuredKpis, ...extraKpis];
      const visibleKpis = (kpiEntities.length > 0 ? kpiEntities : fallbackKpis).slice(0, 6);
      if (visibleKpis.length > 0) {
        const kpis = document.createElement("div");
        kpis.className = "kpis";
        visibleKpis.forEach(([entity, label]) => kpis.append(stateButton(this, hass, entity, label)));
        side.append(kpis);
      }
      if (config.today.waste_entities.length > 0) {
        const wasteGroup = document.createElement("div");
        wasteGroup.className = "waste-group";
        const wasteHeading = document.createElement("span");
        wasteHeading.className = "waste-heading";
        const wasteTitle = document.createElement("strong");
        wasteTitle.textContent = "Afvalophaling";
        const wasteSubtitle = document.createElement("small");
        wasteSubtitle.textContent = "Volgende ophalingen";
        wasteHeading.append(wasteTitle, wasteSubtitle);
        const waste = document.createElement("div");
        waste.className = "waste";
        config.today.waste_entities.slice(0, 4).forEach((entity) => waste.append(wasteButton(this, hass, entity)));
        wasteGroup.append(wasteHeading, waste);
        side.append(wasteGroup);
      }
      if (!side.childElementCount) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Voeg energiecontext en afvalbronnen toe onder Vandaag.";
        side.append(empty);
      }
      grid.append(side);
      const securityPanel = buildSecurityPanel();
      if (securityPanel) {
        grid.classList.add("with-security");
        grid.append(securityPanel);
      }
      today.append(grid);
      root.append(today);
    }

    if ((config.persons ?? []).length > 0) {
      const family = document.createElement("section");
      family.append(sectionHeader("Gezin", "Aanwezigheid zonder adres of coördinaten"));
      const people = document.createElement("div");
      people.className = "people";
      for (const [personIndex, person] of (config.persons ?? []).entries()) {
        const state = hass?.states?.[person.entity];
        const button = document.createElement("button");
        button.type = "button";
        button.className = "person";
        button.dataset.personIndex = String(personIndex);
        const avatar = document.createElement("span");
        avatar.className = "avatar";
        const picture = state?.attributes?.entity_picture;
        if (typeof picture === "string") {
          const image = document.createElement("img");
          image.src = picture;
          image.alt = "";
          avatar.append(image);
        } else avatar.textContent = (person.label || "?").slice(0, 1).toUpperCase();
        const copy = document.createElement("span");
        copy.className = "person-copy";
        const name = document.createElement("strong");
        name.textContent = person.label || friendlyName(state, "Bewoner");
        const context = document.createElement("small");
        const location = person.show_location ? formatState(state) : state?.state === "home" ? "Thuis" : "Niet thuis";
        const batteries = person.battery_entities.map((entity) => formatState(hass?.states?.[entity])).filter((value) => value !== "Onbekend").slice(0, 3);
        context.textContent = [location, ...batteries].join(" · ");
        copy.append(name, context);
        const status = document.createElement("span");
        status.className = "person-state";
        status.textContent = person.show_location ? formatState(state) : state?.state === "home" ? "Thuis" : "Afwezig";
        button.append(avatar, copy, status);
        button.addEventListener("click", () => showMoreInfo(this, person.entity));
        people.append(button);
      }
      family.append(people);
      root.append(family);
    }

    const navigation = document.createElement("section");
    navigation.append(sectionHeader("Snel naar", "Kamers en volledige specialistische dashboards"));
    const navGrid = document.createElement("div");
    navGrid.className = "nav-grid";
    (config.rooms ?? []).slice(0, 4).forEach((room) => navGrid.append(navigationLink(room.name, room.icon || "mdi:sofa-outline", roomPath(room))));
    const specialistNames: Record<keyof SpecialistsConfig, [string, string]> = {
      kia: ["Auto", "mdi:car-electric"], robot: ["Robot", "mdi:robot-vacuum"], garden: ["Tuin", "mdi:flower"], pool: ["Zwembad", "mdi:pool"]
    };
    (Object.entries(config.specialists ?? {}) as Array<[keyof SpecialistsConfig, SpecialistsConfig[keyof SpecialistsConfig]]>)
      .filter(([, specialist]) => specialist.enabled)
      .forEach(([key]) => navGrid.append(navigationLink(specialistNames[key][0], specialistNames[key][1], "more")));
    if (navGrid.childElementCount > 0) {
      navigation.append(navGrid);
      root.append(navigation);
    }

    if (!config.today?.enabled) {
      const securityPanel = buildSecurityPanel();
      if (securityPanel) root.append(securityPanel);
    }
    this.shadowRoot.replaceChildren(style, root);
    this.hasRendered = true;
    this.currentStructureSignature = getHomeStructureSignature(hass, config);
    this.updateLiveState();
  }
}

export function registerHomeDashboardHomeOverview(): void {
  if (typeof customElements === "undefined" || typeof window === "undefined") return;
  const tag = "home-dashboard-home-overview";
  if (!customElements.get(tag)) customElements.define(tag, HomeDashboardHomeOverview);
  window.customCards ??= [];
  if (!window.customCards.some((card) => card.type === tag)) {
    window.customCards.push({ type: tag, name: "Home Dashboard Home Overview", description: "Samenhangend Home-overzicht met vandaag, gezin, navigatie en compacte security.", preview: true });
  }
}
