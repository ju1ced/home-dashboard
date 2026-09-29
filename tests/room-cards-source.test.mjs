import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceUrl = new URL("../src/cards/home-dashboard-room-cards.ts", import.meta.url);

test("kameroverzicht toont concrete, state-aware apparaatpresentaties", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /friendlyName\(state, roleFallback\(role, index\)\)/);
  assert.match(source, /brightness/);
  assert.match(source, /current_position/);
  assert.match(source, /media_title/);

  assert.doesNotMatch(source, /chip\.textContent = device\.label/);
});

test("kamerdetail houdt directe bediening begrensd tot expliciete kamerdoelen", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /room\.light_switch_entities \?\? \[\]/);
  assert.match(source, /room\.cover_entities\.filter/);
  assert.match(source, /room\.media_entities\.map/);
  assert.match(source, /actionable\(/);
  assert.match(source, /Niet gevonden/);
  assert.match(source, /Niet beschikbaar/);
  assert.doesNotMatch(source, /homeLink\.href/);
  assert.doesNotMatch(source, /max-width:1180px/);
  assert.match(source, /callService\(/);
  assert.doesNotMatch(source, /callWS\(/);
});

test("kamerdetail maakt bediening en kernstatus onmiddellijk scanbaar", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /hero-pills/);
  assert.match(source, /room-layout-primary/);
  assert.match(source, /room-column/);
  assert.match(source, /mushroom-grid/);
  assert.match(source, /room-photo/);
});

test("kamerdetail gebruikt de capability-gedreven Control Deck-compositie waarbij de rail de stage isoleert", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /control-deck/);
  assert.match(source, /capability-rail/);
  assert.match(source, /detail-tabs/);
  assert.match(source, /role", "tablist"/);
  assert.match(source, /aria-selected/);
  assert.match(source, /selectedCapability/);
  assert.match(source, /capability:/);
  assert.match(source, /element\("div", "stage"\)/);
  for (const label of ["Apparaten", "Energie", "Historie"]) {
    assert.ok(source.includes(label), `${label} ontbreekt`);
  }
  assert.doesNotMatch(source, /\["controls", "Bediening"\]/, "de Bediening-tab moet verwijderd zijn ten voordele van de rail-stages");
});

test("kamerdetail gebruikt afzonderlijke mushroom-achtige capabilitykaarten", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /mushroom-grid/);
  assert.match(source, /mushroom-card/);
  assert.match(source, /light-card/);
  assert.match(source, /mushroomCard\(entity, "cover"/);
  assert.match(source, /mushroomCard\(room\.hvac\.entity, "climate"/);
  assert.match(source, /smart-plug-card/);
  assert.match(source, /history-dialog/);
  assert.doesNotMatch(source, /Nu bedienen/);
});

test("kamerverlichting accepteert expliciete switch-opties", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const types = await readFile(new URL("../src/config/types.ts", import.meta.url), "utf8");
  const editor = await readFile(new URL("../src/editor/home-dashboard-editor.ts", import.meta.url), "utf8");
  const schema = await readFile(new URL("../schemas/config.schema.json", import.meta.url), "utf8");
  assert.match(types, /light_switch_entities/);
  assert.match(editor, /light_switch_entities/);
  assert.match(schema, /light_switch_entities/);
  assert.match(source, /room\.light_switch_entities/);
  assert.match(source, /planEntityControl/);
});

test("Control Deck rendert expliciete lichtgroepen en getypeerde openingen", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /room\.light_groups/);
  assert.match(source, /resolveLightGroupState/);
  assert.match(source, /member_entities/);
  assert.match(source, /state === "unknown" \|\| state === "unavailable"/);
  assert.match(source, /room\.cover_controls/);
  assert.match(source, /Uit/);
  assert.match(source, /In/);
  assert.match(source, /coverConfig\.confirmation === "movement" \|\| coverConfig\.kind === "awning"/, "luifels moeten altijd bevestiging vereisen, ongeacht de geconfigureerde confirmation");
});

test("v3-rail: verlichtingsstage toont dimslider per lamp en onderscheidt actieve/gedeeltelijke groepen", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /type = "range"/);
  assert.match(source, /set_brightness/);
  assert.match(source, /brightness_pct/);
  assert.match(source, /range-row/);
  assert.match(source, /state === "on" \? "active" : state === "partial" \? "mixed" : state/, "lichtgroepen moeten actief/gedeeltelijk/uit visueel onderscheiden");
});

test("v3-rail: openingen- en plugsstage tonen een samenvattingsstrip en positie-/verbruiksdetails", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /summary-strip/);
  assert.match(source, /summary-metric/);
  assert.match(source, /position-track/);
  assert.match(source, /position-fill/);
  assert.match(source, /plug-metrics/);
  assert.match(source, /plug-metric/);
  assert.match(source, /comfort-grid/);
});

test("v3-rail: verbruikstage hergebruikt de bestaande energyPeriodGroup in plaats van een eigen totaalberekening", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const energyStageMatch = source.match(/private energyStage\(room: RoomConfig\): HTMLElement \{[\s\S]*?\n  \}/);
  assert.ok(energyStageMatch, "energyStage methode niet gevonden");
  const energyStageBody = energyStageMatch[0];
  assert.match(energyStageBody, /this\.energyPeriodGroup\(room\)/, "energyStage moet de bestaande energyPeriodGroup hergebruiken");
  assert.doesNotMatch(energyStageBody, /sumPlugPeriod/, "energyStage mag geen eigen periodetotaal meer optellen");
  assert.doesNotMatch(energyStageBody, /Volledige verbruiksgrafiek per dag volgt in een latere update\./, "de placeholdertekst is vervangen door de echte energyPeriodGroup-content");
});

