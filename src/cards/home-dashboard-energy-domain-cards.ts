import type {
  DiagnosticsConfig,
  EnergyConfig,
  RoomConfig,
  SecurityConfig,
  SpecialistsConfig
} from "../config/types";
import { roomPath } from "./home-dashboard-room-cards";

export type LovelaceCardConfig = Record<string, unknown>;

interface HassState {
  state: string;
  attributes?: Record<string, unknown>;
}

interface HassLike {
  states?: Record<string, HassState | undefined>;
  formatEntityState?: (state: HassState) => string;
}

interface EnergyOverviewConfig {
  type: "custom:home-dashboard-energy-overview";
  energy: EnergyConfig;
  theme_mode?: "system" | "light" | "dark";
}

interface MetricSpec {
  entity: string;
  label: string;
  icon: string;
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function noAction(): LovelaceCardConfig {
  return { action: "none" };
}

function readonlyTile(entity: string, name?: string): LovelaceCardConfig {
  return {
    type: "tile",
    entity,
    ...(name ? { name } : {}),
    tap_action: noAction(),
    hold_action: noAction(),
    double_tap_action: noAction(),
    icon_tap_action: noAction(),
    icon_hold_action: noAction(),
    icon_double_tap_action: noAction()
  };
}

function navigationButton(name: string, icon: string, path: string): LovelaceCardConfig {
  return {
    type: "button",
    name,
    icon,
    show_state: false,
    tap_action: { action: "navigate", navigation_path: path },
    hold_action: noAction(),
    double_tap_action: noAction()
  };
}

function heading(text: string, icon: string, path?: string): LovelaceCardConfig {
  return {
    type: "heading",
    heading: text,
    icon,
    ...(path ? { tap_action: { action: "navigate", navigation_path: path } } : {}),
    grid_options: { columns: "full", rows: "auto" }
  };
}

function fullSection(title: string, icon: string, cards: LovelaceCardConfig[], maxColumns: number, path?: string): LovelaceCardConfig | undefined {
  if (cards.length === 0) return undefined;
  return {
    type: "grid",
    column_span: maxColumns,
    cards: [heading(title, icon, path), ...cards]
  };
}

function metricSpecs(energy: EnergyConfig): MetricSpec[] {
  const used = new Set<string>();
  const result: MetricSpec[] = [];
  const add = (entity: string, label: string, icon: string): void => {
    if (!entity || used.has(entity)) return;
    used.add(entity);
    result.push({ entity, label, icon });
  };
  energy.electricity_entities.slice(0, 3).forEach((entity, index) => add(entity, index === 0 ? "Elektriciteit" : `Elektriciteit ${index + 1}`, "mdi:transmission-tower"));
  energy.solar_entities.slice(0, 2).forEach((entity, index) => add(entity, index === 0 ? "Zon" : `Zon ${index + 1}`, "mdi:solar-power"));
  energy.battery_entities.slice(0, 3).forEach((entity, index) => add(entity, index === 0 ? "Batterij" : `Batterij ${index + 1}`, "mdi:home-battery-outline"));
  add(energy.ev_power_entity, "Auto laden", "mdi:ev-station");
  add(energy.capacity_peak_entity, "Maandpiek", "mdi:gauge");
  add(energy.ups_entity, "Noodstroom", "mdi:battery-heart-variant");
  energy.phase_entities.slice(0, 3).forEach((entity, index) => add(entity, `Fase ${index + 1}`, "mdi:sine-wave"));
  return result;
}

function stateValue(hass: HassLike | undefined, entity: string): string {
  const state = hass?.states?.[entity];
  if (!state || state.state === "unknown" || state.state === "unavailable") return "Niet beschikbaar";
  if (typeof hass?.formatEntityState === "function") {
    try {
      return hass.formatEntityState(state);
    } catch {
      // Een frontendformatter mag de read-only fallback nooit blokkeren.
    }
  }
  const unit = typeof state.attributes?.unit_of_measurement === "string" ? state.attributes.unit_of_measurement : "";
  return `${state.state}${unit ? ` ${unit}` : ""}`;
}

function stateLabel(hass: HassLike | undefined, spec: MetricSpec): string {
  const state = hass?.states?.[spec.entity];
  const friendly = state?.attributes?.friendly_name;
  return typeof friendly === "string" && friendly.trim() ? friendly : spec.label;
}

export class HomeDashboardEnergyOverview extends HTMLElementBase {
  private config?: EnergyOverviewConfig;
  private hassValue?: HassLike;

  public setConfig(config: EnergyOverviewConfig): void {
    if (!config?.energy) throw new Error("Energy-configuratie ontbreekt");
    this.config = config;
    this.render();
  }

  public set hass(hass: HassLike) {
    this.hassValue = hass;
    if (!this.shadowRoot) this.render();
    else this.updateValues();
  }

