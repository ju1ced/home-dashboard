import {
  CONFIG_SCHEMA_VERSION,
  VIEW_PATHS,
  type CameraConfig,
  type HomeDashboardConfigV1
} from "./types";

export function createCameraConfig(index: number): CameraConfig {
  return {
    key: `camera_${index + 1}`,
    name: `Camera ${index + 1}`,
    camera_entity: "",
    privacy_entity: "",
    privacy_action_key: "",
    fallback: "placeholder",
    confirm_privacy_disable: true
  };
}

export function createDefaultConfig(): HomeDashboardConfigV1 {
  return {
    type: "custom:home-dashboard",
    schema_version: CONFIG_SCHEMA_VERSION,
    general: {
      title: "Home",
      language: "nl",
      time_format: "system",
      start_view: "home",
      theme_mode: "system",
      density: "comfortable"
    },
    today: {
      enabled: true,
      weather_entity: "",
      forecast_days: 5,
      waste_entities: [],
      battery_soc_entity: "",
      battery_power_entity: "",
      solar_power_entity: "",
      home_consumption_entity: "",
      monthly_capacity_peak_entity: "",
      energy_context_entities: []
    },
    persons: [],
    security: {
      enabled: false,
      alarm_entity: "",
      cameras: []
    },
    rooms: [],
    energy: {
      enabled: true,
      show_standard_dashboard_link: true,
      default_period: "day",
      electricity_entities: [],
      solar_entities: [],
      battery_entities: [],
      gas_entities: [],
      water_entities: [],
      device_entities: [],
      capacity_peak_entity: "",
      ev_power_entity: "",
      ups_entity: "",
      phase_entities: []
    },
    actions: [],
    specialists: {
      kia: {
        enabled: false,
        card_type: "custom:ha-kia-connect-dashboard",
        minimum_version: "",
        mapping_keys: []
      },
      robot: {
        enabled: false,
        card_type: "custom:robot-vacuum-card",
        minimum_version: "",
        mapping_keys: []
      },
      garden: {
        enabled: false,
        card_type: "custom:garden-dashboard-card",
        minimum_version: "",
        mapping_keys: []
      },
      pool: {
        enabled: false,
        card_type: "custom:pool-dashboard-card",
        minimum_version: "",
        mapping_keys: []
      }
    },
    layout: {
      view_order: [...VIEW_PATHS],
      mobile_disclosure: "progressive",
      show_weather: true,
      show_persons: true,
      show_security: true,
      show_quick_actions: true
    },
    diagnostics: {
      admin_dashboard_path: "",
      show_config_health: true,
      stale_after_minutes: 30,
      unavailable_policy: "operational_only",
      operational_entities: []
    }
  };
}
