import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  HomeDashboardStrategy,
  HomeDashboardViewStrategy,
  getCameraPresentation,
  getHomeStructureSignature,
  getRoomMetric,
  getWastePresentation,
  migrateConfig,
  roomPath
} from "../dist/home-dashboard.js";

async function normalConfig() {
  const fixture = JSON.parse(await readFile(new URL("../config/examples/normal.json", import.meta.url), "utf8"));
  const config = migrateConfig(fixture).config;
  config.general.start_view = "energy";
  config.today.weather_entity = "weather_primary";
  config.today.waste_entities = ["waste_primary"];
  config.today.battery_soc_entity = "battery_soc_primary";
  config.today.battery_charge_power_entity = "battery_charge_primary";
  config.today.battery_discharge_power_entity = "battery_discharge_primary";
  config.today.solar_power_entity = "solar_power_primary";
  config.today.home_consumption_entity = "home_consumption_primary";
  config.today.monthly_capacity_peak_entity = "monthly_peak_primary";
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

test("dashboardstrategy genereert vijf hoofdviews en stabiele kamer-subviews", async () => {
  const config = await normalConfig();
  const forbiddenHass = new Proxy({}, { get(_target, property) { throw new Error(`Hass call verboden: ${String(property)}`); } });
  const generated = await HomeDashboardStrategy.generate(config, forbiddenHass);
  assert.equal(generated.title, "Home");
  assert.deepEqual(generated.views.map((view) => view.path), ["energy", "home", "rooms", "domains", "more", "room-living-room"]);
  assert.equal(new Set(generated.views.map((view) => view.path)).size, 6);
  assert.ok(generated.views.slice(0, 5).every((view) => view.subview === false && view.strategy.type === "custom:home-dashboard-view"));
  assert.ok(generated.views.slice(5).every((view) => view.subview === true && view.back_path === "rooms" && view.strategy.view === "room"));
  assert.equal(roomPath(config.rooms[0]), "room-living-room");
  assert.doesNotThrow(() => JSON.stringify(generated));
  assert.deepEqual(generated, await HomeDashboardStrategy.generate(config));
});

test("iedere viewstrategy levert native Sections zonder serviceactie", async () => {
  const dashboard = await HomeDashboardStrategy.generate(await normalConfig());
  const allowedCards = new Set(["button", "custom:home-dashboard-home-overview", "custom:home-dashboard-room-detail", "custom:home-dashboard-room-overview", "heading", "history-graph", "markdown", "tile"]);
  for (const view of dashboard.views) {
    const expanded = await HomeDashboardViewStrategy.generate(view.strategy);
    assert.equal(expanded.type, "sections");
    assert.equal(expanded.dense_section_placement, view.path === "home" || view.strategy.view === "room");
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

test("Home levert één samenhangende compositie met volledige context en zes camera's", async () => {
  const config = await normalConfig();
  config.persons[0].show_location = false;
  const dashboard = await HomeDashboardStrategy.generate(config);
  const home = dashboard.views.find((view) => view.path === "home");
  const expanded = await HomeDashboardViewStrategy.generate(home.strategy);
  const overview = expanded.sections[0].cards[0];
  assert.equal(overview.type, "custom:home-dashboard-home-overview");
  assert.equal(overview.theme_mode, config.general.theme_mode);
  assert.equal(overview.security.cameras.length, 6);
  assert.deepEqual(overview.security.cameras.map((camera) => camera.key), config.security.cameras.map((camera) => camera.key));
  assert.deepEqual(overview.today.energy_context_entities, ["power_primary"]);
  assert.equal(overview.today.battery_soc_entity, "battery_soc_primary");
  assert.equal(overview.today.battery_charge_power_entity, "battery_charge_primary");
  assert.equal(overview.today.battery_discharge_power_entity, "battery_discharge_primary");
  assert.equal(overview.today.solar_power_entity, "solar_power_primary");
  assert.equal(overview.today.home_consumption_entity, "home_consumption_primary");
  assert.equal(overview.today.monthly_capacity_peak_entity, "monthly_peak_primary");
  assert.deepEqual(overview.energy.solar_entities, ["solar_primary"]);
  assert.equal(overview.persons[0].show_location, false);
  assert.equal(expanded.sections[0].column_span, expanded.max_columns);
});

test("realtime vermogensupdates wijzigen Home in-place zonder structurele rerender", async () => {
  const config = await normalConfig();
  const first = {
    states: {
      battery_charge_primary: { state: "1200", attributes: { unit_of_measurement: "W" } },
      battery_discharge_primary: { state: "0", attributes: { unit_of_measurement: "W" } },
      safety_primary: { state: "closed" }
    }
  };
  config.rooms[0].safety_entities = ["safety_primary"];
  const second = structuredClone(first);
  second.states.battery_charge_primary.state = "2450";
  assert.equal(getHomeStructureSignature(first, config), getHomeStructureSignature(second, config));
  second.states.safety_primary.state = "open";
  assert.notEqual(getHomeStructureSignature(first, config), getHomeStructureSignature(second, config));
});

test("afvalpresentatie herkent fractie, datum en relatieve ophaaltijd", () => {
  const now = new Date(2026, 7, 24, 12, 0, 0);
  assert.deepEqual(getWastePresentation({ state: "26-08-2026", attributes: { friendly_name: "GFT volgende ophaling" } }, "waste_gft_primary", now), {
    icon: "mdi:food-apple-outline", label: "GFT", date: "wo 26 aug", relative: "Over 2 dagen", tone: "green"
  });
  assert.deepEqual(getWastePresentation({ state: "2026-08-25", attributes: { friendly_name: "Papier en karton" } }, "waste_paper_primary", now), {
    icon: "mdi:file-document-outline", label: "Papier", date: "di 25 aug", relative: "Morgen", tone: "blue"
  });
  const pmd = getWastePresentation({ state: "2026-08-24", attributes: { friendly_name: "PMD" } }, "waste_pmd_primary", now);
  assert.equal(pmd.icon, "mdi:recycle");
  assert.equal(pmd.relative, "Vandaag");
});

test("Kamers gebruikt een overzichtskaart en een semantisch gegroepeerde detail-subview", async () => {
  const config = await normalConfig();
  const dashboard = await HomeDashboardStrategy.generate(config);
  const overviewView = dashboard.views.find((view) => view.path === "rooms");
  const overview = await HomeDashboardViewStrategy.generate(overviewView.strategy);
  const overviewCard = overview.sections[0].cards[0];
  assert.equal(overviewCard.type, "custom:home-dashboard-room-overview");
  assert.deepEqual(overviewCard.rooms.map((room) => room.key), ["living_room"]);

  const detailView = dashboard.views.find((view) => view.path === "room-living-room");
  const detail = await HomeDashboardViewStrategy.generate(detailView.strategy);
  const entities = [];
  walk(detail, (value) => {
    if (typeof value?.entity === "string") entities.push(value.entity);
    if (value?.type === "history-graph" && Array.isArray(value.entities)) entities.push(...value.entities);
  });
  const detailCard = detail.sections[0].cards[0];
  assert.equal(detailCard.type, "custom:home-dashboard-room-detail");
  for (const entity of ["living_lights", "living_hvac", "living_temperature", "living_humidity", "living_media", "living_power", "living_air_quality"]) {
    assert.ok(JSON.stringify(detailCard.room).includes(entity) || entities.includes(entity), `${entity} ontbreekt`);
  }
  assert.ok(detail.sections.some((section) => section.cards.some((card) => card.type === "history-graph")));
  assert.equal(getRoomMetric({ states: { living_lights: { state: "on" } } }, config.rooms[0]), "1 lamp aan");
  assert.equal(getRoomMetric({ states: { living_hvac: { state: "heat", attributes: { current_temperature: 21.5 } } } }, config.rooms[0]), "21.5 °C");
  assert.equal(getRoomMetric({ states: { living_media: { state: "unavailable" } } }, config.rooms[0]), "Deels offline");
});

test("lege en unavailable fixtures blijven renderbaar", async () => {
  for (const name of ["warning", "unavailable"]) {
    const fixture = JSON.parse(await readFile(new URL(`../config/examples/${name}.json`, import.meta.url), "utf8"));
    const fixtureConfig = migrateConfig(fixture).config;
    const dashboard = await HomeDashboardStrategy.generate(fixtureConfig);
    assert.equal(dashboard.views.length, 5 + fixtureConfig.rooms.length);
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

test("camerastrook onderscheidt privacy, beeld en verborgen fallback", () => {
  assert.equal(getCameraPresentation("idle", "on", "placeholder"), "privacy");
  assert.equal(getCameraPresentation("idle", "off", "placeholder"), "camera");
  assert.equal(getCameraPresentation("unavailable", "off", "hidden"), "hidden");
  assert.equal(getCameraPresentation("unknown", undefined, "hidden"), "hidden");
  assert.equal(getCameraPresentation("unavailable", "off", "last_image"), "camera");
});

test("cameracarrousel rendert één beeldbreedte en een compacte privacyrail", async () => {
  const bundle = await readFile(new URL("../dist/home-dashboard.js", import.meta.url), "utf8");
  assert.match(bundle, /flex:0 0 100%/);
  assert.match(bundle, /privacy-rail/);
  assert.match(bundle, /Privacy aan/);
  assert.match(bundle, /minmax\(0,520px\) 150px/);
  assert.doesNotMatch(bundle, /Privacy actief/);
});

test("visuele cards openen alleen het standaard HA-detailvenster", async () => {
  const bundle = await readFile(new URL("../dist/home-dashboard.js", import.meta.url), "utf8");
  assert.match(bundle, /hass-more-info/);
  assert.match(bundle, /Open klimaatbediening/);
  assert.match(bundle, /Samenhangend Home-overzicht/);
  assert.doesNotMatch(bundle, /callService\(/);
  assert.doesNotMatch(bundle, /callWS\(/);
  assert.match(bundle, /home-battery-outline/);
  assert.match(bundle, /waste-relative/);
  assert.doesNotMatch(bundle, /Camera, privacy en alarm in één compacte kolom/);
});

test("onbekende viewconfiguratie krijgt een native foutfallback", async () => {
  const fallback = await HomeDashboardViewStrategy.generate({ type: "custom:home-dashboard-view", view: "future", density: "comfortable" });
  assert.equal(fallback.type, "sections");
  assert.match(fallback.sections[0].cards[0].content, /niet ondersteund/);
});
