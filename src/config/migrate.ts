import { createCameraConfig, createDefaultConfig } from "./defaults";
import { CONFIG_SCHEMA_VERSION, type ActionConfig, type HomeDashboardConfigV1, type MigrationResult, type PersonConfig, type RoomConfig } from "./types";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeKnown(defaultValue: unknown, inputValue: unknown): unknown {
  if (Array.isArray(defaultValue)) return Array.isArray(inputValue) ? structuredClone(inputValue) : structuredClone(defaultValue);
  if (isObject(defaultValue)) {
    const input = isObject(inputValue) ? inputValue : {};
    return Object.fromEntries(
      Object.entries(defaultValue).map(([key, value]) => [key, mergeKnown(value, input[key])])
    );
  }
  if (typeof defaultValue === "string") return typeof inputValue === "string" ? inputValue : defaultValue;
  if (typeof defaultValue === "boolean") return typeof inputValue === "boolean" ? inputValue : defaultValue;
  if (typeof defaultValue === "number") return typeof inputValue === "number" && Number.isFinite(inputValue) ? inputValue : defaultValue;
  return inputValue === undefined ? defaultValue : inputValue;
}

function normalizeItems<T>(items: unknown[], createItem: (index: number) => T, warnings: string[], label: string): T[] {
  return items.map((item, index) => {
    if (!isObject(item)) {
      warnings.push(`${label}[${index}] had geen geldige objectstructuur en is vervangen door een lege editorrij.`);
      return createItem(index);
    }
    return mergeKnown(createItem(index), item) as T;
  });
}

export function migrateConfig(input: unknown): MigrationResult {
  const defaults = createDefaultConfig();
  if (!isObject(input)) {
    return { config: defaults, warnings: ["Lege configuratie vervangen door schema v1-standaarden."] };
  }

  const version = input.schema_version;
  if (version !== undefined && (typeof version !== "number" || !Number.isInteger(version))) {
    throw new Error(`Ongeldige schema_version ${JSON.stringify(version)}; verwacht een geheel getal.`);
  }
  if (typeof version === "number" && version > CONFIG_SCHEMA_VERSION) {
    throw new Error(`Configuratieschema ${version} is nieuwer dan ondersteund schema ${CONFIG_SCHEMA_VERSION}.`);
  }

  const warnings: string[] = [];
  if (version === undefined) warnings.push("Configuratie zonder schema_version geïnterpreteerd als een gedeeltelijke v1-configuratie.");
  if (version !== undefined && version !== CONFIG_SCHEMA_VERSION) {
    warnings.push(`Configuratieschema ${String(version)} gemigreerd naar schema ${CONFIG_SCHEMA_VERSION}.`);
  }

  const merged = mergeKnown(defaults, input) as HomeDashboardConfigV1;
  merged.schema_version = CONFIG_SCHEMA_VERSION;
  const inputSpecialists = isObject(input.specialists) ? input.specialists : undefined;
  const inputKia = inputSpecialists && isObject(inputSpecialists.kia) ? inputSpecialists.kia : undefined;
  if (inputKia && isObject(inputKia.card_config)) {
    // Dit is bewust een transparante doorgeefconfiguratie naar de zelfstandig
    // geversioneerde Kia-card. mergeKnown bewaart dynamische cardvelden niet.
    merged.specialists.kia.card_config = structuredClone(inputKia.card_config);
  }
  if (merged.specialists.kia.card_type === "custom:ha-kia-connect-dashboard") {
    // De HACS-resource heet ha-kia-connect-dashboard.js, maar registreert de
    // Lovelace-kaart als custom:kia-dashboard-card. Bewaar bestaande private
    // configuratie en corrigeer alleen deze historische systeemwaarde.
    merged.specialists.kia.card_type = "custom:kia-dashboard-card";
    warnings.push("Het verouderde Kia-kaarttype is hersteld naar custom:kia-dashboard-card.");
  }
  const inputToday = isObject(input.today) ? input.today : undefined;
  const legacyBatteryPower = inputToday?.battery_power_entity;
  if (typeof legacyBatteryPower === "string" && legacyBatteryPower) {
    const hasSplitMapping = Boolean(inputToday?.battery_charge_power_entity || inputToday?.battery_discharge_power_entity);
    if (!hasSplitMapping && !merged.today.energy_context_entities.includes(legacyBatteryPower)) {
      merged.today.energy_context_entities.push(legacyBatteryPower);
      warnings.push("De oude gecombineerde batterijvermogensbron is als extra energiecontext bewaard; kies afzonderlijke laad- en ontlaadsensoren onder Vandaag.");
    }
  }
  merged.persons = normalizeItems<PersonConfig>(merged.persons, (index) => ({
    key: `person_${index + 1}`,
    entity: "",
    label: "",
    show_location: true,
    zone_entities: [],
    freshness_minutes: 30,
    battery_entities: []
  }), warnings, "persons");
  merged.security.cameras = normalizeItems(merged.security.cameras, createCameraConfig, warnings, "security.cameras");
  merged.rooms = normalizeItems<RoomConfig>(merged.rooms, (index) => ({
    key: `room_${index + 1}`,
    name: "",
    icon: "mdi:sofa",
    floor_id: "",
    area_id: "",
    device_ids: [],
    capabilities: [],
    quick_actions: [],
    light_entities: [],
    cover_entities: [],
    media_entities: [],
    safety_entities: [],
    camera_entities: [],
    power_entities: [],
    history_entities: [],
    hvac: {
      entity: "",
      comfort_entities: [],
      history_entities: [],
      modes: [],
      presets: [],
      fan_modes: [],
      swing_modes: []
    }
  }), warnings, "rooms");
  merged.actions = normalizeItems<ActionConfig>(merged.actions, (index) => ({
    key: `action_${index + 1}`,
    label: "",
    sequence: [],
    risk: "safe",
    confirmation_text: "",
    hold_required: false,
    verification_entity: ""
  }), warnings, "actions");
  return { config: merged, warnings };
}