  public getCardSize(): number {
    return 3;
  }

  public getGridOptions(): Record<string, unknown> {
    return { columns: "full", rows: "auto", min_rows: 2 };
  }

  public connectedCallback(): void {
    if (!this.shadowRoot) this.render();
  }

  private render(): void {
    if (!this.config) return;
    const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    const specs = metricSpecs(this.config.energy);
    const themeClass = this.config.theme_mode === "light" ? "theme-light" : this.config.theme_mode === "dark" ? "theme-dark" : "theme-system";
    const metrics = specs.length > 0
      ? specs.map((spec) => `<article class="metric" data-entity="${escapeHtml(spec.entity)}"><ha-icon icon="${escapeHtml(spec.icon)}"></ha-icon><div><span class="label">${escapeHtml(spec.label)}</span><strong class="value">Niet beschikbaar</strong></div></article>`).join("")
      : `<p class="empty">Koppel bronnen via <strong>Dashboard bewerken → Energie</strong>. Het standaard Energy-dashboard blijft hieronder bereikbaar.</p>`;
    root.innerHTML = `<style>
      :host{display:block;--hd-energy-surface:var(--ha-card-background,var(--card-background-color,#fff));--hd-energy-muted:var(--secondary-text-color,#66736d);--hd-energy-border:var(--divider-color,#d8e1dc);--hd-energy-brand:var(--primary-color,#276b5b);--hd-energy-soft:color-mix(in srgb,var(--hd-energy-brand) 12%,var(--hd-energy-surface))}
      :host(.theme-light){--hd-energy-surface:#fff;--hd-energy-muted:#66736d;--hd-energy-border:#d8e1dc;--hd-energy-brand:#276b5b;--primary-text-color:#18231f}
      :host(.theme-dark){--hd-energy-surface:#18211d;--hd-energy-muted:#a8b7af;--hd-energy-border:#34433c;--hd-energy-brand:#72c9af;--primary-text-color:#edf4f0}
      ha-card{overflow:hidden;border:1px solid var(--hd-energy-border);border-radius:22px;background:var(--hd-energy-surface);box-shadow:0 1px 2px rgb(20 35 28 / .06)}
      .hero{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;border-bottom:1px solid var(--hd-energy-border)}
      .eyebrow{margin:0 0 4px;color:var(--hd-energy-brand);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.hero h2{margin:0;color:var(--primary-text-color);font-size:24px;line-height:30px}.hero p{margin:4px 0 0;color:var(--hd-energy-muted);font-size:13px;line-height:18px}.hero ha-icon{width:40px;height:40px;color:var(--hd-energy-brand)}
      .metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}.metric{min-width:0;display:flex;align-items:center;gap:12px;padding:16px 18px;border-right:1px solid var(--hd-energy-border);border-bottom:1px solid var(--hd-energy-border)}.metric ha-icon{flex:none;color:var(--hd-energy-brand);background:var(--hd-energy-soft);padding:9px;border-radius:12px}.metric div{min-width:0}.label{display:block;overflow:hidden;color:var(--hd-energy-muted);font-size:12px;font-weight:600;line-height:16px;text-overflow:ellipsis;white-space:nowrap}.value{display:block;overflow:hidden;margin-top:2px;color:var(--primary-text-color);font-size:18px;font-variant-numeric:tabular-nums;line-height:22px;text-overflow:ellipsis;white-space:nowrap}.metric.is-unavailable .value{color:var(--hd-energy-muted);font-size:14px}.empty{margin:0;padding:20px;color:var(--hd-energy-muted);font-size:14px;line-height:20px}
      @media(max-width:620px){.hero{padding:16px}.hero h2{font-size:21px}.hero ha-icon{width:32px;height:32px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.metric{min-height:44px;padding:14px}.value{font-size:16px}}
    </style><ha-card class="${themeClass}"><div class="hero"><div><p class="eyebrow">Nu</p><h2>Actuele energiestatus</h2><p>Alleen expliciet gemapte bronnen; ontbrekende waarden blijven zichtbaar als niet beschikbaar.</p></div><ha-icon icon="mdi:lightning-bolt-circle"></ha-icon></div><div class="metrics">${metrics}</div></ha-card>`;
    this.classList.remove("theme-light", "theme-dark", "theme-system");
    this.classList.add(themeClass);
    this.updateValues();
  }

