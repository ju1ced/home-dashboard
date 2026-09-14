import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getHomeStructureSignature, migrateConfig } from "../dist/home-dashboard.js";

async function homeConfig() {
  const fixture = JSON.parse(await readFile(new URL("../config/examples/normal.json", import.meta.url), "utf8"));
  const config = migrateConfig(fixture).config;
  config.rooms[0].safety_entities = ["safety_primary"];
  config.diagnostics.operational_entities = ["operational_primary"];
  return config;
}

test("Home structureert alleen wijzigingen in aandacht en actuele activiteit opnieuw", async () => {
  const config = await homeConfig();
  const normal = { states: {
    safety_primary: { state: "closed" },
    operational_primary: { state: "ok" }, battery_charge_primary: { state: "100", attributes: { unit_of_measurement: "W" } }
  } };
  const kpiUpdate = structuredClone(normal);
  kpiUpdate.states.battery_charge_primary.state = "2200";
  assert.equal(getHomeStructureSignature(normal, config), getHomeStructureSignature(kpiUpdate, config));

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

test("Home behoudt aandacht en expliciete kamerbediening zonder dubbele activiteitensectie", async () => {
  const bundle = await readFile(new URL("../dist/home-dashboard.js", import.meta.url), "utf8");
  for (const contract of [
    "Kamers & bediening", "Alle kamers", "Bron ontbreekt", "Controleer bron",
    "priority-critical", "metric-meta", "today-navigation", "specialist-link", "nav-copy", "Schoonmaak", "Werkplaats", "Andere locatie", "Batterij "
  ]) assert.match(bundle, new RegExp(contract));
  assert.doesNotMatch(bundle, /Nu actief|activity-card/);
  assert.match(bundle, /callService\(/);
  assert.doesNotMatch(bundle, /perform_action/);
});

test("Home-header sluit naadloos aan op de navigatiebalk, ongeacht de echte HA sections-rijafstand", async () => {
  const bundle = await readFile(new URL("../dist/home-dashboard.js", import.meta.url), "utf8");
  // Live HA gebruikt --ha-view-sections-row-gap (standaard 24px) tussen top-level
  // sections, niet een vast getal. Een hardgecodeerde margin-top liet in de praktijk
  // een zichtbare lijn tussen navigatie en header (zie v0.8.0-alpha.12-melding).
  assert.match(bundle, /--ha-view-sections-row-gap/);
  assert.doesNotMatch(bundle, /margin-top:-16px/);
});
