import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  EDITOR_COVERAGE,
  EDITOR_SECTION_KEYS,
  HomeDashboardStrategy,
  HomeDashboardStrategyEditor,
  compileConfig,
  createDefaultConfig,
  getEditorItemToken,
  getEditorSectionForKey,
  mergeEditorIssues,
  migrateConfig,
  parseImportedConfig,
  serializeConfig,
  validateConfig,
  validateConfigSchema
} from "../dist/home-dashboard.js";

async function fixture(name) {
  return JSON.parse(await readFile(new URL(`../config/examples/${name}.json`, import.meta.url), "utf8"));
}

function schemaPathExists(schema, path) {
  const normalized = path.replaceAll("[]", "");
  let current = schema;
  for (const segment of normalized.split(".")) {
    current = current.properties?.[segment];
    if (!current) return false;
    if (current.type === "array") current = current.items ?? current;
  }
  return true;
}

function collectUnannotatedLeaves(node, path = "") {
  if (node.properties) {
    return Object.entries(node.properties).flatMap(([key, child]) => collectUnannotatedLeaves(child, path ? `${path}.${key}` : key));
  }
  if (node.type === "array" && node.items?.properties) return collectUnannotatedLeaves(node.items, `${path}[]`);
  return node["x-editor"] ? [] : [path];
}

test("defaults zijn een geldige schema-v1-configuratie", () => {
  const config = createDefaultConfig();
  assert.equal(config.type, "custom:home-dashboard");
  assert.equal(config.schema_version, 1);
  assert.deepEqual(validateConfig(config), []);
  assert.deepEqual(validateConfigSchema(config), []);
});

test("normal fixture migreert, valideert en compileert zonder private waarden in manifest", async () => {
  const privateReference = ["camera", "private_entry"].join(".");
  const input = await fixture("normal");
  input.today = { weather_entity: privateReference };
  const config = migrateConfig(input).config;
  assert.equal(validateConfig(config).filter((issue) => issue.severity === "error").length, 0);
  const result = compileConfig(config);
  assert.equal(result.manifest.counts.rooms, 1);
  assert.equal(JSON.stringify(result.manifest).includes(privateReference), false);
});

test("warning, missing en unavailable fixtures behouden hun bedoelde semantiek", async () => {
  const warning = validateConfig(migrateConfig(await fixture("warning")).config);
  assert.ok(warning.some((issue) => issue.severity === "warning" && issue.code === "version_recommended"));

  const missing = validateConfig(migrateConfig(await fixture("missing")).config);
  assert.ok(missing.some((issue) => issue.severity === "error" && issue.code === "camera_required"));

  const unavailable = migrateConfig(await fixture("unavailable")).config;
  assert.equal(unavailable.diagnostics.unavailable_policy, "operational_only");
  assert.equal(validateConfig(unavailable).length, 0);
});

test("Security accepteert ieder positief aantal camera's", () => {
  for (const count of [1, 2, 3, 6]) {
    const config = createDefaultConfig();
    config.security.enabled = true;
    config.security.alarm_entity = "alarm_primary";
    config.security.cameras = Array.from({ length: count }, (_, index) => ({
      key: `camera_${index + 1}`,
      name: `Camera ${index + 1}`,
      camera_entity: `camera_${index + 1}`,
      privacy_entity: "",
      privacy_action_key: "",
      fallback: "placeholder",
      confirm_privacy_disable: true
    }));
    assert.deepEqual(validateConfigSchema(config), [], `${count} camera's moeten in het schema passen`);
    assert.equal(validateConfig(config).filter((issue) => issue.severity === "error").length, 0, `${count} camera's moeten semantisch geldig zijn`);
  }

  const disabled = createDefaultConfig();
  assert.equal(validateConfig(disabled).some((issue) => issue.code === "camera_required"), false);

  const enabled = createDefaultConfig();
  enabled.security.enabled = true;
  assert.equal(validateConfig(enabled).some((issue) => issue.code === "camera_required"), true);
  assert.ok(validateConfigSchema(enabled).some((issue) => issue.path === "security" && issue.code === "schema_any_of"));
});

