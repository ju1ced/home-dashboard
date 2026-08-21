export type FieldKind = "text" | "number" | "checkbox" | "select" | "entity" | "entities";

export interface FieldDefinition {
  path: string;
  section: string;
  label: string;
  description: string;
  kind: FieldKind;
  options?: readonly string[];
  selector?: Record<string, unknown>;
}

export const FIELD_DEFINITIONS: readonly FieldDefinition[] = [
  { path: "general.title", section: "general", label: "Titel", description: "Zichtbare naam van het dashboard.", kind: "text" },
  { path: "general.language", section: "general", label: "Taal", description: "Taal van eigen labels.", kind: "select", options: ["nl", "en"] },
  { path: "general.time_format", section: "general", label: "Tijdnotatie", description: "Volg Home Assistant of forceer 12/24 uur.", kind: "select", options: ["system", "12", "24"] },
  { path: "general.start_view", section: "general", label: "Startpagina", description: "Eerste semantische view.", kind: "select", options: ["home", "rooms", "energy", "domains", "more"] },
  { path: "general.theme_mode", section: "general", label: "Thema", description: "Systeem, licht of donker.", kind: "select", options: ["system", "light", "dark"] },
  { path: "general.density", section: "general", label: "Dichtheid", description: "Comfortabel of compacter.", kind: "select", options: ["comfortable", "compact"] },

  { path: "today.enabled", section: "today", label: "Vandaag tonen", description: "Weer, afval en korte energiecontext.", kind: "checkbox" },
  { path: "today.weather_entity", section: "today", label: "Weerbron", description: "Home Assistant weather-entiteit.", kind: "entity", selector: { entity: { domain: "weather" } } },
  { path: "today.forecast_days", section: "today", label: "Voorspellingsdagen", description: "Tussen 1 en 10 dagen.", kind: "number" },
  { path: "today.waste_entities", section: "today", label: "Afvalbronnen", description: "Selecteer alle relevante afvalsensoren.", kind: "entities", selector: { entity: { multiple: true } } },
  { path: "today.energy_context_entities", section: "today", label: "Energiecontext", description: "Kern-KPI's op Home.", kind: "entities", selector: { entity: { multiple: true } } },

  { path: "security.enabled", section: "security", label: "Security tonen", description: "Toont alarm, cameracarrousel en privacyknoppen.", kind: "checkbox" },
  { path: "security.alarm_entity", section: "security", label: "Alarm", description: "Alarmbediening en status.", kind: "entity", selector: { entity: { domain: "alarm_control_panel" } } },

  { path: "energy.enabled", section: "energy", label: "Energiepagina", description: "Volwaardige aparte Energie-view.", kind: "checkbox" },
  { path: "energy.show_standard_dashboard_link", section: "energy", label: "Link naar standaard Energie", description: "Behoud toegang tot de standaard Home Assistant-energiepagina.", kind: "checkbox" },
  { path: "energy.default_period", section: "energy", label: "Standaardperiode", description: "Begintijdvak voor grafieken.", kind: "select", options: ["day", "week", "month", "year"] },
  { path: "energy.electricity_entities", section: "energy", label: "Elektriciteit", description: "Netafname en injectie.", kind: "entities", selector: { entity: { multiple: true } } },
  { path: "energy.solar_entities", section: "energy", label: "Zonnepanelen", description: "Productie- en opbrengstbronnen.", kind: "entities", selector: { entity: { multiple: true } } },
  { path: "energy.battery_entities", section: "energy", label: "Batterij", description: "Laden, ontladen en SoC.", kind: "entities", selector: { entity: { multiple: true } } },
  { path: "energy.gas_entities", section: "energy", label: "Gas", description: "Gasverbruik indien aanwezig.", kind: "entities", selector: { entity: { multiple: true } } },
  { path: "energy.water_entities", section: "energy", label: "Water", description: "Waterverbruik en debiet.", kind: "entities", selector: { entity: { multiple: true } } },
  { path: "energy.device_entities", section: "energy", label: "Apparaten", description: "Individuele verbruikers met historische data.", kind: "entities", selector: { entity: { multiple: true } } },
  { path: "energy.capacity_peak_entity", section: "energy", label: "Capaciteitspiek", description: "Lokale piek-KPI.", kind: "entity", selector: { entity: {} } },
  { path: "energy.ev_power_entity", section: "energy", label: "EV-laadvermogen", description: "Actueel laadvermogen.", kind: "entity", selector: { entity: {} } },
  { path: "energy.ups_entity", section: "energy", label: "UPS", description: "Woningbrede UPS-status.", kind: "entity", selector: { entity: {} } },
  { path: "energy.phase_entities", section: "energy", label: "Fases", description: "Spanning of vermogen per fase.", kind: "entities", selector: { entity: { multiple: true } } },

  { path: "layout.mobile_disclosure", section: "layout", label: "Mobiele disclosure", description: "Progressief houdt Home scanbaar.", kind: "select", options: ["progressive", "expanded"] },
  { path: "layout.show_weather", section: "layout", label: "Weer op Home", description: "Zichtbaarheid van weerkaart.", kind: "checkbox" },
  { path: "layout.show_persons", section: "layout", label: "Personen op Home", description: "Thuis, zone en freshness.", kind: "checkbox" },
  { path: "layout.show_security", section: "layout", label: "Security op Home", description: "Cameracarrousel en privacy.", kind: "checkbox" },
  { path: "layout.show_quick_actions", section: "layout", label: "Quick actions", description: "Maximaal twee per kamer.", kind: "checkbox" },

  { path: "diagnostics.admin_dashboard_path", section: "diagnostics", label: "Beheerdashboardpad", description: "Optionele route naar bestaand beheer; geen autorisatiegrens.", kind: "text" },
  { path: "diagnostics.show_config_health", section: "diagnostics", label: "Configuratiegezondheid", description: "Toont mapping- en resourceproblemen aan beheerders.", kind: "checkbox" },
  { path: "diagnostics.stale_after_minutes", section: "diagnostics", label: "Stale na", description: "Minuten voor freshness-waarschuwing.", kind: "number" },
  { path: "diagnostics.unavailable_policy", section: "diagnostics", label: "Unavailable-beleid", description: "Operationeel relevant, alles of verborgen.", kind: "select", options: ["operational_only", "all", "hidden"] },
  { path: "diagnostics.operational_entities", section: "diagnostics", label: "Operationele allowlist", description: "Alleen deze unavailable-entiteiten kunnen Home-waarschuwingen geven.", kind: "entities", selector: { entity: { multiple: true } } }
] as const;

