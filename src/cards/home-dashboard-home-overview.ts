import { HomeDashboardRoomControls, favoriteRooms } from "./home-dashboard-room-controls";
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
import { applyDashboardPalette, type DashboardPalette } from "../theme/palettes";

type StateLike = { state?: string; attributes?: Record<string, unknown>; last_changed?: string; last_updated?: string };
type ForecastLike = { datetime?: string; condition?: string; temperature?: number; templow?: number };
type ForecastEventLike = { type?: string; forecast?: ForecastLike[] | null };
type Unsubscribe = () => void | Promise<void>;
type HomeAssistantLike = {
  states?: Record<string, StateLike>;
  callService?: (domain: string, service: string, data: Record<string, unknown>) => Promise<unknown>;
  connection?: { subscribeMessage?: (callback: (event: ForecastEventLike) => void, message: Record<string, unknown>) => Promise<Unsubscribe> };
};
type LovelaceCardElement = HTMLElement & { hass: HomeAssistantLike | undefined; setConfig?: (config: Record<string, unknown>) => void };

interface HomeOverviewConfig {
  type: "custom:home-dashboard-home-overview";
  theme_mode?: "system" | "light" | "dark";
  palette?: DashboardPalette;
  today?: TodayConfig;
  persons?: PersonConfig[];
  security?: SecurityConfig;
  rooms?: RoomConfig[];
  specialists?: SpecialistsConfig;
  diagnostics?: DiagnosticsConfig;
  energy?: EnergyConfig;
  show_weather?: boolean;
  show_quick_actions?: boolean;
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

type AttentionPriority = "critical" | "warning" | "offline";
interface AttentionItem { entity: string; priority: AttentionPriority; state: string; label: string }
interface ActivityItem { entity: string; room?: RoomConfig; label: string; detail: string; icon: string; signature: string }

const priorityOrder: Record<AttentionPriority, number> = { critical: 0, warning: 1, offline: 2 };

function attentionItems(hass: HomeAssistantLike | undefined, config: HomeOverviewConfig): AttentionItem[] {
  const byEntity = new Map<string, AttentionItem>();
  for (const room of config.rooms ?? []) {
    for (const entity of room.safety_entities) {
      const state = hass?.states?.[entity];
      const value = state?.state ?? "";
      if (!["on", "open", "problem", "unsafe", "unlocked"].includes(value)) continue;
      const priority: AttentionPriority = ["problem", "unsafe"].includes(value) ? "critical" : "warning";
      byEntity.set(entity, { entity, priority, state: value, label: friendlyName(state, room.name) });
    }
  }
  if (config.diagnostics?.unavailable_policy !== "hidden") {
    for (const entity of config.diagnostics?.operational_entities ?? []) {
      const state = hass?.states?.[entity];
      const value = state?.state ?? "";
      if (!["unknown", "unavailable"].includes(value) || byEntity.has(entity)) continue;
      byEntity.set(entity, { entity, priority: "offline", state: value, label: friendlyName(state, "Operationele bron") });
    }
  }
  return [...byEntity.values()].sort((left, right) => priorityOrder[left.priority] - priorityOrder[right.priority] || left.label.localeCompare(right.label, "nl-BE"));
}

function numericState(state: StateLike | undefined): number | undefined {
  const parsed = Number.parseFloat(state?.state ?? "");
  return Number.isFinite(parsed) ? parsed : undefined;
}

function activeItems(hass: HomeAssistantLike | undefined, config: HomeOverviewConfig): ActivityItem[] {
  const items: ActivityItem[] = [];
  const add = (entity: string, room: RoomConfig | undefined, label: string, detail: string, icon: string, signature: string): void => {
    if (!items.some((item) => item.entity === entity)) items.push({ entity, ...(room ? { room } : {}), label, detail, icon, signature });
  };
  for (const room of config.rooms ?? []) {
    for (const entity of room.media_entities) {
      const state = hass?.states?.[entity];
      if (state?.state === "playing") add(entity, room, friendlyName(state, "Media"), `${room.name} · Speelt`, "mdi:play-circle-outline", "playing");
    }
    const hvacState = hass?.states?.[room.hvac.entity];
    const hvacAction = typeof hvacState?.attributes?.hvac_action === "string" ? hvacState.attributes.hvac_action : "";
    if (room.hvac.entity && ["heating", "cooling", "drying", "fan"].includes(hvacAction)) {
      const detail = hvacAction === "heating" ? "Verwarmt" : hvacAction === "cooling" ? "Koelt" : hvacAction === "drying" ? "Ontvochtigt" : "Ventileert";
      add(room.hvac.entity, room, room.name, detail, "mdi:thermostat", `hvac:${hvacAction}`);
    }
    for (const entity of room.cover_entities) {
      const state = hass?.states?.[entity];
      if (["opening", "closing"].includes(state?.state ?? "")) add(entity, room, friendlyName(state, "Cover"), `${room.name} · ${formatState(state)}`, "mdi:window-shutter", state!.state!);
    }
    for (const entity of room.light_entities) {
      const state = hass?.states?.[entity];
      if (state?.state === "on") add(entity, room, friendlyName(state, "Verlichting"), `${room.name} · Aan`, "mdi:lightbulb-on-outline", "on");
    }
  }
  const evEntity = config.energy?.ev_power_entity;
  if (evEntity) {
    const state = hass?.states?.[evEntity];
    const power = numericState(state);
    if (typeof power === "number" && power > 50) add(evEntity, undefined, "Auto laden", formatState(state), "mdi:car-electric", "charging");
  }
  return items;
}

export function getHomeStructureSignature(hass: HomeAssistantLike | undefined, config: HomeOverviewConfig): string {
  const attention = attentionItems(hass, config).map((item) => `${item.entity}:${item.priority}:${item.state}`);
  const favorites = new Set(favoriteRooms(config.rooms ?? []).map(room => room.key));
  const activity = remainingActivities(hass, config).map((item) => `${item.entity}:${item.signature}`);
  const rooms = [...favorites];
  return [...attention, "activities", ...activity, "rooms", ...rooms].join("|");
}

function remainingActivities(hass: HomeAssistantLike | undefined, config: HomeOverviewConfig): ActivityItem[] {
  const visibleTargets = new Set(config.show_quick_actions === false ? [] : favoriteRooms(config.rooms ?? []).flatMap(room => room.control_entities !== undefined
    ? room.control_entities
    : [room.control_light_entity, room.control_cover_entity, room.control_awning_entity, room.control_media_entity, room.hvac.entity]).filter(Boolean));
  return activeItems(hass, config).filter(item => !visibleTargets.has(item.entity)).slice(0, 4);
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

function personLocation(hass: HomeAssistantLike | undefined, person: PersonConfig, state: StateLike | undefined): string {
  if (state?.state === "home") return "Thuis";
  if (!person.show_location || !state?.state || ["not_home", "unknown", "unavailable"].includes(state.state)) {
    return state?.state === "unknown" || state?.state === "unavailable" ? formatState(state) : "Andere locatie";
  }
  const current = state.state.toLocaleLowerCase("nl-BE");
  const allowed = person.zone_entities
    .map((entity) => friendlyName(hass?.states?.[entity], "").toLocaleLowerCase("nl-BE"))
    .filter(Boolean);
  return allowed.includes(current) ? state.state : "Andere locatie";
}

function lowBatteryLabels(hass: HomeAssistantLike | undefined, person: PersonConfig): string[] {
  return person.battery_entities.flatMap((entity) => {
    const state = hass?.states?.[entity];
    const level = numericState(state);
    if (typeof level !== "number" || level >= 20) return [];
    return [`Batterij ${new Intl.NumberFormat("nl-BE", { maximumFractionDigits: 0 }).format(level)}%`];
  }).slice(0, 3);
}

function personContext(hass: HomeAssistantLike | undefined, person: PersonConfig): { location: string; context: string } {
  const state = hass?.states?.[person.entity];
  const location = personLocation(hass, person, state);

  const batteries = lowBatteryLabels(hass, person);
  return { location, context: batteries.join(" · ") };
}

const weatherIcons: Record<string, string> = {
  "clear-night": "mdi:weather-night", cloudy: "mdi:weather-cloudy", exceptional: "mdi:alert-circle-outline",
  fog: "mdi:weather-fog", hail: "mdi:weather-hail", lightning: "mdi:weather-lightning",
  "lightning-rainy": "mdi:weather-lightning-rainy", partlycloudy: "mdi:weather-partly-cloudy",
  pouring: "mdi:weather-pouring", rainy: "mdi:weather-rainy", snowy: "mdi:weather-snowy",
  "snowy-rainy": "mdi:weather-snowy-rainy", sunny: "mdi:weather-sunny", windy: "mdi:weather-windy",
  "windy-variant": "mdi:weather-windy-variant"
};

function weatherIcon(condition: string | undefined): string {
  return weatherIcons[condition ?? ""] ?? "mdi:weather-cloudy-alert";
}

function formatTemperature(value: unknown): string {
  return typeof value === "number" ? `${new Intl.NumberFormat("nl-BE", { maximumFractionDigits: 1 }).format(value)}°` : "—";
}

function weatherContent(hass: HomeAssistantLike | undefined, entity: string, forecast: ForecastLike[], days: number): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const state = hass?.states?.[entity];
  const now = document.createElement("span");
  now.className = "weather-now";
  const iconWrap = document.createElement("span");
  iconWrap.className = "weather-icon";
  const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
  icon.icon = weatherIcon(state?.state);
  iconWrap.append(icon);
  const copy = document.createElement("span");
  copy.className = "weather-copy";
  const condition = document.createElement("strong");
  condition.textContent = formatState(state);
  const location = document.createElement("small");
  location.textContent = friendlyName(state, "Weer");
  copy.append(condition, location);
  const temperature = document.createElement("strong");
  temperature.className = "weather-temperature";
  temperature.textContent = formatTemperature(state?.attributes?.temperature);
  now.append(iconWrap, copy, temperature);
  fragment.append(now);

  const row = document.createElement("span");
  row.className = "forecast-row";
  const visible = forecast.filter((entry) => entry.datetime).slice(0, Math.max(1, Math.min(days, 3)));
  if (visible.length === 0) {
    const missing = document.createElement("small");
    missing.className = "forecast-missing";
    missing.textContent = "Voorspelling wordt geladen";
    row.append(missing);
  } else {
    for (const entry of visible) {
      const item = document.createElement("span");
      item.className = "forecast-day";
      const day = document.createElement("small");
      day.textContent = new Intl.DateTimeFormat("nl-BE", { weekday: "short" }).format(new Date(entry.datetime!));
      const forecastIcon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
      forecastIcon.icon = weatherIcon(entry.condition);
      const values = document.createElement("strong");
      values.textContent = `${formatTemperature(entry.temperature)}${typeof entry.templow === "number" ? ` / ${formatTemperature(entry.templow)}` : ""}`;
      item.append(day, forecastIcon, values);
      row.append(item);
    }
  }
  fragment.append(row);
  return fragment;
}

interface WastePresentation {
  icon: string;
  label: string;
  date: string;
  relative: string;
  tone: "green" | "blue" | "yellow" | "neutral";
}

function parseWasteDate(state: StateLike | undefined): Date | undefined {
  const attributes = state?.attributes ?? {};
  const candidates = [attributes.date, attributes.next_date, attributes.pickup_date, attributes.next_pickup, attributes.collection_date, state?.state];
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const value = candidate.trim();
    const iso = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value);
    const local = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(value);
    const parts = iso ? [Number(iso[1]), Number(iso[2]), Number(iso[3])] : local ? [Number(local[3]), Number(local[2]), Number(local[1])] : undefined;
    if (!parts) continue;
    const parsed = new Date(parts[0]!, parts[1]! - 1, parts[2]!);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
}

