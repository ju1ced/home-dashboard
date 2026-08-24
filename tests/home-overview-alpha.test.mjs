import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getHomeStructureSignature, migrateConfig } from "../dist/home-dashboard.js";

async function homeConfig() {
  const fixture = JSON.parse(await readFile(new URL("../config/examples/normal.json", import.meta.url), "utf8"));
  const config = migrateConfig(fixture).config;
  config.rooms[0].safety_entities = ["safety_primary"];
  config.rooms[0].media_entities = ["media_primary"];
  config.rooms[0].light_entities = ["light_primary"];
  config.diagnostics.operational_entities = ["operational_primary"];
  return config;
}

test("Home structureert alleen wijzigingen in aandacht en actuele activiteit opnieuw", async () => {
  const config = await homeConfig();
  const normal = { states: {
    safety_primary: { state: "closed" }, media_primary: { state: "idle" }, light_primary: { state: "off" },
    operational_primary: { state: "ok" }, battery_charge_primary: { state: "100", attributes: { unit_of_measurement: "W" } }
  } };
  const kpiUpdate = structuredClone(normal);
  kpiUpdate.states.battery_charge_primary.state = "2200";
  assert.equal(getHomeStructureSignature(normal, config), getHomeStructureSignature(kpiUpdate, config));

  const active = structuredClone(normal);
  active.states.media_primary.state = "playing";
  assert.notEqual(getHomeStructureSignature(normal, config), getHomeStructureSignature(active, config));

  const warning = structuredClone(normal);
  warning.states.safety_primary.state = "open";
  const critical = structuredClone(warning);
  critical.states.safety_primary.state = "unsafe";
  assert.notEqual(getHomeStructureSignature(normal, config), getHomeStructureSignature(warning, config));
  assert.notEqual(getHomeStructureSignature(warning, config), getHomeStructureSignature(critical, config));

  const unavailable = structuredClone(normal);
  unavailable.states.operational_primary.state = "unavailable";
  assert.notEqual(getHomeStructureSignature(normal, config), getHomeStructureSignature(unavailable, config));
});

test("Home alpha bevat betekenisvolle, toegankelijke read-only presentaties", async () => {
  const bundle = await readFile(new URL("../dist/home-dashboard.js", import.meta.url), "utf8");
  for (const contract of [
    "Nu actief", "Kamers in beeld", "Niet recent", "Bron ontbreekt", "Controleer bron",
    "priority-critical", "metric-meta", "activity-card", "room-highlight", "Andere locatie", "Batterij "
  ]) assert.match(bundle, new RegExp(contract));
  assert.doesNotMatch(bundle, /callService\(/);
  assert.doesNotMatch(bundle, /perform_action/);
});