  private updateValues(): void {
    if (!this.shadowRoot || !this.config) return;
    const specs = new Map(metricSpecs(this.config.energy).map((spec) => [spec.entity, spec]));
    for (const element of this.shadowRoot.querySelectorAll<HTMLElement>("[data-entity]")) {
      const entity = element.dataset.entity ?? "";
      const spec = specs.get(entity);
      if (!spec) continue;
      const value = stateValue(this.hassValue, entity);
      const label = stateLabel(this.hassValue, spec);
      const labelElement = element.querySelector<HTMLElement>(".label");
      const valueElement = element.querySelector<HTMLElement>(".value");
      if (labelElement) labelElement.textContent = label;
      if (valueElement) valueElement.textContent = value;
      element.classList.toggle("is-unavailable", value === "Niet beschikbaar");
      element.setAttribute("aria-label", `${label}: ${value}`);
    }
  }
}

function mappedSourceSections(energy: EnergyConfig, maxColumns: number): LovelaceCardConfig[] {
  const groups: Array<[string, string, string[]]> = [
    ["Elektriciteit", "mdi:transmission-tower", energy.electricity_entities],
    ["Zon", "mdi:solar-power", energy.solar_entities],
    ["Batterij", "mdi:home-battery-outline", energy.battery_entities],
    ["Gas", "mdi:fire", energy.gas_entities],
    ["Water", "mdi:water", energy.water_entities],
    ["Apparaten", "mdi:power-plug", energy.device_entities],
    ["Lokale context", "mdi:chart-box-outline", unique([energy.capacity_peak_entity, energy.ev_power_entity, energy.ups_entity, ...energy.phase_entities])]
  ];
  return groups
    .map(([title, icon, entities]) => fullSection(title, icon, unique(entities).map((entity) => readonlyTile(entity)), maxColumns))
    .filter((candidate): candidate is LovelaceCardConfig => Boolean(candidate));
}

function officialEnergyCards(energy: EnergyConfig): LovelaceCardConfig[] {
  if (!energy.show_standard_dashboard_link) return [];
  const cards: LovelaceCardConfig[] = [
    { type: "energy-date-selection", grid_options: { columns: "full", rows: "auto" } },
    { type: "energy-distribution", link_dashboard: false },
    { type: "energy-usage-graph" },
    { type: "energy-sources-table" }
  ];
  if (energy.solar_entities.length > 0) {
    cards.push(
      { type: "energy-solar-graph" },
      { type: "energy-grid-neutrality-gauge" },
      { type: "energy-solar-consumed-gauge" },
      { type: "energy-self-sufficiency-gauge" },
      { type: "energy-carbon-consumed-gauge" }
    );
  }
  if (energy.device_entities.length > 0) cards.push({ type: "energy-devices-graph" });
  if (energy.gas_entities.length > 0) cards.push({ type: "energy-gas-graph" });
  if (energy.water_entities.length > 0) cards.push({ type: "energy-water-graph" });
  return cards;
}

export function buildEnergySections(energy: EnergyConfig | undefined, maxColumns: number, themeMode: "system" | "light" | "dark" = "system"): LovelaceCardConfig[] {
  if (!energy?.enabled) {
    return [{ type: "grid", cards: [{ type: "markdown", title: "Energie", content: "Activeer Energie via **Dashboard bewerken → Energie**." }] }];
  }
  const sections: LovelaceCardConfig[] = [{
    type: "grid",
    column_span: maxColumns,
    cards: [{ type: "custom:home-dashboard-energy-overview", energy, theme_mode: themeMode, grid_options: { columns: "full", rows: "auto" } }]
  }];
  const liveEntities = unique([
    ...energy.electricity_entities,
    ...energy.solar_entities,
    ...energy.battery_entities,
    energy.capacity_peak_entity,
    energy.ev_power_entity,
    energy.ups_entity,
    ...energy.phase_entities
  ]);
  if (liveEntities.length > 0) {
    sections.push(fullSection("Actueel verloop", "mdi:chart-line", [{
      type: "history-graph",
      entities: liveEntities,
      hours_to_show: 48,
      grid_options: { columns: "full", rows: 5 }
    }], maxColumns) as LovelaceCardConfig);
  }
  const official = officialEnergyCards(energy);
  if (official.length > 0) sections.push(fullSection("Standaard Energy-inzicht", "mdi:chart-sankey-variant", official, maxColumns) as LovelaceCardConfig);
  sections.push(...mappedSourceSections(energy, maxColumns));
  if (energy.show_standard_dashboard_link) {
    sections.push(fullSection("Configuratie en volledige fallback", "mdi:open-in-new", [{
      type: "button",
      name: "Open standaard Energie-dashboard",
      icon: "mdi:lightning-bolt",
      tap_action: { action: "navigate", navigation_path: "/energy" },
      hold_action: noAction(),
      double_tap_action: noAction()
    }], maxColumns) as LovelaceCardConfig);
  }
  return sections;
}

function roomsFor(rooms: readonly RoomConfig[], predicate: (room: RoomConfig) => boolean): RoomConfig[] {
  return rooms.filter(predicate);
}

function roomRouteCards(rooms: readonly RoomConfig[], fallbackIcon: string): LovelaceCardConfig[] {
  if (rooms.length === 0) return [];
  return rooms.map((room) => navigationButton(room.name, room.icon || fallbackIcon, roomPath(room)));
}

export interface DomainSources {
  rooms?: readonly RoomConfig[] | undefined;
  energy?: EnergyConfig | undefined;
  security?: SecurityConfig | undefined;
  specialists?: SpecialistsConfig | undefined;
  diagnostics?: DiagnosticsConfig | undefined;
}

export function buildDomainSections(sources: DomainSources, maxColumns: number): LovelaceCardConfig[] {
  const rooms = sources.rooms ?? [];
  const lights = roomsFor(rooms, (room) => room.light_entities.length > 0 || room.capabilities.includes("lights"));
  const climate = roomsFor(rooms, (room) => Boolean(room.hvac.entity) || room.hvac.comfort_entities.length > 0 || room.capabilities.includes("climate") || room.capabilities.includes("air_quality"));
  const securityRooms = roomsFor(rooms, (room) => room.safety_entities.length > 0 || room.camera_entities.length > 0 || room.cover_entities.length > 0 || room.capabilities.includes("security"));
  const media = roomsFor(rooms, (room) => room.media_entities.length > 0 || room.capabilities.includes("media"));
  const power = roomsFor(rooms, (room) => room.power_entities.length > 0 || room.capabilities.includes("power"));
  const sections: Array<LovelaceCardConfig | undefined> = [
    fullSection("Klimaat & lucht", "mdi:thermostat", roomRouteCards(climate, "mdi:thermostat"), maxColumns, "rooms"),
    fullSection("Verlichting", "mdi:lightbulb-group-outline", roomRouteCards(lights, "mdi:lightbulb-outline"), maxColumns, "rooms"),
    fullSection("Veiligheid & openingen", "mdi:shield-home-outline", [
      ...(sources.security?.enabled && sources.security.alarm_entity ? [readonlyTile(sources.security.alarm_entity, "Alarmstatus")] : []),
      ...roomRouteCards(securityRooms, "mdi:shield-home-outline")
    ], maxColumns, "home"),
    fullSection("Water", "mdi:water-outline", unique(sources.energy?.water_entities ?? []).map((entity) => readonlyTile(entity)), maxColumns, "energy"),
    fullSection("Media", "mdi:play-box-multiple-outline", roomRouteCards(media, "mdi:speaker"), maxColumns, "rooms"),
    fullSection("Energie & apparaten", "mdi:power-plug-outline", [
      ...roomRouteCards(power, "mdi:power-plug-outline"),
      ...(sources.energy?.enabled ? [navigationButton("Volledig energieoverzicht", "mdi:lightning-bolt", "energy")] : [])
    ], maxColumns, "energy")
  ];

  const mobilityOutdoor: LovelaceCardConfig[] = [];
  if (sources.specialists?.kia.enabled) mobilityOutdoor.push(navigationButton("Auto", "mdi:car-electric", "more"));
  if (sources.specialists?.robot.enabled) mobilityOutdoor.push(navigationButton("Robot", "mdi:robot-vacuum", "more"));
  if (sources.specialists?.garden.enabled) mobilityOutdoor.push(navigationButton("Tuin", "mdi:flower", "more"));
  if (sources.specialists?.pool.enabled) mobilityOutdoor.push(navigationButton("Zwembad", "mdi:pool", "more"));
  if (sources.energy?.ev_power_entity) mobilityOutdoor.push(readonlyTile(sources.energy.ev_power_entity, "Actueel laadvermogen"));
  sections.push(fullSection("Mobiliteit & buiten", "mdi:garage-variant", mobilityOutdoor, maxColumns, "more"));

  const systemCards: LovelaceCardConfig[] = [];
  if (sources.energy?.ups_entity) systemCards.push(readonlyTile(sources.energy.ups_entity, "Noodstroom"));
  const adminPath = sources.diagnostics?.admin_dashboard_path?.trim();
  if (adminPath) systemCards.push(navigationButton("Beheerdashboard", "mdi:shield-account-outline", adminPath));
  else systemCards.push(navigationButton("Meer en diagnose", "mdi:dots-horizontal-circle-outline", "more"));
  sections.push(fullSection("Systeem", "mdi:server-outline", systemCards, maxColumns, adminPath || "more"));

  return sections.filter((candidate): candidate is LovelaceCardConfig => Boolean(candidate))
    .filter((candidate) => Array.isArray(candidate.cards) && candidate.cards.length > 1);
}

export function registerHomeDashboardEnergyOverview(): void {
  if (typeof customElements === "undefined") return;
  const tag = "home-dashboard-energy-overview";
  if (!customElements.get(tag)) customElements.define(tag, HomeDashboardEnergyOverview);
}