export function getWastePresentation(state: StateLike | undefined, entity: string, now = new Date()): WastePresentation {
  const attributes = state?.attributes ?? {};
  const source = [entity, friendlyName(state, ""), attributes.waste_type, attributes.type, attributes.material, attributes.description]
    .filter((value) => typeof value === "string").join(" ").toLocaleLowerCase("nl-BE");
  const fraction = source.includes("pmd") || source.includes("plastic") || source.includes("verpakking")
    ? { icon: "mdi:recycle", label: "PMD", tone: "yellow" as const }
    : source.includes("papier") || source.includes("paper") || source.includes("karton")
      ? { icon: "mdi:file-document-outline", label: "Papier", tone: "blue" as const }
      : source.includes("gft") || source.includes("organic") || source.includes("groente") || source.includes("keukenafval")
        ? { icon: "mdi:food-apple-outline", label: "GFT", tone: "green" as const }
        : source.includes("groen") || source.includes("tuin") || source.includes("snoei")
          ? { icon: "mdi:leaf", label: "Groenafval", tone: "green" as const }
          : source.includes("glas")
            ? { icon: "mdi:bottle-wine-outline", label: "Glas", tone: "blue" as const }
            : source.includes("rest") || source.includes("huisvuil")
              ? { icon: "mdi:trash-can-outline", label: "Restafval", tone: "neutral" as const }
              : { icon: "mdi:delete-outline", label: "Afval", tone: "neutral" as const };
  const pickupDate = parseWasteDate(state);
  const explicitDaysValue = [attributes.days, attributes.days_until, attributes.days_to, attributes.days_until_collection, attributes.days_to_pickup]
    .find((value) => typeof value === "number" || (typeof value === "string" && /^\d+$/.test(value)));
  const explicitDays = typeof explicitDaysValue === "string" ? Number(explicitDaysValue) : explicitDaysValue;
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = typeof explicitDays === "number" ? Math.round(explicitDays)
    : pickupDate ? Math.round((pickupDate.getTime() - startToday.getTime()) / 86_400_000) : undefined;
  const relative = days === 0 ? "Vandaag" : days === 1 ? "Morgen" : typeof days === "number" && days > 1 ? `Over ${days} dagen` : "Datum onbekend";
  const date = pickupDate
    ? new Intl.DateTimeFormat("nl-BE", { weekday: "short", day: "numeric", month: "short" }).format(pickupDate)
    : formatState(state);
  return { ...fraction, date, relative };
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

function updateMetricPresentation(button: HTMLButtonElement, state: StateLike | undefined, label: string): void {
  const value = button.querySelector<HTMLElement>(".metric-value");
  const meta = button.querySelector<HTMLElement>(".metric-meta");
  const status = button.querySelector<HTMLElement>(".metric-status");
  const unavailable = !state || ["unknown", "unavailable"].includes(state.state ?? "");

  if (value) value.textContent = formatState(state);
  if (meta) meta.textContent = label;
  if (status) {
    status.textContent = unavailable ? (!state ? "Bron ontbreekt" : "Controleer bron") : "";
    status.hidden = !status.textContent;
  }
  button.classList.toggle("is-unavailable", unavailable);

  button.title = label;
  button.setAttribute("aria-label", `${label}: ${formatState(state)}. Open meer informatie.`);
}

function metricButton(host: HTMLElement, hass: HomeAssistantLike | undefined, entity: string, label: string, iconName: string): HTMLButtonElement {
  const state = hass?.states?.[entity];
  const button = document.createElement("button");
  button.type = "button";
  button.className = "metric-card";
  button.dataset.entity = entity;
  button.dataset.label = label;
  const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
  icon.icon = iconName;
  const copy = document.createElement("span");
  copy.className = "metric-copy";
  const value = document.createElement("strong");
  value.className = "metric-value";
  const meta = document.createElement("small");
  meta.className = "metric-meta";
  const status = document.createElement("small");
  status.className = "metric-status";
  copy.append(value, meta, status);
  button.append(icon, copy);
  updateMetricPresentation(button, state, label);
  button.addEventListener("click", () => showMoreInfo(host, entity));
  return button;
}

function activityButton(host: HTMLElement, hass: HomeAssistantLike | undefined, item: ActivityItem): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "activity-card";
  button.dataset.entity = item.entity;
  button.setAttribute("aria-label", `${item.label}: ${item.detail}. Open meer informatie.`);
  const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
  icon.icon = item.icon;
  const copy = document.createElement("span");
  const label = document.createElement("strong");
  label.textContent = item.label;
  const detail = document.createElement("small");
  detail.textContent = item.detail;
  copy.append(label, detail);
  button.append(icon, copy);
  button.addEventListener("click", () => showMoreInfo(host, item.entity));
  return button;
}

