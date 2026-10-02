import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceUrl = new URL("../src/cards/home-dashboard-room-cards.ts", import.meta.url);

test("HD-209 kamerfoto: image_upload resolutie heeft prioriteit boven image_entity en valt veilig terug", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const types = await readFile(new URL("../src/config/types.ts", import.meta.url), "utf8");

  // Resolutie via de standaard media_source/resolve_media WebSocket-call, nooit callWS of een eigen backend.
  assert.match(source, /media_source\/resolve_media/);
  assert.match(source, /sendMessagePromise/);
  assert.doesNotMatch(source, /callWS\(/);

  // Prioriteit: eerst een opgeloste image_upload-URL, dan image_entity's entity_picture, anders de HD-206 placeholder.
  assert.match(source, /mediaContentId\s*&&\s*this\.photoCache\.get\(mediaContentId\)\)\s*\|\|\s*\(room\.image_entity/);
  assert.match(source, /Kamerfoto niet beschikbaar/);
  assert.match(source, /Geen kamerfoto geconfigureerd/);

  // Resolutie faalt stil (geen throw); een succesvolle URL wordt gecachet per media_content_id voor de
  // levensduur van het component, maar een ontbrekende connectie of afwijzing wordt NIET gecachet zodat
  // een latere render/hass-toewijzing (bv. na een HA-herstart) een echte nieuwe poging kan doen.
  assert.match(source, /\.then\(\(response\) => \(response as \{ url\?: unknown \} \| undefined\)\?\.url, \(\) => undefined\)/);
  assert.match(source, /photoCache = new Map/);
  assert.match(source, /photoInFlight = new Set/);
  assert.doesNotMatch(source, /photoCache\.set\(mediaContentId, undefined\)/, "een ontbrekende/afgewezen resolutie mag niet permanent als resultaat gecachet worden");

  // setConfig() rendert synchroon voordat Lovelace `hass` toewijst; de hass-setter moet een echte
  // retry triggeren zodra een connectie beschikbaar komt, niet alleen wanneer de state-signature wijzigt.
  assert.match(source, /if \(this\.config\?\.room\) \{\s*this\.loadRoomPhoto\(this\.config\.room\);/);

  assert.match(types, /image_upload\?:\s*\{\s*media_content_id:\s*string;\s*media_content_type:\s*string\s*\}/);
});

test("HD-209 kamerfoto: aria-hidden wordt correct getoggeld in beide richtingen", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const paintPhotoMatch = source.match(/private paintPhoto\(photo: HTMLElement, room: RoomConfig\): void \{[\s\S]*?\n  \}/);
  assert.ok(paintPhotoMatch, "paintPhoto methode niet gevonden");
  const body = paintPhotoMatch[0];
  // Opgeloste/beschikbare foto: aria-hidden moet expliciet verwijderd worden, anders blijft een element
  // met zowel role="img"/aria-label als aria-hidden="true" volledig verborgen voor assistive technology.
  assert.match(body, /photo\.removeAttribute\("aria-hidden"\);\s*\n\s*photo\.setAttribute\("role", "img"\)/);
  // Placeholder: role/aria-label worden verwijderd en aria-hidden wordt (opnieuw) gezet.
  assert.match(body, /photo\.removeAttribute\("role"\);/);
  assert.match(body, /photo\.removeAttribute\("aria-label"\);/);
  assert.match(body, /photo\.setAttribute\("aria-hidden", "true"\);/);
});

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
  assert.match(source, /historyPanel\(room\)/);
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

test("kamerdetail houdt bediening op de pagina met beveiligde smart plugs en echte HD-205 historie-WS-calls", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const types = await readFile(new URL("../src/config/types.ts", import.meta.url), "utf8");

  assert.match(source, /mushroom-card/);
  assert.match(source, /Open|Stop|Dicht/);
  assert.match(source, /Smart plugs & energie/);
  assert.match(source, /Ontgrendel om te schakelen/);
  assert.match(source, /temperature_history_entity/);
  assert.match(source, /history\/history_during_period/);
  assert.match(source, /logbook\/get_events/);
  assert.match(source, /recorder\/statistics_during_period/);
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

test("HD-206: deck-head toont een niet-gefabriceerde telling boven de rail", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /"section-heading deck-head"/);
  assert.match(source, /individuele bediening/);
  assert.match(source, /individualLightEntities\(room\)\.length/);
  assert.match(source, /countParts\.push/);
  assert.match(source, /lightCount > 0/);
  assert.match(source, /coverCount > 0/);
  assert.match(source, /plugCount > 0/);
});