test("privacystatus en gekoppelde bediening laten risicoklasse en extra bevestiging vrij", () => {
  const config = createDefaultConfig();
  config.security.enabled = true;
  config.security.cameras.push({
    key: "camera_primary", name: "Camera", camera_entity: "camera_primary", privacy_entity: "privacy_primary",
    privacy_action_key: "", fallback: "placeholder", confirm_privacy_disable: false
  });
  assert.deepEqual(validateConfigSchema(config), []);
  assert.equal(validateConfig(config).filter((issue) => issue.severity === "error").length, 0);

  config.actions.push({
    key: "privacy_toggle", label: "Privacy", sequence: [{ action: "switch.toggle", target: { entity_id: "privacy_primary" } }],
    risk: "safe", confirmation_text: "", hold_required: false, verification_entity: "privacy_primary"
  });

  config.security.cameras[0].privacy_action_key = "privacy_toggle";
  assert.deepEqual(validateConfigSchema(config), []);
  assert.equal(validateConfig(config).filter((issue) => issue.severity === "error").length, 0);

  config.security.cameras[0].confirm_privacy_disable = true;
  assert.deepEqual(validateConfigSchema(config), []);
  assert.equal(validateConfig(config).filter((issue) => issue.severity === "error").length, 0);
});

test("editor verbergt generieke anyOf-ruis wanneer een precieze fout bestaat", () => {
  const schemaIssues = [{ path: "security.cameras[0]", code: "schema_any_of", message: "Generiek", severity: "error" }];
  const semanticIssues = [{ path: "security.cameras[0].privacy_action_key", code: "required", message: "Kies een privacyactie", severity: "error" }];
  assert.deepEqual(mergeEditorIssues(schemaIssues, semanticIssues), semanticIssues);
  assert.deepEqual(mergeEditorIssues(schemaIssues, []), schemaIssues);
});

test("export en import hebben een verliesvrije schema-v1-roundtrip", async () => {
  const original = migrateConfig(await fixture("normal")).config;
  const imported = parseImportedConfig(serializeConfig(original));
  assert.deepEqual(imported, original);
});

test("toekomstige schema's worden niet stilzwijgend teruggeschreven", () => {
  assert.throws(() => migrateConfig({ schema_version: 99 }), /nieuwer dan ondersteund/);
  assert.throws(() => migrateConfig({ schema_version: "99" }), /Ongeldige schema_version/);
  const editor = new HomeDashboardStrategyEditor();
  editor.setConfig({ type: "custom:home-dashboard", schema_version: 99 });
  assert.equal(editor.configBlocked, true);
});

test("malformed collectie-items crashen import niet en blijven geblokkeerd", () => {
  const migrated = migrateConfig({ type: "custom:home-dashboard", schema_version: 1, persons: [null] });
  assert.ok(migrated.warnings.some((warning) => warning.includes("persons[0]")));
  assert.ok(validateConfig(migrated.config).some((issue) => issue.path === "persons[0].entity"));
});

test("onbekende enumwaarden worden door runtimevalidatie geweigerd", () => {
  const config = createDefaultConfig();
  config.general.language = "xx";
  assert.ok(validateConfig(config).some((issue) => issue.path === "general.language" && issue.code === "enum"));
});

test("runtime JSON Schema weigert decimalen en dubbele referenties", () => {
  const decimal = createDefaultConfig();
  decimal.today.forecast_days = 1.5;
  assert.throws(() => parseImportedConfig(serializeConfig(decimal)), /geheel getal/);

  const duplicate = createDefaultConfig();
  duplicate.today.waste_entities = ["waste_primary", "waste_primary"];
  assert.throws(() => parseImportedConfig(serializeConfig(duplicate)), /Dubbele lijstitems/);
});

test("area-loze room met expliciet device is in schema en semantiek geldig", () => {
  const config = createDefaultConfig();
  config.rooms.push({
    key: "utility_room", name: "Techniek", icon: "mdi:server", floor_id: "", area_id: "", device_ids: ["device_primary"],
    capabilities: ["power"], quick_actions: [], light_entities: [], cover_entities: [], media_entities: [], safety_entities: [], camera_entities: [],
    power_entities: [], history_entities: [], hvac: { entity: "", comfort_entities: [], history_entities: [], modes: [], presets: [], fan_modes: [], swing_modes: [] }
  });
  assert.deepEqual(validateConfigSchema(config), []);
  assert.equal(validateConfig(config).filter((issue) => issue.severity === "error").length, 0);
});