function wasteButton(host: HTMLElement, hass: HomeAssistantLike | undefined, entity: string): HTMLButtonElement {
  const presentation = getWastePresentation(hass?.states?.[entity], entity);
  const button = document.createElement("button");
  button.type = "button";
  button.className = `waste-card tone-${presentation.tone}`;
  button.dataset.entity = entity;
  button.setAttribute("aria-label", `${presentation.label}: ${presentation.date}, ${presentation.relative}. Open meer informatie.`);
  const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
  icon.icon = presentation.icon;
  const copy = document.createElement("span");
  copy.className = "waste-copy";
  const label = document.createElement("strong");
  label.className = "waste-label";
  label.textContent = presentation.label;
  const meta = document.createElement("span");
  meta.className = "waste-meta";
  const date = document.createElement("span");
  date.className = "waste-date";
  date.textContent = presentation.date;
  const relative = document.createElement("span");
  relative.className = "waste-relative";
  relative.textContent = presentation.relative;
  meta.append(date, relative);
  copy.append(label, meta);
  button.append(icon, copy);
  button.addEventListener("click", () => showMoreInfo(host, entity));
  return button;
}

export class HomeDashboardHomeOverview extends HTMLElementBase {
  private config?: HomeOverviewConfig;
  private currentHass?: HomeAssistantLike;
  private currentStructureSignature = "";
  private hasRendered = false;
  private childCards: LovelaceCardElement[] = [];
  private weatherForecast: ForecastLike[] = [];
  private weatherSubscriptionEntity = "";
  private weatherSubscriptionConnection?: HomeAssistantLike["connection"];
  private weatherUnsubscribe: Unsubscribe | undefined;

