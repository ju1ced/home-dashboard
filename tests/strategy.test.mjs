import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  HomeDashboardStrategy,
  HomeDashboardViewStrategy,
  migrateConfig
} from "../dist/home-dashboard.js";

async function normalConfig() {
  const fixture = JSON.parse(await readFile(new URL("../config/examples/normal.json", import.meta.url), "utf8"));
  const config = migrateConfig(fixture).config;
  config.general.start_view = "energy";
  config.today.weather_entity = "weather_primary";
  config.today.waste_entities = ["waste_primary"];
  config.today.energy_context_entities = ["power_primary"];
  config.security.enabled = true;
  config.security.alarm_entity = "alarm_primary";
  config.security.cameras = [1, 2, 3, 4, 5, 6].map((number) => ({
    key: `camera_${number}`,
    name: `Camera ${number}`,
    camera_entity: `camera_${number}`,
    privacy_entity: "",
    privacy_action_key: "",
    fallback: "placeholder",
    confirm_privacy_disable: true
  }));
  config.energy.electricity_entities = ["electricity_primary"];
  config.energy.solar_entities = ["solar_primary"];
  config.energy.water_entities = ["water_primary"];
  return config;
}

function walk(value, visit) {
  visit(value);
  if (Array.isArray(value)) value.forEach((item) => walk(item, visit));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => walk(item, visit));
}

test("dashboardstrategy genereert vijf stabiele hoofdviews met startview eerst", async () => {
  const config = await normalConfig();
  const forbiddenHass = new Proxy({}, { get(_target, property) { throw new Error(`Hass call verboden: ${String(property)}`); } });
  const generated = await HomeDashboardStrategy.generate(config, forbiddenHass);
  assert.equal(generated.title, "Home");
  assert.deepEqual(generated.views.map((view) => view.path), ["energy", "home", "rooms", "domains", "more"]);
  assert.equal(new Set(generated.views.map((view) => view.path)).size, 5);
  assert.ok(generated.views.every((view) => view.subview === false && view.strategy.type === "custom:home-dashboard-view"));
  assert.doesNotThrow(() => JSON.stringify(generated));
  assert.deepEqual(generated, await HomeDashboardStrategy.generate(config));
});

test("iedere viewstrategy levert native Sections zonder serviceactie", async () => {
  const dashboard = await HomeDashboardStrategy.generate(await normalConfig());
  const allowedCards = new Set(["button", "conditional", "markdown", "picture-entity", "tile", "weather-forecast"]);
  for (const view of dashboard.views) {
    const expanded = await HomeDashboardViewStrategy.generate(view.strategy);
    assert.equal(expanded.type, "sections");
    assert.equal(expanded.dense_section_placement, false);
    assert.ok(expanded.sections.length > 0);
    walk(expanded, (value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return;
      if (typeof value.type === "string" && value.type !== "grid" && value.type !== "sections") assert.ok(allowedCards.has(value.type), `onverwacht cardtype ${value.type}`);
      if (Object.hasOwn(value, "action")) assert.ok(["none", "navigate"].includes(value.action), `onveilige actie ${value.action}`);
      if (value.type === "tile") {
        for (const key of ["tap_action", "hold_action", "double_tap_action", "icon_tap_action", "icon_hold_action", "icon_double_tap_action"]) {
          assert.equal(value[key]?.action, "none", `tile mist veilige ${key}`);
        }
      }
      for (const forbidden of ["service", "service_data", "target", "perform_action"]) assert.equal(Object.hasOwn(value, forbidden), false, `verboden sleutel ${forbidden}`);
    });
  }
});

test("Home toont zes camera's en privacyverborgen personen lekken geen state", async () => {
  const config = await normalConfig();
  config.persons[0].show_location = false;
  const dashboard = await HomeDashboardStrategy.generate(config);
  const home = dashboard.views.find((view) => view.path === "home");
  const expanded = await HomeDashboardViewStrategy.generate(home.strategy);
  const cards = expanded.sections.flatMap((section) => section.cards);
  assert.equal(cards.filter((card) => card.type === "picture-entity").length, 6);
  const person = cards.find((card) => card.entity === config.persons[0].entity);
  assert.equal(person.hide_state, true);
  assert.equal(person.tap_action.action, "none");
});

test("lege en unavailable fixtures blijven renderbaar", async () => {
  for (const name of ["warning", "unavailable"]) {
    const fixture = JSON.parse(await readFile(new URL(`../config/examples/${name}.json`, import.meta.url), "utf8"));
    const dashboard = await HomeDashboardStrategy.generate(migrateConfig(fixture).config);
    assert.equal(dashboard.views.length, 5);
    for (const view of dashboard.views) {
      assert.doesNotThrow(() => JSON.stringify(view));
      await assert.doesNotReject(() => HomeDashboardViewStrategy.generate(view.strategy));
    }
  }
  const missing = JSON.parse(await readFile(new URL("../config/examples/missing.json", import.meta.url), "utf8"));
  const blocked = await HomeDashboardStrategy.generate(migrateConfig(missing).config);
  assert.equal(blocked.views.length, 1);
  assert.match(blocked.views[0].sections[0].cards[0].content, /configuratiefout/);
  assert.deepEqual(HomeDashboardStrategy.registryDependencies, []);
  assert.deepEqual(HomeDashboardViewStrategy.registryDependencies, []);
});

test("camerafallbacks behouden beeld of verbergen alleen bij onbeschikbaarheid", async () => {
  const config = await normalConfig();
  config.security.cameras = ["placeholder", "last_image", "hidden"].map((fallback, index) => ({
    key: `camera_${index + 1}`, name: `Camera ${index + 1}`, camera_entity: `camera_${index + 1}`,
    privacy_entity: "", privacy_action_key: "", fallback, confirm_privacy_disable: true
  }));
  const dashboard = await HomeDashboardStrategy.generate(config);
  const home = dashboard.views.find((view) => view.path === "home");
  const expanded = await HomeDashboardViewStrategy.generate(home.strategy);
  const security = expanded.sections.find((candidate) => candidate.title === "Beveiliging & privacy");
  assert.equal(security.cards.filter((card) => card.type === "picture-entity").length, 2);
  const hidden = security.cards.find((card) => card.type === "conditional");
  assert.equal(hidden.card.type, "picture-entity");
  assert.deepEqual(hidden.conditions.map((condition) => condition.state_not), ["unavailable", "unknown"]);
});

test("onbekende viewconfiguratie krijgt een native foutfallback", async () => {
  const fallback = await HomeDashboardViewStrategy.generate({ type: "custom:home-dashboard-view", view: "future", density: "comfortable" });
  assert.equal(fallback.type, "sections");
  assert.match(fallback.sections[0].cards[0].content, /niet ondersteund/);
});