test("Control Deck toont beschermde plugs en afzonderlijke dag-, maand- en jaarbronnen", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /plug\.protected/);
  assert.match(source, /protection_reason/);
  assert.match(source, /energy_day_entity/);
  assert.match(source, /energy_month_entity/);
  assert.match(source, /energy_year_entity/);
  assert.match(source, /Vandaag/);
  assert.match(source, /Maand/);
  assert.match(source, /Jaar/);
});

test("kamereditor biedt verlichtingsswitches ook als direct kiesbaar doel", async () => {
  const editor = await readFile(new URL("../src/editor/home-dashboard-editor.ts", import.meta.url), "utf8");
  assert.match(editor, /domain: \["light", "switch", "cover", "media_player", "climate"\]/);
});

test("Control Deck-editor dekt alle plugmetingen en privacyveilige afbeeldingen", async () => {
  const editor = await readFile(new URL("../src/editor/home-dashboard-editor.ts", import.meta.url), "utf8");
  const fields = await readFile(new URL("../src/editor/fields.ts", import.meta.url), "utf8");
  assert.match(editor, /itemIndex, "energy_entity"/);
  assert.match(editor, /itemIndex, "voltage_entity"/);
  assert.match(editor, /domain: "image"/);
  assert.match(fields, /rooms\[\]\.smart_plugs\[\]/);
  assert.match(fields, /rooms\[\]\.room_energy/);
});

test("kamerdetail behoudt niet-bedienbare kamerbronnen als zichtbare status", async () => {
  const source = await readFile(sourceUrl, "utf8");
  for (const title of ["Comfort & klimaat", "Veiligheid", "Camera's", "Apparaten & energie", "Historie"]) {
    assert.ok(source.includes(title), `${title} ontbreekt`);
  }
  assert.match(source, /room\.hvac\.comfort_entities/);
  assert.match(source, /room\.safety_entities/);
  assert.match(source, /room\.camera_entities/);
  assert.match(source, /room\.power_entities/);
  assert.match(source, /room\.history_entities/);
});

test("kamerdetail houdt bediening op de pagina met beveiligde smart plugs en een historiedialoog", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const types = await readFile(new URL("../src/config/types.ts", import.meta.url), "utf8");

  assert.match(source, /mushroom-card/);
  assert.match(source, /Open|Stop|Dicht/);
  assert.match(source, /Smart plugs & energie/);
  assert.match(source, /Ontgrendel om te schakelen/);
  assert.match(source, /temperature_history_entity/);
  assert.match(source, /history-graph/);
  assert.match(source, /room\.image_entity/);
  assert.match(source, /linak-desk-card/);
  assert.match(source, /\.\.\.room\.desk\.card_config, type: "custom:linak-desk-card"/);
  assert.match(source, /callService\(/);

  assert.match(types, /smart_plugs/);
  assert.match(types, /temperature_history_entity/);
  assert.match(types, /image_entity/);
  assert.match(types, /desk/);
});

test("roominteracties hebben touch-, focus- en mobiele contracts", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const controls = await readFile(new URL("../src/cards/home-dashboard-room-controls.ts", import.meta.url), "utf8");
  const cameras = await readFile(new URL("../src/cards/home-dashboard-camera-strip.ts", import.meta.url), "utf8");
  const editor = await readFile(new URL("../src/editor/home-dashboard-editor.ts", import.meta.url), "utf8");
  assert.match(controls, /min-height:44px/);
  assert.match(controls, /button:focus-visible/);
  assert.match(controls, /prefers-reduced-motion:reduce/);
  assert.match(cameras, /min-width:44px;min-height:44px/);
  assert.match(cameras, /\.controls\{display:flex;gap:8px\}/);
  assert.match(cameras, /prefers-reduced-motion: reduce/);
  assert.match(editor, /\.toolbar label,\.toolbar button\{[^}]*min-height:44px/);
  assert.match(editor, /\.item button\{[^}]*min-width:44px;min-height:44px/);
  assert.match(editor, /\.section-footer button\{[^}]*min-height:44px/);
  assert.match(source, /button:focus-visible/);
  assert.match(source, /button:disabled\{[^}]*opacity:/);
  assert.match(source, /min-height:44px/);
  assert.match(source, /@media\(max-width:600px\)/);
  assert.match(source, /\.mushroom-grid,.plug-grid\{grid-template-columns:1fr\}/);
  assert.match(source, /aria-label/);
  assert.match(source, /Bevestig/);
});

test("kameracties gebruiken korte namen, entiteitsiconen en duidelijke actieve types", async () => {
  const controls = await readFile(new URL("../src/cards/home-dashboard-room-controls.ts", import.meta.url), "utf8");
  const editor = await readFile(new URL("../src/editor/home-dashboard-editor.ts", import.meta.url), "utf8");
  assert.match(controls, /function shortName/);
  assert.match(controls, /attributes\?\.icon/);
  assert.match(controls, /kind-\$\{kind\}/);
  assert.match(controls, /box-shadow:inset 4px 0 var\(--control-accent\)/);
  assert.match(editor, /data-room-control-move/);
  assert.match(editor, /data-room-control-apply/);
  assert.match(editor, /moveRoomControlDraft/);
});