  public constructor() {
    super();
    this.attachShadow?.({ mode: "open" });
  }

  public setConfig(config: HomeOverviewConfig): void {
    if (this.config?.today?.weather_entity !== config.today?.weather_entity) this.stopWeatherSubscription();
    this.config = config;
    this.dataset.themeMode = config.theme_mode ?? "system";
    applyDashboardPalette(this, config.palette, config.theme_mode);
    this.currentStructureSignature = "";
    this.hasRendered = false;
    void this.render();
  }

  public set hass(value: HomeAssistantLike) {
    this.currentHass = value;
    this.ensureWeatherSubscription();
    const next = this.config ? getHomeStructureSignature(value, this.config) : "";
    if (!this.hasRendered || next !== this.currentStructureSignature) {
      void this.render();
      return;
    }
    this.updateLiveState();
    this.childCards.forEach((card) => { card.hass = value; });
  }

  public connectedCallback(): void {
    this.ensureWeatherSubscription();
    void this.render();
  }

  public disconnectedCallback(): void {
    this.stopWeatherSubscription();
  }

  public getCardSize(): number { return 12; }
  public getGridOptions(): Record<string, unknown> { return { columns: "full", rows: "auto", min_columns: 6 }; }

  private stopWeatherSubscription(): void {
    const unsubscribe = this.weatherUnsubscribe;
    this.weatherUnsubscribe = undefined;
    this.weatherForecast = [];
    this.weatherSubscriptionEntity = "";
    this.weatherSubscriptionConnection = undefined;
    if (unsubscribe) void Promise.resolve(unsubscribe());
  }

  private ensureWeatherSubscription(): void {
    const entity = this.config?.today?.weather_entity ?? "";
    const connection = this.currentHass?.connection;
    const subscribe = connection?.subscribeMessage;
    if (!entity) {
      if (this.weatherSubscriptionEntity || this.weatherUnsubscribe) this.stopWeatherSubscription();
      return;
    }
    if (this.weatherSubscriptionEntity === entity && this.weatherSubscriptionConnection === connection) return;
    if (this.weatherSubscriptionEntity || this.weatherUnsubscribe) this.stopWeatherSubscription();
    const legacy = this.currentHass?.states?.[entity]?.attributes?.forecast;
    if (Array.isArray(legacy) && this.weatherForecast.length === 0) this.weatherForecast = legacy as ForecastLike[];
    if (!connection || !subscribe) return;
    this.weatherSubscriptionEntity = entity;
    this.weatherSubscriptionConnection = connection;
    void connection.subscribeMessage!((event) => {
      if (this.weatherSubscriptionEntity !== entity || !Array.isArray(event.forecast)) return;
      this.weatherForecast = event.forecast;
      this.updateWeather();
    }, { type: "weather/subscribe_forecast", forecast_type: "daily", entity_id: entity }).then((unsubscribe) => {
      if (this.weatherSubscriptionEntity === entity && this.weatherSubscriptionConnection === connection) this.weatherUnsubscribe = unsubscribe;
      else void Promise.resolve(unsubscribe());
    }).catch(() => { this.weatherUnsubscribe = undefined; });
  }

