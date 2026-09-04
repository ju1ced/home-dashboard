import {
  CONFIG_SCHEMA_VERSION,
  ROOM_CAPABILITIES,
  VIEW_PATHS,
  type HomeDashboardConfigV1,
  type ValidationIssue
} from "./types";

const LOGICAL_KEY = /^[a-z][a-z0-9_]*$/;

function issue(path: string, code: string, message: string, severity: ValidationIssue["severity"] = "error"): ValidationIssue {
  return { path, code, message, severity };
}

function validateKeys(items: ReadonlyArray<{ key: string }>, path: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (!LOGICAL_KEY.test(item.key)) {
      issues.push(issue(`${path}[${index}].key`, "invalid_logical_key", "Gebruik kleine letters, cijfers en underscores; begin met een letter."));
    }
    if (seen.has(item.key)) issues.push(issue(`${path}[${index}].key`, "duplicate_logical_key", `Logische sleutel '${item.key}' komt dubbel voor.`));
    seen.add(item.key);
  });
  return issues;
}

function validateEnum(path: string, value: string, allowed: readonly string[]): ValidationIssue | undefined {
  return allowed.includes(value) ? undefined : issue(path, "enum", `Waarde '${value}' is niet toegestaan.`);
}

export function validateConfig(config: HomeDashboardConfigV1): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (config.type !== "custom:home-dashboard") {
    issues.push(issue("type", "strategy_type", "Strategytype moet custom:home-dashboard zijn."));
  }
  if (config.schema_version !== CONFIG_SCHEMA_VERSION) {
    issues.push(issue("schema_version", "unsupported_schema", `Alleen schema ${CONFIG_SCHEMA_VERSION} wordt ondersteund.`));
  }

  if (!config.general.title.trim()) issues.push(issue("general.title", "required", "Een dashboardtitel is verplicht."));
  for (const candidate of [
    validateEnum("general.language", config.general.language, ["nl", "en"]),
    validateEnum("general.time_format", config.general.time_format, ["system", "12", "24"]),
    validateEnum("general.start_view", config.general.start_view, VIEW_PATHS),
    validateEnum("general.theme_mode", config.general.theme_mode, ["system", "light", "dark"]),
    validateEnum("general.density", config.general.density, ["comfortable", "compact"]),
    validateEnum("energy.default_period", config.energy.default_period, ["day", "week", "month", "year"]),
    validateEnum("layout.mobile_disclosure", config.layout.mobile_disclosure, ["progressive", "expanded"]),
    validateEnum("diagnostics.unavailable_policy", config.diagnostics.unavailable_policy, ["operational_only", "all", "hidden"])
  ]) {
    if (candidate) issues.push(candidate);
  }
  if (!Number.isInteger(config.today.forecast_days) || config.today.forecast_days < 1 || config.today.forecast_days > 10) {
    issues.push(issue("today.forecast_days", "range", "Kies 1 tot en met 10 voorspellingsdagen."));
  }

  issues.push(...validateKeys(config.persons, "persons"));
  config.persons.forEach((personConfig, index) => {
    if (!personConfig.entity) issues.push(issue(`persons[${index}].entity`, "required", "Kies een person-entiteit."));
    if (!Number.isInteger(personConfig.freshness_minutes) || personConfig.freshness_minutes < 1) issues.push(issue(`persons[${index}].freshness_minutes`, "range", "Freshness moet een geheel aantal minuten van minstens één zijn."));
  });

  issues.push(...validateKeys(config.security.cameras, "security.cameras"));
  if (config.security.enabled && config.security.cameras.length === 0) {
    issues.push(issue("security.cameras", "camera_required", "Geactiveerde security vereist minstens één camera."));
  }
  config.security.cameras.forEach((cameraConfig, index) => {
    if (!cameraConfig.camera_entity) issues.push(issue(`security.cameras[${index}].camera_entity`, "required", "Kies een camera-entiteit."));
    const fallbackIssue = validateEnum(`security.cameras[${index}].fallback`, cameraConfig.fallback, ["placeholder", "last_image", "hidden"]);
    if (fallbackIssue) issues.push(fallbackIssue);
  });

  issues.push(...validateKeys(config.rooms, "rooms"));
  const actionKeys = new Set(config.actions.map((action) => action.key));
  config.rooms.forEach((room, index) => {
    if (!room.name.trim()) issues.push(issue(`rooms[${index}].name`, "required", "Een kamernaam is verplicht."));
    if (!room.area_id && room.device_ids.length === 0) issues.push(issue(`rooms[${index}].area_id`, "required", "Kies een area of minstens één expliciet device voor area-loze mapping."));
    if (room.quick_actions.length > 2) issues.push(issue(`rooms[${index}].quick_actions`, "quick_action_limit", "Een kamer heeft maximaal twee quick actions."));
    for (const capability of room.capabilities) {
      if (!(ROOM_CAPABILITIES as readonly string[]).includes(capability)) {
        issues.push(issue(`rooms[${index}].capabilities`, "unknown_capability", `Onbekende capability '${capability}'.`));
      }
    }
    for (const actionKey of room.quick_actions) {
      if (!actionKeys.has(actionKey)) issues.push(issue(`rooms[${index}].quick_actions`, "unknown_action", `Actie '${actionKey}' bestaat niet.`));
    }
    if (room.capabilities.includes("climate") && !room.hvac.entity) {
      issues.push(issue(`rooms[${index}].hvac.entity`, "source_recommended", "Kies een klimaatbron voor volledige mode-, preset-, fan- en swingbediening.", "warning"));
    }
    if (room.capabilities.includes("power") && room.power_entities.length === 0 && room.device_ids.length === 0) {
      issues.push(issue(`rooms[${index}].power_entities`, "source_recommended", "Koppel powerbronnen of expliciete devices.", "warning"));
    }
  });

  issues.push(...validateKeys(config.actions, "actions"));
  config.actions.forEach((action, index) => {
    if (!action.label.trim()) issues.push(issue(`actions[${index}].label`, "required", "Een actielabel is verplicht."));
    if (action.sequence.length === 0) issues.push(issue(`actions[${index}].sequence`, "required", "Configureer minstens één Home Assistant-actie."));
    action.sequence.forEach((step, stepIndex) => {
      if (typeof step !== "object" || step === null || Array.isArray(step)) {
        issues.push(issue(`actions[${index}].sequence[${stepIndex}]`, "action_shape", "Iedere actiestap moet een Home Assistant-actionobject zijn."));
        return;
      }
      const stepConfig = step as Record<string, unknown>;
      if (typeof stepConfig.action !== "string" || !stepConfig.action) issues.push(issue(`actions[${index}].sequence[${stepIndex}].action`, "required", "Actietype ontbreekt."));
      if (typeof stepConfig.action === "string" && stepConfig.action) {
        if (!/^[a-z0-9_]+\.[a-z0-9_]+$/.test(stepConfig.action)) {
          issues.push(issue(`actions[${index}].sequence[${stepIndex}].action`, "unsupported_action", "Gebruik een expliciete Home Assistant service-action uit de action-selector."));
        }
        const target = stepConfig.target;
        const isTargetObject = typeof target === "object" && target !== null && !Array.isArray(target);
        const hasExplicitScope = isTargetObject && ["entity_id", "device_id", "area_id", "label_id", "floor_id"].some((key) => {
          const value = (target as Record<string, unknown>)[key];
          return typeof value === "string" ? value.trim().length > 0 : Array.isArray(value) && value.some((candidate) => typeof candidate === "string" && candidate.trim().length > 0);
        });
        if (!hasExplicitScope) {
          issues.push(issue(`actions[${index}].sequence[${stepIndex}].target`, "target_required", "Een service-action vereist een expliciete targetscope."));
        }
      }
    });
    if (!action.verification_entity) issues.push(issue(`actions[${index}].verification_entity`, "verification_required", "Kies een entity om het actieresultaat te verifiëren."));
    const riskIssue = validateEnum(`actions[${index}].risk`, action.risk, ["safe", "privacy", "costly", "destructive"]);
    if (riskIssue) issues.push(riskIssue);
    if (action.risk !== "safe" && !action.confirmation_text.trim()) {
      issues.push(issue(`actions[${index}].confirmation_text`, "confirmation_required", "Privacy-, kostelijke en destructieve acties vereisen bevestigingstekst."));
    }
    if ((action.risk === "destructive" || action.risk === "costly") && !action.hold_required) {
      issues.push(issue(`actions[${index}].hold_required`, "hold_recommended", "Voor deze actie is hold-to-confirm sterk aanbevolen.", "warning"));
    }
  });

  config.security.cameras.forEach((cameraConfig, cameraIndex) => {
    if (cameraConfig.privacy_action_key) {
      const privacyAction = config.actions.find((action) => action.key === cameraConfig.privacy_action_key);
      if (!privacyAction) {
        issues.push(issue(`security.cameras[${cameraIndex}].privacy_action_key`, "unknown_action", `Privacy-actie '${cameraConfig.privacy_action_key}' bestaat niet.`));
      }
    }
  });

  const order = config.layout.view_order;
  if (order.length !== VIEW_PATHS.length || new Set(order).size !== VIEW_PATHS.length || VIEW_PATHS.some((path) => !order.includes(path))) {
    issues.push(issue("layout.view_order", "view_order", "De viewvolgorde moet elk vast dashboardpad exact één keer bevatten."));
  }

  const expectedCardTypes: Record<string, string> = {
    kia: "custom:kia-dashboard-card",
    robot: "custom:robot-vacuum-card",
    garden: "custom:garden-dashboard-card",
    pool: "custom:pool-dashboard-card"
  };
  for (const [key, specialist] of Object.entries(config.specialists)) {
    if (!specialist.card_type.startsWith("custom:")) {
      issues.push(issue(`specialists.${key}.card_type`, "card_type", "Een specialistische kaart gebruikt een custom: cardtype."));
    }
    if (specialist.card_type !== expectedCardTypes[key]) {
      issues.push(issue(`specialists.${key}.card_type`, "fixed_card_type", `Cardtype is een vast systeemcontract: ${expectedCardTypes[key]}.`));
    }
    if (specialist.enabled && !specialist.minimum_version) {
      issues.push(issue(`specialists.${key}.minimum_version`, "version_recommended", "Leg een geteste minimumversie vast.", "warning"));
    }
    for (const mappingKey of specialist.mapping_keys) {
      if (!LOGICAL_KEY.test(mappingKey)) issues.push(issue(`specialists.${key}.mapping_keys`, "invalid_logical_key", `Ongeldige mappingsleutel '${mappingKey}'.`));
    }
  }
  if (typeof config.specialists.kia.card_config !== "object" || config.specialists.kia.card_config === null || Array.isArray(config.specialists.kia.card_config)) {
    issues.push(issue("specialists.kia.card_config", "card_config", "Kia-cardconfiguratie moet een object zijn."));
  }

  if (!Number.isInteger(config.diagnostics.stale_after_minutes) || config.diagnostics.stale_after_minutes < 1) {
    issues.push(issue("diagnostics.stale_after_minutes", "range", "De stale-drempel moet minstens één minuut zijn."));
  }
  return issues;
}
