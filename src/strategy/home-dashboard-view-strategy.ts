import type {
  DiagnosticsConfig,
  EnergyConfig,
  HomeDashboardConfigV1,
  RoomConfig,
  SpecialistsConfig,
  ViewPath
} from "../config/types";

type LovelaceConfig = Record<string, unknown>;

export interface HomeDashboardViewConfig {
  type: "custom:home-dashboard-view";
  view: ViewPath | "room";
  density: HomeDashboardConfigV1["general"]["density"];
  theme_mode?: HomeDashboardConfigV1["general"]["theme_mode"];
  show_weather?: boolean;
  today?: HomeDashboardConfigV1["today"];
  persons?: HomeDashboardConfigV1["persons"];
  security?: HomeDashboardConfigV1["security"];
  rooms?: RoomConfig[];
  energy?: EnergyConfig;
  specialists?: SpecialistsConfig;
  counts?: { rooms: number; persons: number; cameras: number };
  diagnostics?: DiagnosticsConfig;
  room?: RoomConfig;
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

function uniqueEntities(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function noAction(): LovelaceConfig {
  return { action: "none" };
}

function readonlyTile(entity: string, name?: string, options: LovelaceConfig = {}): LovelaceConfig {
  return {
    type: "tile",
    entity,
    ...(name ? { name } : {}),
    ...options,
    tap_action: noAction(),
    hold_action: noAction(),
    double_tap_action: noAction(),
    icon_tap_action: noAction(),
    icon_hold_action: noAction(),
    icon_double_tap_action: noAction()
  };
}

function section(title: string, cards: LovelaceConfig[]): LovelaceConfig | undefined {
  if (cards.length === 0) return undefined;
  return { type: "grid", title, cards };
}

function markdown(content: string, title?: string): LovelaceConfig {
  return { type: "markdown", ...(title ? { title } : {}), content };
}

function heading(headingText: string, icon: string, navigationPath?: string): LovelaceConfig {
  return {
    type: "heading",
    heading: headingText,
    icon,
    ...(navigationPath ? { tap_action: { action: "navigate", navigation_path: navigationPath } } : {}),
    grid_options: { columns: "full", rows: "auto" }
  };
}

function homeSection(title: string, icon: string, cards: LovelaceConfig[], columnSpan = 1, navigationPath?: string): LovelaceConfig | undefined {
  if (cards.length === 0) return undefined;
  return { type: "grid", column_span: columnSpan, cards: [heading(title, icon, navigationPath), ...cards] };
}

function homeSections(config: HomeDashboardViewConfig, maxColumns: number): LovelaceConfig[] {
  return [{
    type: "grid",
    column_span: maxColumns,
    cards: [{
      type: "custom:home-dashboard-home-overview",
      theme_mode: config.theme_mode,
      today: config.today,
      persons: config.persons ?? [],
      security: config.security,
      rooms: config.rooms ?? [],
      specialists: config.specialists,
      diagnostics: config.diagnostics,
      energy: config.energy,
      show_weather: config.show_weather,
      grid_options: { columns: "full", rows: "auto" }
    }]
  }];
}

function roomsSections(rooms: readonly RoomConfig[], maxColumns: number): LovelaceConfig[] {
  if (rooms.length === 0) return [{ type: "grid", cards: [markdown("Voeg kamers toe via **Dashboard bewerken → Kamers**.", "Kamers")] }];
  return [{
    type: "grid",
    column_span: maxColumns,
    cards: [{ type: "custom:home-dashboard-room-overview", rooms, grid_options: { columns: "full", rows: "auto" } }]
  }];
}

function roomDetailSection(title: string, icon: string, cards: LovelaceConfig[], maxColumns: number): LovelaceConfig | undefined {
  return homeSection(title, icon, cards, maxColumns);
}

function roomDetailSections(room: RoomConfig | undefined, maxColumns: number): LovelaceConfig[] {
  if (!room) return [{ type: "grid", cards: [markdown("Deze kamerconfiguratie ontbreekt.", "Kamer")] }];
  const sections: Array<LovelaceConfig | undefined> = [{
    type: "grid",
    column_span: maxColumns,
    cards: [{ type: "custom:home-dashboard-room-detail", room, grid_options: { columns: "full", rows: "auto" } }]
  }];

  const historyEntities = uniqueEntities([...room.history_entities, ...room.hvac.history_entities]);
  if (historyEntities.length > 0) {
    sections.push(roomDetailSection("Historie", "mdi:chart-line", [{
      type: "history-graph",
      entities: historyEntities,
      hours_to_show: 72,
      grid_options: { columns: "full", rows: 5 }
    }], maxColumns));
  }
  return sections.filter((candidate): candidate is LovelaceConfig => Boolean(candidate));
}

function energySections(energy?: EnergyConfig): LovelaceConfig[] {
  if (!energy?.enabled) return [{ type: "grid", cards: [markdown("Activeer Energie via **Dashboard bewerken → Energie**.", "Energie")] }];
  const groups: Array<[string, string[]]> = [
    ["Elektriciteit", energy.electricity_entities],
    ["Zon", energy.solar_entities],
    ["Batterij", energy.battery_entities],
    ["Gas", energy.gas_entities],
    ["Water", energy.water_entities],
    ["Apparaten", energy.device_entities],
    ["Lokale context", uniqueEntities([energy.capacity_peak_entity, energy.ev_power_entity, energy.ups_entity, ...energy.phase_entities])]
  ];
  const sections = groups.map(([title, entities]) => section(title, uniqueEntities(entities).map((entity) => readonlyTile(entity)))).filter((candidate): candidate is LovelaceConfig => Boolean(candidate));
  if (energy.show_standard_dashboard_link) {
    sections.push({ type: "grid", title: "Volledig energiebeheer", cards: [{
      type: "button", name: "Open standaard Energie-dashboard", icon: "mdi:lightning-bolt",
      tap_action: { action: "navigate", navigation_path: "/energy" }, hold_action: noAction(), double_tap_action: noAction()
    }] });
  }
  return sections.length > 0 ? sections : [{ type: "grid", cards: [markdown("Voeg energiebronnen toe via **Dashboard bewerken → Energie**.", "Energie")] }];
}

function domainSections(rooms: readonly RoomConfig[]): LovelaceConfig[] {
  const groups: Array<[string, string[]]> = [
    ["Verlichting", rooms.flatMap((room) => room.light_entities)],
    ["Covers en openingen", rooms.flatMap((room) => room.cover_entities)],
    ["Klimaat", rooms.flatMap((room) => [room.hvac.entity, ...room.hvac.comfort_entities])],
    ["Media", rooms.flatMap((room) => room.media_entities)],
    ["Safety", rooms.flatMap((room) => room.safety_entities)],
    ["Camera's", rooms.flatMap((room) => room.camera_entities)],
    ["Power", rooms.flatMap((room) => room.power_entities)]
  ];
  const sections = groups.map(([title, entities]) => section(title, uniqueEntities(entities).map((entity) => readonlyTile(entity)))).filter((candidate): candidate is LovelaceConfig => Boolean(candidate));
  return sections.length > 0 ? sections : [{ type: "grid", cards: [markdown("Domeinen verschijnen zodra kamerbronnen zijn geconfigureerd.", "Domeinen")] }];
}

function moreSections(config: HomeDashboardViewConfig): LovelaceConfig[] {
  const counts = config.counts ?? { rooms: 0, persons: 0, cameras: 0 };
  const enabled = Object.entries(config.specialists ?? {}).filter(([, specialist]) => specialist.enabled).map(([key]) => key);
  return [{
    type: "grid",
    title: "Dashboardstatus",
    cards: [markdown([
      `- ${counts.rooms} kamer(s)`,
      `- ${counts.persons} perso(o)n(en)`,
      `- ${counts.cameras} camera('s)`,
      `- Specialistische details: ${enabled.length > 0 ? enabled.join(", ") : "nog niet geactiveerd"}`,
      "",
      "Deze eerste render is **read-only**. Bediening en volledige specialistische detailcards volgen na hun afzonderlijke veiligheidsgates."
    ].join("\n"))]
  }];
}

export function buildView(config: HomeDashboardViewConfig): LovelaceConfig {
  if (!["home", "rooms", "energy", "domains", "more", "room"].includes(config.view)) {
    return { type: "sections", max_columns: 1, dense_section_placement: false, sections: [{ type: "grid", cards: [markdown("Deze viewconfiguratie wordt niet ondersteund.", "Home Dashboard")] }] };
  }
  const maxColumns = config.density === "compact" ? 4 : 3;
  const sections = config.view === "home" ? homeSections(config, maxColumns)
    : config.view === "rooms" ? roomsSections(config.rooms ?? [], maxColumns)
      : config.view === "room" ? roomDetailSections(config.room, maxColumns)
      : config.view === "energy" ? energySections(config.energy)
        : config.view === "domains" ? domainSections(config.rooms ?? [])
          : moreSections(config);
  return {
    type: "sections",
    max_columns: maxColumns,
    dense_section_placement: config.view === "home" || config.view === "room",
    sections
  };
}

export class HomeDashboardViewStrategy extends HTMLElementBase {
  public static readonly registryDependencies: string[] = [];

  public static async generate(config: HomeDashboardViewConfig): Promise<LovelaceConfig> {
    return buildView(config);
  }
}

export function registerHomeDashboardViewStrategy(): void {
  if (typeof customElements === "undefined") return;
  const tag = "ll-strategy-view-home-dashboard-view";
  if (!customElements.get(tag)) customElements.define(tag, HomeDashboardViewStrategy);
}