  private updateWeather(): void {
    if (!this.shadowRoot || !this.config?.today?.weather_entity) return;
    const card = this.shadowRoot.querySelector<HTMLButtonElement>(".compact-weather");
    if (!card) return;
    card.replaceChildren(weatherContent(this.currentHass, this.config.today.weather_entity, this.weatherForecast, this.config.today.forecast_days));
  }

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
    this.shadowRoot.querySelectorAll<HTMLButtonElement>(".metric-card[data-entity]").forEach((button) => {
      const entity = button.dataset.entity;
      if (!entity) return;
      const state = hass?.states?.[entity];
      const label = button.dataset.label ?? friendlyName(state, entity);
      updateMetricPresentation(button, state, label);
    });
    this.shadowRoot.querySelectorAll<HTMLButtonElement>(".waste-card[data-entity]").forEach((button) => {
      const entity = button.dataset.entity;
      if (!entity) return;
      const presentation = getWastePresentation(hass?.states?.[entity], entity);
      const icon = button.querySelector<HTMLElement & { icon?: string }>("ha-icon");
      const label = button.querySelector<HTMLElement>(".waste-label");
      const date = button.querySelector<HTMLElement>(".waste-date");
      const relative = button.querySelector<HTMLElement>(".waste-relative");
      if (icon) icon.icon = presentation.icon;
      if (label) label.textContent = presentation.label;
      if (date) date.textContent = presentation.date;
      if (relative) relative.textContent = presentation.relative;
      button.className = `waste-card tone-${presentation.tone}`;
      button.setAttribute("aria-label", `${presentation.label}: ${presentation.date}, ${presentation.relative}. Open meer informatie.`);
    });
    const homeCount = (this.config.persons ?? []).filter((person) => hass?.states?.[person.entity]?.state === "home").length;
    const homePill = this.shadowRoot.querySelector<HTMLElement>("[data-live='home-count']");
    if (homePill) homePill.textContent = `${homeCount} thuis`;
    const weatherPill = this.shadowRoot.querySelector<HTMLElement>("[data-live='weather']");
    const weather = this.config.today?.weather_entity ? hass?.states?.[this.config.today.weather_entity] : undefined;
    if (weatherPill) weatherPill.textContent = weather ? `${weather.attributes?.temperature ?? "—"}° · ${formatState(weather)}` : "Weer niet ingesteld";
    this.updateWeather();
    const attentionPill = this.shadowRoot.querySelector<HTMLElement>("[data-live='attention']");
    const attentionCount = attentionItems(hass, this.config).length;
    if (attentionPill) attentionPill.textContent = `${attentionCount} aandachtspunt${attentionCount === 1 ? "" : "en"}`;
    const currentActivities = new Map(activeItems(hass, this.config).map((item) => [item.entity, item]));
    this.shadowRoot.querySelectorAll<HTMLButtonElement>(".activity-card[data-entity]").forEach((button) => {
      const item = currentActivities.get(button.dataset.entity ?? "");
      if (!item) return;
      const label = button.querySelector<HTMLElement>("strong");
      const detail = button.querySelector<HTMLElement>("small");
      if (label) label.textContent = item.label;
      if (detail) detail.textContent = item.detail;
      button.setAttribute("aria-label", `${item.label}: ${item.detail}. Open meer informatie.`);
    });
    this.shadowRoot.querySelectorAll<HTMLButtonElement>(".person[data-person-index]").forEach((button) => {
      const person = this.config?.persons?.[Number(button.dataset.personIndex)];
      if (!person) return;
      const state = hass?.states?.[person.entity];
      const name = button.querySelector<HTMLElement>(".person-copy strong");
      const context = button.querySelector<HTMLElement>(".person-copy small");
      const status = button.querySelector<HTMLElement>(".person-state");
      const presentation = personContext(hass, person);
      if (name) name.textContent = person.label || friendlyName(state, "Bewoner");
      if (context) context.textContent = presentation.context;
      if (status) status.textContent = presentation.location;
      button.setAttribute("aria-label", `${person.label || friendlyName(state, "Bewoner")}: ${presentation.location}${presentation.context ? `. ${presentation.context}` : ""}. Open meer informatie.`);
    });
  }

  private async render(): Promise<void> {
    if (!this.shadowRoot || !this.config) return;
    const expandedKeys = new Set(Array.from(this.shadowRoot.querySelectorAll<HomeDashboardRoomControls>("home-dashboard-room-controls")).filter(card => card.isExpanded).map(card => card.roomKey));
    this.childCards = [];
    const config = this.config;
    const hass = this.currentHass;
    const style = document.createElement("style");
    style.textContent = `
      .rooms-section{grid-template-columns:1fr auto;align-items:center}.rooms-section>.nav-card{background:transparent;box-shadow:none;border:0}.favorite-grid{grid-column:1/-1;display:grid;align-items:start;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}@media(max-width:700px){.favorite-grid{grid-template-columns:1fr}}
      :host{display:block;min-width:0;--hd-surface:var(--ha-card-background,var(--card-background-color,#fff));--hd-surface-raised:color-mix(in srgb,var(--hd-surface) 96%,var(--hd-brand));--hd-surface-muted:var(--secondary-background-color,#e5edf3);--hd-text:var(--primary-text-color,#17212b);--hd-muted:var(--secondary-text-color,#596978);--hd-border:var(--divider-color,#d3dee7);--hd-brand:var(--primary-color,#087fb9);--hd-brand-soft:color-mix(in srgb,var(--hd-brand) 13%,var(--hd-surface));--hd-hero:#087fb9;--hd-radius:16px;--hd-shadow:0 1px 2px rgb(20 35 28/.06),0 7px 24px rgb(20 35 28/.035);color:var(--hd-text)}:host([data-theme-mode="light"]){--primary-background-color:#edf3f7;--secondary-background-color:#e5edf3;--card-background-color:#fff;--ha-card-background:#fff;--primary-text-color:#17212b;--secondary-text-color:#596978;--divider-color:#d3dee7;--primary-color:#087fb9;--hd-surface:#fff;--hd-surface-raised:#f7fafc;--hd-surface-muted:#e5edf3;--hd-text:#17212b;--hd-muted:#596978;--hd-border:#d3dee7;--hd-brand:#087fb9;--hd-brand-soft:#dceff8;--hd-hero:#087fb9}:host([data-theme-mode="dark"]){--primary-background-color:#101820;--secondary-background-color:#243743;--card-background-color:#17232d;--ha-card-background:#17232d;--primary-text-color:#eef6fb;--secondary-text-color:#a8bac7;--divider-color:#344b5a;--primary-color:#63c7ef;--hd-surface:#17232d;--hd-surface-raised:#1d2c37;--hd-surface-muted:#243743;--hd-text:#eef6fb;--hd-muted:#a8bac7;--hd-border:#344b5a;--hd-brand:#63c7ef;--hd-brand-soft:#123d50;--hd-hero:#086f9f;--hd-shadow:0 1px 2px rgb(0 0 0/.16),0 8px 28px rgb(0 0 0/.13)}*{box-sizing:border-box}.home{display:grid;gap:22px;width:100%;margin:0 auto}.top{display:flex;justify-content:space-between;align-items:end;gap:16px;padding:18px 20px;border-radius:20px;background:var(--hd-hero);color:#fff;box-shadow:var(--hd-shadow)}.date{font-size:.7rem;font-weight:750;letter-spacing:.09em;text-transform:uppercase;color:inherit;opacity:.78}h1{margin:3px 0 0;font-size:2rem;letter-spacing:-.035em}.pills{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.pill{padding:6px 10px;border:1px solid rgb(255 255 255/.38);border-radius:999px;background:rgb(255 255 255/.14);color:#fff;font-size:.76rem;font-weight:650}.pill.attention{border-color:#ffd278;background:#ffe4aa;color:#573500}
      .attention-banner{display:grid;grid-template-columns:42px minmax(0,1fr);align-items:start;gap:12px;padding:14px 16px;border:1px solid color-mix(in srgb,var(--warning-color,#f0a000) 40%,var(--hd-border));border-radius:18px;background:color-mix(in srgb,var(--warning-color,#f0a000) 14%,var(--hd-surface))}.attention-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--hd-surface);color:var(--warning-color,#f0a000)}.attention-body{display:grid;gap:8px;min-width:0}.attention-copy{display:grid}.attention-copy span{font-size:.76rem;color:var(--hd-muted)}.attention-list{display:flex;flex-wrap:wrap;gap:6px}.attention-item{display:flex;align-items:center;gap:6px;min-height:44px;padding:7px 10px;border:1px solid var(--hd-border);border-radius:12px;background:var(--hd-surface);color:var(--hd-text);cursor:pointer;text-align:left}.attention-item:hover,.attention-item:focus-visible{border-color:var(--hd-brand)}.attention-item ha-icon{width:18px;height:18px}.attention-item span{display:grid;min-width:0}.attention-item strong,.attention-item small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.attention-item strong{font-size:.78rem}.attention-item small{font-size:.68rem;color:var(--hd-muted)}.attention-item.priority-critical ha-icon{color:var(--error-color,#d64c4c)}.attention-item.priority-warning ha-icon{color:var(--warning-color,#d88a00)}.attention-item.priority-offline ha-icon{color:var(--hd-muted)}.attention-extra{align-self:center;font-size:.72rem;color:var(--hd-muted)}
      section{display:grid;gap:9px}.section-header span{display:grid}.section-header strong{font-size:1rem;letter-spacing:-.01em}.section-header small{color:var(--hd-muted);font-size:.75rem}.today-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:stretch}.today-grid.with-security{grid-template-columns:minmax(250px,.84fr) minmax(300px,1.12fr) minmax(270px,.94fr)}.today-main{grid-column:1/3;display:grid;height:100%;overflow:hidden;border:1px solid var(--hd-border);border-radius:var(--hd-radius);background:var(--hd-surface);box-shadow:var(--hd-shadow)}.today-side,.security-panel{display:grid;align-content:start}.security-panel{grid-column:3;grid-row:1;height:100%}.security-panel>.security,.security-panel .camera{height:100%}.compact-weather{display:grid;gap:10px;min-width:0;min-height:164px;padding:14px;border:0;border-radius:0;background:transparent;box-shadow:none;color:var(--hd-text);cursor:pointer;text-align:left}.compact-weather:hover,.compact-weather:focus-visible{background:var(--hd-surface-raised)}.weather-now{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:10px}.weather-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:var(--hd-brand-soft);color:var(--hd-brand)}.weather-icon ha-icon{width:25px;height:25px}.weather-copy{display:grid}.weather-copy strong{font-size:1rem}.weather-copy small{font-size:.72rem;color:var(--hd-muted)}.weather-temperature{font-size:1.65rem;letter-spacing:-.04em;font-variant-numeric:tabular-nums}.forecast-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding-top:9px;border-top:1px solid var(--hd-border)}.forecast-day{display:grid;grid-template-columns:1fr auto;align-items:center;gap:3px}.forecast-day small{font-size:.68rem;color:var(--hd-muted)}.forecast-day ha-icon{grid-row:span 2;width:19px;height:19px;color:var(--hd-brand)}.forecast-day strong{font-size:.7rem;font-variant-numeric:tabular-nums}.forecast-missing{grid-column:1/-1;display:grid;place-items:center;min-height:43px;color:var(--hd-muted);font-size:.72rem}.kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;overflow:hidden;border:0;border-top:1px solid var(--hd-border);border-radius:0;background:var(--hd-border);box-shadow:none}.metric-card{display:grid;grid-template-columns:29px minmax(0,1fr);align-items:center;gap:7px;min-height:64px;padding:8px 10px;border:0;background:var(--hd-surface);color:var(--hd-text);cursor:pointer;text-align:left}.metric-card:hover,.metric-card:focus-visible{background:var(--hd-brand-soft)}.metric-card ha-icon{width:24px;height:24px;color:var(--hd-brand)}.metric-copy{display:grid;gap:1px;min-width:0}.metric-value,.metric-meta,.metric-status{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.metric-value{font-size:.9rem;font-variant-numeric:tabular-nums}.metric-meta{font-size:.63rem;color:var(--hd-muted)}.metric-status{font-size:.61rem;font-weight:700;color:var(--warning-color,#d88a00)}.metric-card.is-unavailable{background:var(--hd-surface-muted)}.metric-card.is-unavailable ha-icon{color:var(--hd-muted)}.metric-card.is-unavailable .metric-status{color:var(--hd-muted)}.state-card{display:grid;text-align:left;gap:3px;padding:11px;border:1px solid var(--hd-border);border-radius:var(--hd-radius);background:var(--hd-surface);box-shadow:var(--hd-shadow);color:var(--hd-text);cursor:pointer}.state-card:hover{border-color:var(--hd-brand)}.state-copy{display:grid;gap:3px;min-width:0}.state-copy strong,.state-copy span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.state-copy span{font-size:.76rem;color:var(--hd-muted)}.today-main>.empty{border:0;border-radius:0}.waste-group{display:grid;gap:8px;padding:12px 14px 14px;border-top:1px solid var(--hd-border)}.waste-heading{display:grid}.waste-heading strong{font-size:.92rem}.waste-heading small{color:var(--hd-muted);font-size:.72rem}.waste{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:1px;overflow:hidden;border:1px solid var(--hd-border);border-radius:12px;background:var(--hd-border)}.waste-card{display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:8px;min-height:62px;padding:9px 10px;border:0;border-radius:0;background:var(--hd-surface);box-shadow:none;color:var(--hd-text);cursor:pointer;text-align:left}.waste-card:hover,.waste-card:focus-visible{background:var(--hd-brand-soft)}.waste-card ha-icon{width:22px;height:22px;padding:6px;border-radius:11px;background:var(--hd-brand-soft)}.waste-card.tone-green ha-icon{color:var(--success-color,#3a8f57)}.waste-card.tone-blue ha-icon{color:var(--info-color,#287db8)}.waste-card.tone-yellow ha-icon{color:var(--warning-color,#d88a00)}.waste-card.tone-neutral ha-icon{color:var(--hd-muted)}.waste-copy{display:grid;gap:2px;min-width:0}.waste-label{font-size:.8rem}.waste-meta{display:flex;gap:5px;flex-wrap:wrap;font-size:.69rem;color:var(--hd-muted)}.waste-relative{font-weight:700;color:var(--hd-brand)}
      .people{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.person{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:10px;min-height:62px;padding:9px 11px;border:1px solid var(--hd-border);border-radius:var(--hd-radius);background:var(--hd-surface);box-shadow:var(--hd-shadow);color:var(--hd-text);cursor:pointer;text-align:left}.person:hover,.person:focus-visible{border-color:var(--hd-brand)}.avatar{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;overflow:hidden;background:var(--hd-brand);color:#fff;font-weight:700}.avatar img{width:100%;height:100%;object-fit:cover}.person-copy{display:grid}.person-copy strong{font-size:.85rem}.person-copy small{color:var(--hd-muted);font-size:.72rem}.person-state{padding:5px 9px;border-radius:999px;background:var(--hd-brand-soft);color:var(--hd-brand);font-size:.72rem;font-weight:700}
      .activity-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.activity-card{display:flex;align-items:center;gap:10px;padding:12px;min-height:58px;border:1px solid var(--hd-border);border-radius:16px;background:var(--hd-surface);color:var(--hd-text);text-align:left;cursor:pointer}.activity-card span{display:grid}.activity-card small{color:var(--hd-muted)}.activity-card ha-icon{width:22px;height:22px;flex-shrink:0;color:var(--hd-brand)}.activity-card:focus-visible{outline:2px solid var(--hd-brand)}.nav-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.nav-card{display:flex;align-items:center;gap:9px;min-height:50px;padding:10px 12px;border:1px solid var(--hd-border);border-radius:var(--hd-radius);background:var(--hd-surface);box-shadow:var(--hd-shadow);color:var(--hd-text);text-decoration:none;font-size:.86rem;font-weight:650}.nav-card:hover,.nav-card:focus-visible{border-color:var(--hd-brand);background:var(--hd-surface-raised)}.nav-card ha-icon{width:22px;height:22px;color:var(--hd-brand)}.security{display:grid;gap:8px;align-items:start}.security.has-camera{grid-template-rows:minmax(0,1fr) auto;align-content:stretch;align-items:stretch}.security-panel>.security{display:flex;flex-direction:column;align-items:stretch}.security-panel .camera{flex:1;height:auto}.empty{padding:16px;border:1px dashed var(--hd-border);border-radius:var(--hd-radius);color:var(--hd-muted)}
      .security-panel{display:flex;align-items:stretch}.security-panel>.security{flex:1;height:auto}
      @media(max-width:1050px){.today-grid.with-security{grid-template-columns:repeat(2,minmax(0,1fr))}.today-main,.security-panel{grid-column:1/-1}.security-panel{grid-row:auto}}
      @media(max-width:800px){.home{gap:20px}.top{align-items:flex-start;flex-direction:column;padding:16px}.pills{justify-content:flex-start}.today-grid,.today-grid.with-security{grid-template-columns:1fr}.today-main,.security-panel{grid-column:auto}.security-panel{grid-row:auto}.nav-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:560px){h1{font-size:1.65rem}.people{grid-template-columns:1fr}.waste{grid-template-columns:repeat(2,minmax(0,1fr))}.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.attention-banner{grid-template-columns:38px minmax(0,1fr)}.attention-list{display:grid;grid-template-columns:1fr}.attention-item{width:100%}.activity-list{grid-template-columns:1fr}.person{grid-template-columns:42px minmax(0,1fr) auto}.person-state{max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
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
    const currentAttentionItems = attentionItems(hass, config);
    const weather = config.today?.weather_entity ? hass?.states?.[config.today.weather_entity] : undefined;
    const weatherTemperature = weather?.attributes?.temperature;
    for (const [text, attention, live] of [[`${homeCount} thuis`, false, "home-count"], [weather ? `${weatherTemperature ?? "—"}° · ${formatState(weather)}` : "Weer niet ingesteld", false, "weather"], [`${currentAttentionItems.length} aandachtspunt${currentAttentionItems.length === 1 ? "" : "en"}`, currentAttentionItems.length > 0, "attention"]] as const) {
      const pill = document.createElement("span");
      pill.className = `pill${attention ? " attention" : ""}`;
      pill.dataset.live = live;
      pill.textContent = text;
      pills.append(pill);
    }
    top.append(intro, pills);
    root.append(top);

    if (currentAttentionItems.length > 0) {
      const banner = document.createElement("div");
      banner.className = "attention-banner";
      banner.setAttribute("role", "region");
      banner.setAttribute("aria-label", `${currentAttentionItems.length} aandachtspunt${currentAttentionItems.length === 1 ? "" : "en"}`);
      const attentionIcon = document.createElement("span");
      attentionIcon.className = "attention-icon";
      const haIcon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
      haIcon.icon = "mdi:alert-outline";
      attentionIcon.append(haIcon);
      const body = document.createElement("span");
      body.className = "attention-body";
      const copy = document.createElement("span");
      copy.className = "attention-copy";
      const label = document.createElement("span");
      label.textContent = "Aandacht nodig";
      const title = document.createElement("strong");
      title.textContent = `${currentAttentionItems.length} ${currentAttentionItems.length === 1 ? "punt vraagt" : "punten vragen"} controle`;
      copy.append(label, title);
      const list = document.createElement("span");
      list.className = "attention-list";
      currentAttentionItems.slice(0, 3).forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `attention-item priority-${item.priority}`;
        button.setAttribute("aria-label", `${item.label}: ${formatState(hass?.states?.[item.entity])}. Open meer informatie.`);
        const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
        icon.icon = item.priority === "critical" ? "mdi:alert-octagon-outline" : item.priority === "warning" ? "mdi:alert-outline" : "mdi:cloud-alert-outline";
        const itemCopy = document.createElement("span");
        const itemLabel = document.createElement("strong");
        itemLabel.textContent = item.label;
        const itemState = document.createElement("small");
        itemState.textContent = formatState(hass?.states?.[item.entity]);
        itemCopy.append(itemLabel, itemState);
        button.append(icon, itemCopy);
        button.addEventListener("click", () => showMoreInfo(this, item.entity));
        list.append(button);
      });
      if (currentAttentionItems.length > 3) {
        const extra = document.createElement("span");
        extra.className = "attention-extra";
        extra.textContent = `+${currentAttentionItems.length - 3} extra`;
        list.append(extra);
      }
      body.append(copy, list);
      banner.append(attentionIcon, body);
      root.append(banner);
    }

    const buildSecurityPanel = (): HTMLElement | undefined => {
      if (!config.security?.enabled) return undefined;
      const panel = document.createElement("aside");
      panel.className = "security-panel";
      const layout = document.createElement("div");
      layout.className = "security";
      if (config.security.cameras.some((camera) => camera.camera_entity)) {
        layout.classList.add("has-camera");
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
      const main = document.createElement("div");
      main.className = "today-main";
      if (config.show_weather !== false && config.today.weather_entity) {
        const weatherCard = document.createElement("button");
        weatherCard.type = "button";
        weatherCard.className = "compact-weather weather-slot";
        weatherCard.setAttribute("aria-label", "Open weersinformatie");
        weatherCard.append(weatherContent(hass, config.today.weather_entity, this.weatherForecast, config.today.forecast_days));
        weatherCard.addEventListener("click", () => showMoreInfo(this, config.today!.weather_entity));
        main.append(weatherCard);
      } else {
        const empty = document.createElement("div");
        empty.className = "empty weather-slot";
        empty.textContent = "Selecteer een weerbron onder Vandaag.";
        main.append(empty);
      }
      const side = document.createElement("div");
      side.className = "today-side";
      const namedKpis: Array<readonly [string, string, string]> = [
        [config.today.battery_soc_entity, "Thuisbatterij SoC", "mdi:home-battery-outline"],
        [config.today.battery_charge_power_entity, "Batterij laden", "mdi:battery-arrow-up-outline"],
        [config.today.battery_discharge_power_entity, "Batterij ontladen", "mdi:battery-arrow-down-outline"],
        [config.today.solar_power_entity, "Zonnepanelen opbrengst", "mdi:solar-power"],
        [config.today.home_consumption_entity, "Huisverbruik zonder batterijladen", "mdi:home-lightning-bolt-outline"],
        [config.today.monthly_capacity_peak_entity, "Maandelijkse vermogenspiek", "mdi:gauge"]
      ];
      const configuredKpis = namedKpis.filter((candidate): candidate is readonly [string, string, string] => Boolean(candidate[0]));
      const extraKpis = unique(config.today.energy_context_entities)
        .filter((entity) => !configuredKpis.some(([configured]) => configured === entity))
        .map((entity) => [entity, friendlyName(hass?.states?.[entity], "Energie"), "mdi:flash-outline"] as const);
      const fallbackKpis = [config.energy?.solar_entities[0], config.energy?.electricity_entities[0], config.energy?.battery_entities[0], config.energy?.ev_power_entity]
        .filter((entity): entity is string => Boolean(entity))
        .map((entity) => [entity, friendlyName(hass?.states?.[entity], "Energie"), "mdi:flash-outline"] as const);
      const kpiEntities = [...configuredKpis, ...extraKpis];
      const visibleKpis = (kpiEntities.length > 0 ? kpiEntities : fallbackKpis).slice(0, 6);
      if (visibleKpis.length > 0) {
        const kpis = document.createElement("div");
        kpis.className = "kpis";
        visibleKpis.forEach(([entity, label, icon]) => kpis.append(metricButton(this, hass, entity, label, icon)));
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
      main.append(side);
      grid.append(main);
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
        const presentation = personContext(hass, person);
        context.textContent = presentation.context;
        copy.append(name, context);
        const status = document.createElement("span");
        status.className = "person-state";
        status.textContent = presentation.location;
        button.setAttribute("aria-label", `${person.label || friendlyName(state, "Bewoner")}: ${presentation.location}${presentation.context ? `. ${presentation.context}` : ""}. Open meer informatie.`);
        button.append(avatar, copy, status);
        button.addEventListener("click", () => showMoreInfo(this, person.entity));
        people.append(button);
      }
      family.append(people);
      root.append(family);
    }

    const favorites = favoriteRooms(config.rooms ?? []);
    const currentActivities = remainingActivities(hass, config);
    if (currentActivities.length) {
      const active = document.createElement("section");
      active.append(sectionHeader("Nu actief", "Overige woningactiviteit"));
      const list = document.createElement("div"); list.className = "activity-list";
      currentActivities.forEach(item => list.append(activityButton(this, hass, item)));
      active.append(list); root.append(active);
    }
    const roomsSection = document.createElement("section");
    roomsSection.className = "rooms-section";
    roomsSection.append(sectionHeader("Kamers & bediening", "Je vaste kamers, direct bij de hand"));
    roomsSection.append(navigationLink("Alle kamers", "mdi:arrow-right", "rooms"));
    const roomGrid = document.createElement("div"); roomGrid.className = "favorite-grid";
    favorites.forEach(room => {
      const card = document.createElement("home-dashboard-room-controls") as HomeDashboardRoomControls;
      card.setConfig({ room, show_controls: config.show_quick_actions !== false, expanded: expandedKeys.has(room.key) });
      if (hass) card.hass = hass;
      roomGrid.append(card); this.childCards.push(card as unknown as LovelaceCardElement);
    });
    if (!favorites.length) {
      const hint = document.createElement("small"); hint.textContent = "Kies je favoriete kamers via Dashboard bewerken → Kamers.";
      roomGrid.append(hint);
    }
    roomsSection.append(roomGrid); root.append(roomsSection);

    const navigation = document.createElement("section");
    navigation.append(sectionHeader("Snel naar", "Volledige specialistische dashboards"));
    const navGrid = document.createElement("div");
    navGrid.className = "nav-grid";
    const specialistNames: Record<keyof SpecialistsConfig, [string, string, string]> = {
      kia: ["Auto", "mdi:car-electric", "specialist-kia"], robot: ["Robot", "mdi:robot-vacuum", "more"], garden: ["Tuin", "mdi:flower", "more"], pool: ["Zwembad", "mdi:pool", "more"]
    };
    (Object.entries(config.specialists ?? {}) as Array<[keyof SpecialistsConfig, SpecialistsConfig[keyof SpecialistsConfig]]>)
      .filter(([, specialist]) => specialist.enabled)
      .forEach(([key]) => navGrid.append(navigationLink(specialistNames[key][0], specialistNames[key][1], specialistNames[key][2])));
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
    this.ensureWeatherSubscription();
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