test("HD-206: elke stage krijgt een gedeelde stageHead met eyebrow en een op echte status gebaseerde badge met drie tonen", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /private stageHead\(room: RoomConfig, key: RoomCapabilityStage, title: string\)/);
  assert.match(source, /capabilityEntityRoles\(room, key\)/);
  assert.match(source, /if \(!entityRoles\.length\) return \[head\];/);
  assert.match(source, /!actionable\(state\)/);
  assert.match(source, /deviceTone\(state, role\) === "warning"/);
  assert.match(source, /Deels niet beschikbaar/);
  assert.match(source, /"Aandacht"/);
  assert.match(source, /Beschikbaar/);
  assert.match(source, /this\.stageHead\(room, this\.selectedCapability, activeLabel\)/);
  // The dispatcher prepends the shared head; the five stage bodies never call it themselves.
  const lightingStageMatch = source.match(/private lightingStage\(room: RoomConfig\): HTMLElement \{[\s\S]*?\n  \}/);
  assert.ok(lightingStageMatch, "lightingStage methode niet gevonden");
  assert.doesNotMatch(lightingStageMatch[0], /stageHead/, "lightingStage mag de gedeelde stage-head niet zelf renderen");
});

test("HD-208: stageHead en hero laten gefabriceerde/statische tekst weg (geen kamernaam-h3, geen stageDescription, geen statische hero-subtitel)", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const stageHeadMatch = source.match(/private stageHead\(room: RoomConfig, key: RoomCapabilityStage, title: string\): HTMLElement\[\] \{[\s\S]*?\n  \}/);
  assert.ok(stageHeadMatch, "stageHead methode niet gevonden");
  assert.doesNotMatch(stageHeadMatch[0], /element\("h3"/, "stageHead mag de kamernaam niet als h3 herhalen");
  assert.doesNotMatch(source, /function stageDescription/, "de statische stageDescription-functie moet verwijderd zijn");
  assert.doesNotMatch(source, /Status en bediening per functie\./, "de statische hero-subtitel moet verwijderd zijn");
});

test("HD-208: roomCurrentWatts combineert power_entities met smart_plugs, met room_energy als niet-opgeteld gezaghebbend totaal", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const match = source.match(/private roomCurrentWatts\(room: RoomConfig\): number \| undefined \{[\s\S]*?\n  \}/);
  assert.ok(match, "roomCurrentWatts methode niet gevonden");
  const body = match[0];
  assert.match(body, /if \(room\.room_energy\?\.power_entity\) return this\.entityWatts\(room\.room_energy\.power_entity\);/, "room_energy.power_entity blijft gezaghebbend zonder dat er iets bij wordt opgeteld");
  assert.match(body, /room\.power_entities\.filter/, "power_entities worden meegeteld wanneer room_energy.power_entity ontbreekt");
  assert.match(body, /plugEntities\.has\(entity\)/, "entiteiten die in beide lijsten voorkomen worden gededupliceerd");
  assert.match(body, /this\.plugWatts\(plugs\)/, "smart_plugs blijven meetellen via de bestaande plugWatts()");
  // Called from the rail summary, the plugs-stage summary strip and the Energie tab's room-total card: one shared number everywhere.
  assert.match(source, /const watts = this\.roomCurrentWatts\(room\);/, "railsamenvatting gebruikt de gedeelde roomCurrentWatts");
  assert.match(source, /const totalWatts = this\.roomCurrentWatts\(room\);/, "plugs-stage samenvattingsstrip gebruikt de gedeelde roomCurrentWatts");
  assert.match(source, /const currentWatts = this\.roomCurrentWatts\(room\);/, "Energie-tab roomtotaalkaart gebruikt de gedeelde roomCurrentWatts");
});

