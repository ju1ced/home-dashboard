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
  assert.match(source, /room\.light_entities\.forEach/);
  assert.match(source, /room\.cover_entities\.forEach/);
  assert.match(source, /room\.media_entities\.forEach/);
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
  assert.match(source, /direct-controls/);
  assert.match(source, /room-photo/);
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

test("kamerdetail houdt bediening op de pagina met beveiligde smart plugs en een temperatuurgrafiek", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const types = await readFile(new URL("../src/config/types.ts", import.meta.url), "utf8");

  assert.match(source, /Nu bedienen/);
  assert.match(source, /Open|Stop|Dicht/);
  assert.match(source, /Smart plugs & energie/);
  assert.match(source, /Ontgrendel om te schakelen/);
  assert.match(source, /Temperatuurtrend/);
  assert.match(source, /statistics-graph/);
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
  assert.match(controls, /min-height:44px/);
  assert.match(controls, /button:focus-visible/);
  assert.match(source, /\.command:focus-visible/);
  assert.match(source, /\.plug-lock:focus-visible/);
  assert.match(source, /@media\(max-width:600px\)/);
  assert.match(source, /\.direct-grid,.plug-grid\{grid-template-columns:1fr\}/);
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
