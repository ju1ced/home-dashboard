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
  const inputPrinter = inputSpecialists && isObject(inputSpecialists.printer) ? inputSpecialists.printer : undefined;
  if (inputPrinter && isObject(inputPrinter.card_config)) {
    // Zelfde transparante doorgeefpatroon als Kia: mergeKnown bewaart geen
    // dynamische entiteitsmappings, dus die worden hier expliciet behouden.
    merged.specialists.printer.card_config = structuredClone(inputPrinter.card_config);
  }
  if (merged.specialists.kia.card_type === "custom:ha-kia-connect-dashboard") {
    // De HACS-resource heet ha-kia-connect-dashboard.js, maar registreert de
    // Lovelace-kaart als custom:kia-dashboard-card. Bewaar bestaande private
    // configuratie en corrigeer alleen deze historische systeemwaarde.
    merged.specialists.kia.card_type = "custom:kia-dashboard-card";
    warnings.push("Het verouderde Kia-kaarttype is hersteld naar custom:kia-dashboard-card.");
  }
  const inputPool = inputSpecialists && isObject(inputSpecialists.pool) ? inputSpecialists.pool : undefined;
  if (inputPool && isObject(inputPool.card_config)) {
    // Zelfde transparante doorgeefpatroon als Kia/printer: mergeKnown bewaart
    // geen dynamische entiteitsmappings, dus die worden hier expliciet behouden.
    merged.specialists.pool.card_config = structuredClone(inputPool.card_config);
  }
  if (merged.specialists.pool.card_type === "custom:pool-dashboard-card") {
    // Vroege alpha's reserveerden dit cardtype voor een nooit-gepubliceerde
    // externe kaart. Bewaar bestaande private configuratie en corrigeer
    // alleen deze historische systeemwaarde naar de zelfstandige kaart.
    merged.specialists.pool.card_type = "custom:home-dashboard-pool-summary";
    warnings.push("Het verouderde Zwembad-kaarttype is hersteld naar custom:home-dashboard-pool-summary.");
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
  const roomInputs = [...merged.rooms] as unknown[];
  merged.rooms = normalizeItems<RoomConfig>(merged.rooms, (index) => ({
    key: `room_${index + 1}`,
    name: "",
    icon: "mdi:sofa",
    floor_id: "",
    area_id: "",
    device_ids: [],
    capabilities: [],
    quick_actions: [],
    home_favorite: false, controls_enabled: false,
    control_light_entity: "", control_cover_entity: "", control_awning_entity: "", control_media_entity: "",
    light_entities: [],
    light_switch_entities: [],
    light_groups: [],
    cover_entities: [],
    cover_controls: [],
    media_entities: [],
    safety_entities: [],
    camera_entities: [],
    power_entities: [],
    history_entities: [],
    image_entity: "",
    temperature_history_entity: "",
    smart_plugs: [],
    room_energy: { power_entity: "", day_entity: "", month_entity: "", year_entity: "" },
    desk: { card_type: "custom:linak-desk-card", card_config: {} },
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
  merged.rooms.forEach((room, index) => {
    const inputRoom = roomInputs[index];
    room.light_groups = normalizeItems(room.light_groups ?? [], (itemIndex) => ({
      key: `light_group_${itemIndex + 1}`, name: "", control_entity: "", member_entities: []
    }), warnings, `rooms[${index}].light_groups`);
    room.cover_controls = normalizeItems(room.cover_controls ?? [], (itemIndex) => ({
      key: `cover_${itemIndex + 1}`, name: "", entity: "", kind: "shutter", confirmation: "movement"
    }), warnings, `rooms[${index}].cover_controls`);
    room.smart_plugs = normalizeItems(room.smart_plugs ?? [], (itemIndex) => ({
      key: `plug_${itemIndex + 1}`, name: "", switch_entity: "", power_entity: "", energy_entity: "", voltage_entity: "",
      protected: false, protection_reason: "", energy_day_entity: "", energy_month_entity: "", energy_year_entity: ""
    }), warnings, `rooms[${index}].smart_plugs`);
    const inputPlugs = isObject(inputRoom) && Array.isArray(inputRoom.smart_plugs) ? inputRoom.smart_plugs : [];
    room.smart_plugs.forEach((plug, plugIndex) => {
      const inputPlug = inputPlugs[plugIndex];
      if (!isObject(inputPlug)) return;
      if (inputPlug.energy_day_period === "running" || inputPlug.energy_day_period === "completed") plug.energy_day_period = inputPlug.energy_day_period;
      if (inputPlug.energy_month_period === "running" || inputPlug.energy_month_period === "completed") plug.energy_month_period = inputPlug.energy_month_period;
      if (inputPlug.energy_year_period === "running" || inputPlug.energy_year_period === "completed") plug.energy_year_period = inputPlug.energy_year_period;
    });
    const inputRoomEnergy = isObject(inputRoom) && isObject(inputRoom.room_energy) ? inputRoom.room_energy : undefined;
    if (room.room_energy && inputRoomEnergy) {
      if (inputRoomEnergy.day_period === "running" || inputRoomEnergy.day_period === "completed") room.room_energy.day_period = inputRoomEnergy.day_period;
      if (inputRoomEnergy.month_period === "running" || inputRoomEnergy.month_period === "completed") room.room_energy.month_period = inputRoomEnergy.month_period;
      if (inputRoomEnergy.year_period === "running" || inputRoomEnergy.year_period === "completed") room.room_energy.year_period = inputRoomEnergy.year_period;
    }
    if (isObject(inputRoom) && Array.isArray(inputRoom.control_entities)) {
      room.control_entities = structuredClone(inputRoom.control_entities) as string[];
    }
    if (isObject(inputRoom) && isObject(inputRoom.desk) && isObject(inputRoom.desk.card_config)) {
      room.desk = { card_type: "custom:linak-desk-card", card_config: structuredClone(inputRoom.desk.card_config) };
    }
    // image_upload has no sensible non-empty default (unlike room_energy/desk/hvac), so it stays a truly
    // absent key (Object.hasOwn === false) unless a configured upload is actually present on the input.
    // mergeKnown() only copies keys that already exist on the defaults object, so this field is populated
    // here explicitly rather than via the generic default-object path.
    if (isObject(inputRoom) && isObject(inputRoom.image_upload) && typeof inputRoom.image_upload.media_content_id === "string" && inputRoom.image_upload.media_content_id) {
      room.image_upload = {
        media_content_id: inputRoom.image_upload.media_content_id,
        media_content_type: typeof inputRoom.image_upload.media_content_type === "string" ? inputRoom.image_upload.media_content_type : ""
      };
    }
  });
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