test("native service-action zonder target en verificatie wordt geblokkeerd", () => {
  const config = createDefaultConfig();
  config.actions.push({ key: "unsafe_action", label: "Test", sequence: [{ action: "light.toggle" }], risk: "safe", confirmation_text: "", hold_required: false, verification_entity: "" });
  const codes = validateConfig(config).map((issue) => issue.code);
  assert.ok(codes.includes("target_required"));
  assert.ok(codes.includes("verification_required"));

  config.actions[0].sequence = [{ action: "light.toggle", target: {} }];
  assert.ok(validateConfig(config).some((issue) => issue.code === "target_required"));

  config.actions[0].sequence = [{ action: "light.toggle", target: { entity_id: [] } }];
  assert.ok(validateConfig(config).some((issue) => issue.code === "target_required"));
});

test("strategy maakt vijf echte views en behoudt veilige foutpreviews", async () => {
  assert.equal(HomeDashboardStrategy.configRequired, true);
  assert.deepEqual(HomeDashboardStrategy.getCreateSuggestions(), { title: "Home Dashboard", icon: "mdi:home-assistant" });
  const generated = await HomeDashboardStrategy.generate(createDefaultConfig());
  assert.equal(generated.views.length, 5);
  assert.deepEqual(generated.views.map((view) => view.path), ["home", "rooms", "energy", "domains", "more"]);
  assert.ok(generated.views.every((view) => view.strategy?.type === "custom:home-dashboard-view"));

  const duplicate = createDefaultConfig();
  duplicate.today.waste_entities = ["waste_primary", "waste_primary"];
  const invalid = await HomeDashboardStrategy.generate(duplicate);
  assert.match(invalid.views[0].sections[0].cards[0].content, /configuratiefout/);

  const future = await HomeDashboardStrategy.generate({ type: "custom:home-dashboard", schema_version: 99 });
  assert.match(future.views[0].sections[0].cards[0].content, /geblokkeerd/);
});

test("editorbundle bevat ordering, focus- en live-feedbackcontracten", async () => {
  const bundle = await readFile(new URL("../dist/home-dashboard.js", import.meta.url), "utf8");
  for (const marker of ["data-room-move", "data-view-move", "data-section-nav", "data-section-step", "data-go-section", "Privacybediening is optioneel", "Laat Privacyactie op Geen", "risico:", "role=\"tabpanel\"", "queueMicrotask", "aria-live", "config-changed", "home-dashboard-strategy-editor"]) assert.match(bundle, new RegExp(marker));
});

test("editornavigatie en open itemtokens overleven HA-configroundtrips", () => {
  const room = { key: "living_room" };
  const roundTrip = JSON.parse(JSON.stringify(room));
  assert.equal(getEditorItemToken("rooms", room, 0), getEditorItemToken("rooms", roundTrip, 0));
  assert.equal(getEditorItemToken("rooms", {}, 3), "rooms:#3");
  assert.equal(EDITOR_SECTION_KEYS.length, 10);
  assert.equal(getEditorSectionForKey("persons", "ArrowRight"), "security");
  assert.equal(getEditorSectionForKey("security", "ArrowLeft"), "persons");
  assert.equal(getEditorSectionForKey("diagnostics", "Home"), "general");
  assert.equal(getEditorSectionForKey("general", "End"), "diagnostics");
});

test("JSON Schema en editorcontract dekken dezelfde configuratieoppervlakte", async () => {
  const schema = JSON.parse(await readFile(new URL("../schemas/config.schema.json", import.meta.url), "utf8"));
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.required, ["type", "schema_version", "general", "today", "persons", "security", "rooms", "energy", "actions", "specialists", "layout", "diagnostics"]);
  const paths = [...EDITOR_COVERAGE.scalar, ...EDITOR_COVERAGE.collections, ...EDITOR_COVERAGE.collection_fields, ...EDITOR_COVERAGE.specialist, ...EDITOR_COVERAGE.ordered];
  assert.equal(new Set(paths).size, paths.length);
  for (const path of paths) assert.equal(schemaPathExists(schema, path), true, `schema mist editorpad ${path}`);
  assert.deepEqual(collectUnannotatedLeaves(schema), [], "ieder configsleutelblad moet een GUI/system annotation hebben");
});
