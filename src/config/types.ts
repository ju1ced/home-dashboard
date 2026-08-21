export const CONFIG_SCHEMA_VERSION = 1 as const;

export const VIEW_PATHS = ["home", "rooms", "energy", "domains", "more"] as const;
export const ROOM_CAPABILITIES = [
  "lights",
  "covers",
  "climate",
  "media",
  "security",
  "power",
  "air_quality",
  "presence"
] as const;

export type ViewPath = (typeof VIEW_PATHS)[number];
export type RoomCapability = (typeof ROOM_CAPABILITIES)[number];
export type EntityReference = string;
export type LogicalKey = string;

export interface GeneralConfig {
  title: string;
  language: "nl" | "en";
  time_format: "system" | "12" | "24";
  start_view: ViewPath;
  theme_mode: "system" | "light" | "dark";
  density: "comfortable" | "compact";
}

export interface TodayConfig {
  enabled: boolean;
  weather_entity: EntityReference;
  forecast_days: number;
  waste_entities: EntityReference[];
  energy_context_entities: EntityReference[];
}

export interface PersonConfig {
  key: LogicalKey;
  entity: EntityReference;
  label: string;
  show_location: boolean;
  zone_entities: EntityReference[];
  freshness_minutes: number;
  battery_entities: EntityReference[];
}

export interface CameraConfig {
  key: LogicalKey;
  name: string;
  camera_entity: EntityReference;
  privacy_entity: EntityReference;
  privacy_action_key: LogicalKey;
  fallback: "placeholder" | "last_image" | "hidden";
  confirm_privacy_disable: boolean;
}

export interface SecurityConfig {
  enabled: boolean;
  alarm_entity: EntityReference;
  cameras: CameraConfig[];
}

export interface RoomConfig {
  key: LogicalKey;
  name: string;
  icon: string;
  floor_id: string;
  area_id: string;
  device_ids: string[];
  capabilities: RoomCapability[];
  quick_actions: LogicalKey[];
  light_entities: EntityReference[];
  cover_entities: EntityReference[];
  media_entities: EntityReference[];
  safety_entities: EntityReference[];
  camera_entities: EntityReference[];
  power_entities: EntityReference[];
  history_entities: EntityReference[];
  hvac: {
    entity: EntityReference;
    comfort_entities: EntityReference[];
    history_entities: EntityReference[];
    modes: string[];
    presets: string[];
    fan_modes: string[];
    swing_modes: string[];
  };
}

export interface EnergyConfig {
  enabled: boolean;
  show_standard_dashboard_link: boolean;
  default_period: "day" | "week" | "month" | "year";
  electricity_entities: EntityReference[];
  solar_entities: EntityReference[];
  battery_entities: EntityReference[];
  gas_entities: EntityReference[];
  water_entities: EntityReference[];
  device_entities: EntityReference[];
  capacity_peak_entity: EntityReference;
  ev_power_entity: EntityReference;
  ups_entity: EntityReference;
  phase_entities: EntityReference[];
}

export type ActionRisk = "safe" | "privacy" | "costly" | "destructive";

export interface ActionConfig {
  key: LogicalKey;
  label: string;
  sequence: unknown[];
  risk: ActionRisk;
  confirmation_text: string;
  hold_required: boolean;
  verification_entity: EntityReference;
}

export interface SpecialistConfig {
  enabled: boolean;
  card_type: string;
  minimum_version: string;
  mapping_keys: LogicalKey[];
}

export interface SpecialistsConfig {
  kia: SpecialistConfig;
  robot: SpecialistConfig;
  garden: SpecialistConfig;
  pool: SpecialistConfig;
}

export interface LayoutConfig {
  view_order: ViewPath[];
  mobile_disclosure: "progressive" | "expanded";
  show_weather: boolean;
  show_persons: boolean;
  show_security: boolean;
  show_quick_actions: boolean;
}

export interface DiagnosticsConfig {
  admin_dashboard_path: string;
  show_config_health: boolean;
  stale_after_minutes: number;
  unavailable_policy: "operational_only" | "all" | "hidden";
  operational_entities: EntityReference[];
}

export interface HomeDashboardConfigV1 {
  type: "custom:home-dashboard";
  schema_version: typeof CONFIG_SCHEMA_VERSION;
  general: GeneralConfig;
  today: TodayConfig;
  persons: PersonConfig[];
  security: SecurityConfig;
  rooms: RoomConfig[];
  energy: EnergyConfig;
  actions: ActionConfig[];
  specialists: SpecialistsConfig;
  layout: LayoutConfig;
  diagnostics: DiagnosticsConfig;
}

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
  severity: "error" | "warning";
}

export interface MigrationResult {
  config: HomeDashboardConfigV1;
  warnings: string[];
}

export interface CompiledConfigManifest {
  schema_version: typeof CONFIG_SCHEMA_VERSION;
  counts: {
    persons: number;
    cameras: number;
    rooms: number;
    actions: number;
  };
  enabled_specialists: string[];
  required_card_types: string[];
}