export const EDITOR_COVERAGE = Object.freeze({
  scalar: FIELD_DEFINITIONS.map((field) => field.path),
  collections: ["persons[]", "security.cameras[]", "rooms[]", "actions[]"],
  collection_fields: [
    "persons[].key", "persons[].entity", "persons[].label", "persons[].show_location", "persons[].zone_entities", "persons[].freshness_minutes", "persons[].battery_entities",
    "security.cameras[].key", "security.cameras[].name", "security.cameras[].camera_entity", "security.cameras[].privacy_entity", "security.cameras[].privacy_action_key", "security.cameras[].fallback", "security.cameras[].confirm_privacy_disable",
    "rooms[].key", "rooms[].name", "rooms[].icon", "rooms[].floor_id", "rooms[].area_id", "rooms[].device_ids", "rooms[].capabilities", "rooms[].quick_actions",
    "rooms[].light_entities", "rooms[].cover_entities", "rooms[].media_entities", "rooms[].safety_entities", "rooms[].camera_entities", "rooms[].power_entities", "rooms[].history_entities",
    "rooms[].hvac.entity", "rooms[].hvac.comfort_entities", "rooms[].hvac.history_entities", "rooms[].hvac.modes", "rooms[].hvac.presets", "rooms[].hvac.fan_modes", "rooms[].hvac.swing_modes",
    "actions[].key", "actions[].label", "actions[].sequence", "actions[].risk", "actions[].confirmation_text", "actions[].hold_required", "actions[].verification_entity"
  ],
  specialist: ["specialists.kia", "specialists.robot", "specialists.garden", "specialists.pool"],
  ordered: ["layout.view_order"]
});
