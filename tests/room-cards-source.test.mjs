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
  assert.match(source, /device\.label/);
  assert.match(source, /device\.value/);
  assert.match(source, /Open \$\{device\.label\}: \$\{device\.value\}/);
  assert.doesNotMatch(source, /chip\.textContent = device\.label/);
});

test("kamerdetail heeft herkenbare capabilityblokken met veilige HA-detailbediening", async () => {
  const source = await readFile(sourceUrl, "utf8");
  for (const title of [
    "Verlichting",
    "Covers & openingen",
    "Comfort & klimaat",
    "Media",
    "Veiligheid",
    "Camera's",
    "Apparaten & energie",
    "Historie"
  ]) assert.ok(source.includes(title), `${title} ontbreekt`);
  assert.match(source, /hass-more-info/);
  assert.match(source, /Niet gevonden/);
  assert.match(source, /Niet beschikbaar/);
  assert.doesNotMatch(source, /callService\(/);
  assert.doesNotMatch(source, /callWS\(/);
});

test("roominteracties hebben touch-, focus- en mobiele disclosurecontracten", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /\.chip\{[^}]*min-height:44px/);
  assert.match(source, /\.chip:focus-visible/);
  assert.match(source, /\.entity:focus-visible/);
  assert.match(source, /\.status:focus-visible/);
  assert.match(source, /document\.createElement\(progressive \? "details" : "section"\)/);
  assert.match(source, /matchMedia\?\.\("\(max-width: 600px\)"\)/);
  assert.match(source, /room\.safety_entities, \.\.\.room\.hvac\.comfort_entities/);
});