test("HD-206: capabilityEntityRoles telt elke geconfigureerde energiebron mee, inclusief plug- en kamerperiodetotalen", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const rolesMatch = source.match(/function capabilityEntityRoles\(room: RoomConfig, key: RoomCapabilityStage\): Array<\{ entity: string; role: DeviceRole \}> \{[\s\S]*?\n\}/);
  assert.ok(rolesMatch, "capabilityEntityRoles functie niet gevonden");
  const body = rolesMatch[0];
  assert.match(body, /room\.room_energy\?\.month_entity, room\.room_energy\?\.year_entity/);
  assert.match(body, /plug\.energy_day_entity, plug\.energy_month_entity, plug\.energy_year_entity/);
});

test("HD-206: de rail toont een icoon en niet-gefabriceerde samenvatting per capability", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /private capabilitySummary\(room: RoomConfig, key: RoomCapabilityStage\): string \| undefined/);
  assert.match(source, /const capIcon = element\("span", "mushroom-icon"\); capIcon\.append\(icon\(railIcon\)\)/);
  assert.match(source, /if \(capSummary\) capCopy\.append\(element\("small", "", capSummary\)\)/);
  assert.match(source, /"mdi:lightbulb-group-outline"/);
  assert.match(source, /"mdi:window-shutter"/);
  assert.match(source, /"mdi:thermostat"/);
  assert.match(source, /"mdi:power-plug-outline"/);
  assert.match(source, /"mdi:gauge"/);
  // Lighting/covers/comfort summaries only appear when the underlying data exists.
  assert.match(source, /if \(!reachable\.length\) return undefined;/);
  assert.match(source, /return count \? `\$\{count\} bediening\$\{count === 1 \? "" : "en"\}` : undefined;/);
  // Lighting/plugs "N van M" counts only over currently actionable entities, so an unreachable
  // entity is never silently folded into "off" / excluded from the denominator instead.
  assert.match(source, /individualLightEntities\(room\)\.filter\(\(entity\) => actionable\(this\.currentHass\?\.states\?\.\[entity\]\)\)/);
  assert.match(source, /\(room\.smart_plugs \?\? \[\]\)\.filter\(\(plug\) => actionable\(this\.currentHass\?\.states\?\.\[plug\.switch_entity\]\)\)/);
});

test("HD-206: energySummary valt alleen terug op het plugtotaal als er geen kamerbron geconfigureerd is", async () => {
  const source = await readFile(sourceUrl, "utf8");
  const energySummaryMatch = source.match(/private energySummary\(room: RoomConfig\): string \| undefined \{[\s\S]*?\n  \}/);
  assert.ok(energySummaryMatch, "energySummary methode niet gevonden");
  const body = energySummaryMatch[0];
  assert.match(body, /const roomDayEntity = room\.room_energy\?\.day_entity;/);
  assert.match(body, /roomDayEntity \? energyKwh\(this\.currentHass\?\.states\?\.\[roomDayEntity\]\) : this\.plugPeriodTotal\(room\.smart_plugs \?\? \[\], "energy_day_entity"\)/);
});

test("HD-206: de hero toont meerdere echte statuspillen en een eerlijke placeholderillustratie", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /private heroPills\(room: RoomConfig\): HTMLElement\[\]/);
  assert.match(source, /lookupFloorName\(this\.currentHass, room\.floor_id\)/);
  assert.match(source, /floorName \? `Kamer · \$\{floorName\}` : "Kamer"/);
  assert.match(source, /if \(!values\.includes\(operational\)\) values\.push\(operational\)/);
  assert.match(source, /icon\("mdi:floor-plan"\)/);
  assert.match(source, /Geen kamerfoto geconfigureerd/);
  assert.match(source, /Kamerfoto niet beschikbaar/);
  assert.doesNotMatch(source, /Fictieve/, "productcopy voor de placeholder mag geen testharnastaal gebruiken");
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
