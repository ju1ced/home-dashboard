import type {
  EnergyConfig,
  HomeDashboardConfigV1,
  RoomConfig,
  SpecialistsConfig,
  ViewPath
} from "../config/types";

type LovelaceConfig = Record<string, unknown>;

export interface HomeDashboardViewConfig {
  type: "custom:home-dashboard-view";
  view: ViewPath;
  density: HomeDashboardConfigV1["general"]["density"];
  show_weather?: boolean;
  today?: HomeDashboardConfigV1["today"];
  persons?: HomeDashboardConfigV1["persons"];
  security?: HomeDashboardConfigV1["security"];
  rooms?: RoomConfig[];
  energy?: EnergyConfig;
  specialists?: SpecialistsConfig;
  counts?: { rooms: number; persons: number; cameras: number };
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

function readonlyPictureEntity(entity: string, name: string): LovelaceConfig {
  return {
    type: "picture-entity",
    entity,
    name,
    camera_view: "auto",
    show_name: true,
    show_state: true,
    tap_action: noAction(),
    hold_action: noAction(),
    double_tap_action: noAction()
  };
}

function readonlyCameraCard(entity: string, name: string, fallback: "placeholder" | "last_image" | "hidden"): LovelaceConfig {
  const card = readonlyPictureEntity(entity, name);
  if (fallback !== "hidden") return card;
  return {
    type: "conditional",
    conditions: [
      { condition: "state", entity, state_not: "unavailable" },
      { condition: "state", entity, state_not: "unknown" }
    ],
    card
  };
}

function section(title: string, cards: LovelaceConfig[]): LovelaceConfig | undefined {
  if (cards.length === 0) return undefined;
  return { type: "grid", title, cards };
}

function markdown(content: string, title?: string): LovelaceConfig {
  return { type: "markdown", ...(title ? { title } : {}), content };
}

function homeSections(config: HomeDashboardViewConfig): LovelaceConfig[] {
  const sections: Array<LovelaceConfig | undefined> = [];
  const todayCards: LovelaceConfig[] = [];
  if (config.today?.enabled) {
    if (config.show_weather !== false && config.today.weather_entity) {
      todayCards.push({ type: "weather-forecast", entity: config.today.weather_entity, forecast_type: "daily", show_forecast: true });
    }
    for (const entity of uniqueEntities([...(config.today.waste_entities ?? []), ...(config.today.energy_context_entities ?? [])])) {
      todayCards.push(readonlyTile(entity));
    }
  }
  sections.push(section("Vandaag", todayCards));

  const personCards = (config.persons ?? []).filter((person) => person.entity).map((person) => readonlyTile(
    person.entity,
    person.label || undefined,
    { show_entity_picture: true, vertical: true, ...(person.show_location ? {} : { hide_state: true }) }
  ));
  sections.push(section("Personen", personCards));

  const securityCards: LovelaceConfig[] = [];
  if (config.security?.enabled && config.security.alarm_entity) securityCards.push(readonlyTile(config.security.alarm_entity, "Alarm"));
  if (config.security?.enabled) {
    for (const camera of config.security.cameras) {
      if (camera.camera_entity) securityCards.push(readonlyCameraCard(camera.camera_entity, camera.name, camera.fallback));
      if (camera.privacy_entity) securityCards.push(readonlyTile(camera.privacy_entity, `${camera.name} · privacy`));
    }
  }
  sections.push(section("Beveiliging & privacy", securityCards));

  const roomCards = (config.rooms ?? []).map((room) => ({
    type: "button",
    name: room.name,
    icon: room.icon || "mdi:sofa",
    tap_action: { action: "navigate", navigation_path: "rooms" },
    hold_action: noAction(),
    double_tap_action: noAction()
  }));
  sections.push(section("Kamers", roomCards));

  const specialistNames: Record<keyof SpecialistsConfig, [string, string]> = {
    kia: ["Auto", "mdi:car-electric"],
    robot: ["Robot", "mdi:robot-vacuum"],
    garden: ["Tuin", "mdi:flower"],
    pool: ["Zwembad", "mdi:pool"]
  };
  const specialistCards = Object.entries(config.specialists ?? {}).filter(([, specialist]) => specialist.enabled).map(([key]) => ({
    type: "button",
    name: specialistNames[key as keyof SpecialistsConfig][0],
    icon: specialistNames[key as keyof SpecialistsConfig][1],
    tap_action: { action: "navigate", navigation_path: "more" },
    hold_action: noAction(),
    double_tap_action: noAction()
  }));
  sections.push(section("Specialisten", specialistCards));

  const present = sections.filter((candidate): candidate is LovelaceConfig => Boolean(candidate));
  return present.length > 0 ? present : [{ type: "grid", cards: [markdown("Configureer Vandaag, Personen, Security of Kamers via **Dashboard bewerken**.", "Home Dashboard")] }];
}

function roomEntities(room: RoomConfig): string[] {
  return uniqueEntities([
    ...room.light_entities,
    ...room.cover_entities,
    room.hvac.entity,
    ...room.hvac.comfort_entities,
    ...room.media_entities,
    ...room.safety_entities,
    ...room.camera_entities,
    ...room.power_entities
  ]);
}

function roomsSections(rooms: readonly RoomConfig[]): LovelaceConfig[] {
  if (rooms.length === 0) return [{ type: "grid", cards: [markdown("Voeg kamers toe via **Dashboard bewerken → Kamers**.", "Kamers")] }];
  return rooms.map((room) => ({
    type: "grid",
    title: room.name,
    cards: roomEntities(room).length > 0
      ? roomEntities(room).map((entity) => readonlyTile(entity))
      : [markdown("Nog geen statusbronnen geconfigureerd.")]
  }));
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
  if (!["home", "rooms", "energy", "domains", "more"].includes(config.view)) {
    return { type: "sections", max_columns: 1, dense_section_placement: false, sections: [{ type: "grid", cards: [markdown("Deze viewconfiguratie wordt niet ondersteund.", "Home Dashboard")] }] };
  }
  const sections = config.view === "home" ? homeSections(config)
    : config.view === "rooms" ? roomsSections(config.rooms ?? [])
      : config.view === "energy" ? energySections(config.energy)
        : config.view === "domains" ? domainSections(config.rooms ?? [])
          : moreSections(config);
  return {
    type: "sections",
    max_columns: config.density === "compact" ? 4 : 3,
    dense_section_placement: false,
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
