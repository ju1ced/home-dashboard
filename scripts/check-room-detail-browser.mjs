import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const require = createRequire(process.env.HD_BROWSER_PACKAGES ? `${process.env.HD_BROWSER_PACKAGES}/package.json` : import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch({ headless: true, ...(process.env.HD_BROWSER_CHANNEL ? { channel: process.env.HD_BROWSER_CHANNEL } : {}) });
const page = await browser.newPage();
const prototypeUrl = process.env.HD_PROTOTYPE_URL || "http://127.0.0.1:4173";
const directory = process.env.HD_RENDER_DIRECTORY || "generated/room-detail";
await mkdir(directory, { recursive: true });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

async function open(variant, width, height = width <= 600 ? 844 : 900) {
  await page.setViewportSize({ width, height });
  await page.goto(`${prototypeUrl}/room-controls.html?fixture=${variant}&theme=${variant === "dark" ? "dark" : "light"}`);
  await page.waitForFunction(() => window.roomFixture);
  await page.evaluate(() => {
    const fixture = window.roomFixture;
    document.body.replaceChildren();
    const detail = document.createElement("home-dashboard-room-detail");
    detail.setConfig({ type: "custom:home-dashboard-room-detail", room: { ...fixture.config.rooms[0], safety_entities: fixture.config.rooms.at(-1).safety_entities } });
    detail.hass = fixture.hass;
    document.body.append(detail);
  });
  await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector(".control-deck"));
}

async function selectCapability(name) {
  await page.locator(".capability-rail button", { hasText: name }).click();
}

for (const variant of ["normal", "dark", "warning", "missing", "unknown", "unavailable"]) {
  for (const { width, height } of [{ width: 1440, height: 900 }, { width: 1024, height: 900 }, { width: 390, height: 844 }]) {
    await open(variant, width, height);
    const layout = await page.evaluate((mobile) => {
      const root = document.querySelector("home-dashboard-room-detail").shadowRoot;
      const stage = root.querySelector(".stage");
      const labels = [...stage.querySelectorAll("strong")].map((item) => item.textContent);
      const cards = [...stage.querySelectorAll("button")].map((item) => {
        const rect = item.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width, height: rect.height };
      });
      const mushroomGrid = stage.querySelector(".mushroom-grid");
      return {
        labels,
        count: cards.length,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        inside: cards.every((card) => card.left >= 0 && card.right <= innerWidth),
        touch: [...root.querySelectorAll("button")].filter(button => button.checkVisibility()).every(button => { const bounds = button.getBoundingClientRect(); return bounds.width >= 44 && bounds.height >= 44; }),
        mobileGrid: mobile && mushroomGrid ? getComputedStyle(mushroomGrid).gridTemplateColumns.split(" ").length : 0,
        tabs: root.querySelectorAll('.detail-tabs [role="tab"]').length,
        tabSelected: root.querySelector('.detail-tabs [role="tab"][aria-selected="true"]')?.textContent,
        railVisible: root.querySelector(".capability-rail").checkVisibility(),
        railButtons: root.querySelectorAll(".capability-rail button").length,
        selectedCapabilities: root.querySelectorAll('.capability-rail button[aria-selected="true"]').length
      };
    }, width <= 600);
    const label = `${variant}/${width}x${height}`;
    assert.ok(layout.count >= 1, `${label}: the selected capability stage renders at least one control`);
    assert.equal(layout.horizontalOverflow, false, `${label}: no horizontal overflow`);
    assert.equal(layout.inside, true, `${label}: summary cards remain contained`);
    assert.equal(layout.touch, true, `${label}: all visible controls meet 44px touch targets`);
    assert.equal(layout.tabs, 3, `${label}: Control Deck exposes three stable detail tabs`);
    assert.equal(layout.tabSelected, "Apparaten", `${label}: the device tab remains the default detail tab`);
    assert.equal(layout.railVisible, true, `${label}: capability rail remains visible`);
    assert.equal(layout.railButtons, 5, `${label}: every mapped v3 capability is represented on the rail`);
    assert.equal(layout.selectedCapabilities, 1, `${label}: exactly one capability stage is selected by default`);
    if (width <= 600) assert.equal(layout.mobileGrid, 1, `${label}: mobile controls use one clear column`);
    if (variant === "missing") assert.equal(await page.locator(".light-card").first().isDisabled(), true);
    if (variant === "unavailable") { await selectCapability("Luifel & screens"); assert.equal(await page.locator(".cover-card button").first().isDisabled(), true); await selectCapability("Verlichting"); }
    if (variant === "warning") { await selectCapability("Comfort"); assert.equal(await page.locator(".info.warning").count(), 1); await selectCapability("Verlichting"); }
    await page.screenshot({ path: `${directory}/${variant}-${width}.png`, fullPage: true });
  }
}
await open("normal", 1440);
const directBehavior = await page.evaluate(() => {
  const root = document.querySelector("home-dashboard-room-detail").shadowRoot;
  return {
    photo: Boolean(root.querySelector(".room-photo")),
    group: Boolean(root.querySelector(".light-group-card")),
    groupStatus: root.querySelector(".light-group-card .status")?.textContent
  };
});
assert.deepEqual(directBehavior, { photo: true, group: true, groupStatus: "Gedeeltelijk aan" });
await selectCapability("Luifel & screens");
const openBehavior = await page.evaluate(() => [...document.querySelector("home-dashboard-room-detail").shadowRoot.querySelectorAll(".cover-card button")].some((button) => button.textContent === "Open"));
assert.equal(openBehavior, true, "cover cards keep the Open action");
const lightCapability = page.locator(".capability-rail button", { hasText: "Verlichting" });
await lightCapability.focus();
await page.keyboard.press("Enter");
assert.equal(await lightCapability.getAttribute("aria-selected"), "true", "capability rail exposes one selected function");
assert.equal(await page.locator('.capability-rail button[aria-selected="true"]').count(), 1, "only one capability is selected");
assert.equal(await lightCapability.evaluate((button) => button.getRootNode().activeElement === button), true, "capability activation preserves keyboard focus");
await selectCapability("Verbruik");
assert.equal(await page.locator(".stage .period-selector").count(), 1, "the v3 energy stage reuses the existing energyPeriodGroup period selector instead of a fabricated summary");
assert.equal(await page.locator(".stage .energy-source-context").count(), 3, "the v3 energy stage shows the same source/freshness context as the richer energy view");
assert.match(await page.locator(".stage .energy-period-context").first().textContent(), /Lopende vandaag/, "the v3 energy stage identifies the running period");
assert.equal(await page.locator(".stage .energy-comparison").getAttribute("role"), "img", "the v3 energy stage keeps the accessible device-comparison chart");
assert.match(await page.locator(".stage .energy-comparison").getAttribute("aria-label"), /Schaal nul tot .*kilowattuur.*Mediahoek.*Netwerkhoek/, "the v3 energy stage keeps scale, unit and text alternative");
await page.getByRole("tab", { name: "Energie" }).click();
assert.equal(await page.locator(".details-card .energy-source-context").count(), 3, "energy detail tab keeps its unchanged source and update context");
assert.match(await page.locator(".details-card .energy-period-context").first().textContent(), /Lopende vandaag/, "energy cards identify the running period");
assert.match(await page.locator(".details-card .energy-source-context").first().textContent(), /dagen oud/, "energy update context makes stale fixture data explicit");
assert.equal(await page.locator(".details-card .energy-comparison").getAttribute("role"), "img", "device comparison exposes an accessible chart role");
assert.match(await page.locator(".details-card .energy-comparison").getAttribute("aria-label"), /Schaal nul tot .*kilowattuur.*Mediahoek.*Netwerkhoek/, "energy chart has scale, unit and text alternative");
await page.locator(".details-card").getByRole("button", { name: "Jaar" }).click();
assert.ok(await page.locator(".details-card .energy-period-context", { hasText: "Afgesloten jaar" }).count() >= 2, "completed periods are distinguished from running periods");
await selectCapability("Smart plugs");
assert.equal(await page.locator(".smart-plug-card").count(), 2, "the plugs stage renders repeated smart plugs");
assert.match(await page.locator(".stage .summary-strip").first().textContent(), /actieve plugs/, "the plugs stage shows a summary strip");
assert.equal(await page.locator(".smart-plug-card").first().locator(".plug-metrics .plug-metric").count(), 3, "each plug card shows day/month/year metrics");
assert.equal(await page.locator(".smart-plug-card.protected .command").isDisabled(), true, "protected plugs never expose an enabled action");
assert.match(await page.locator(".smart-plug-card.protected .protection-reason").textContent(), /netwerkautomatisering/, "protected plugs explain why control is disabled");
await page.evaluate(() => document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".smart-plug-card:not(.protected) .plug-lock").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.length), 0, "unlocking a plug must not switch it");
await page.evaluate(() => document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".smart-plug-card:not(.protected) .command").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.at(-1).service), "turn_off", "plug needs the explicit second confirmation");
await selectCapability("Luifel & screens");
await page.evaluate(() => [...document.querySelector("home-dashboard-room-detail").shadowRoot.querySelectorAll(".cover-card button")].find((button) => button.textContent === "Open").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.at(-1).service), "turn_off", "cover motion needs an inline confirmation");
await page.evaluate(() => [...document.querySelector("home-dashboard-room-detail").shadowRoot.querySelectorAll(".cover-card button")].find((button) => button.textContent === "Bevestig open").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.at(-1).service), "open_cover", "cover opens directly from the room detail");
await page.evaluate(() => [...document.querySelector("home-dashboard-room-detail").shadowRoot.querySelectorAll(".cover-card button")].find((button) => button.textContent === "Open").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.filter(call => call.service === "open_cover").length), 1, "cover confirmation relocks after every movement request");
await selectCapability("Smart plugs");
const plugLayout = await page.locator(".smart-plug-card:not(.protected) .plug-lock").evaluate((button) => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height }));
assert.ok(plugLayout.width >= 44 && plugLayout.height < 120, "plug unlock stays readable, not squeezed into an icon column");
await page.locator(".smart-plug-card:not(.protected) .plug-lock").click();
await page.locator(".smart-plug-card:not(.protected) .command").click();
assert.equal(await page.locator(".smart-plug-card:not(.protected) .command").isHidden(), true, "smart plug relocks after every confirmed request");
await page.getByRole("tab", { name: "Apparaten" }).focus();
await page.keyboard.press("ArrowRight");
assert.equal(await page.getByRole("tab", { name: "Energie" }).evaluate((tab) => tab.getRootNode().activeElement === tab && tab.tabIndex === 0), true, "arrow navigation moves focus to the active room tab");
await page.getByRole("tab", { name: "Historie" }).click();
await page.locator(".history-card").first().click();
assert.equal(await page.getByRole("dialog", { name: /Historie/ }).count(), 1, "history dialog has an accessible name");
await page.keyboard.press("Escape");
await page.locator("dialog").waitFor({ state: "detached" });
assert.equal(await page.locator("dialog").count(), 0);
assert.equal(await page.locator(".history-card").first().evaluate((button) => button.getRootNode().activeElement === button), true, "history returns focus to its source");
await page.locator(".history-card").first().click();
await page.evaluate(() => {
  const { hass, config } = window.roomFixture;
  hass.states[config.rooms[0].control_light_entity].state = "off";
  document.querySelector("home-dashboard-room-detail").hass = { ...hass };
});
assert.equal(await page.locator("dialog[open]").count(), 1, "state updates must not dismiss history");
await page.getByRole("button", { name: "Sluiten", exact: true }).click();
await page.locator("dialog").waitFor({ state: "detached" });
assert.equal(await page.locator(".history-card").first().evaluate((button) => button.getRootNode().activeElement === button), true, "history returns focus after a relevant state update replaces its invoker");
await page.getByRole("tab", { name: "Energie" }).click();
await page.getByRole("button", { name: "Vandaag", exact: true }).click();
assert.match(await page.locator(".energy-period-card").textContent(), /Vandaag.*0\.6 kWh/s, "day period uses its explicit energy source");
await page.getByRole("button", { name: "Jaar", exact: true }).click();
assert.match(await page.locator(".energy-period-card").textContent(), /Jaar.*143 kWh/s, "year period switches without fabricating a day value");
await page.evaluate(() => {
  const { config, hass } = window.roomFixture;
  const detail = document.querySelector("home-dashboard-room-detail");
  detail.setConfig({ room: { ...config.rooms[0], controls_enabled: false } });
  detail.hass = hass;
  window.roomFixture.calls.length = 0;
  detail.shadowRoot.querySelector(".capability-rail button").click();
  detail.shadowRoot.querySelector(".light-card").click();
});
assert.equal(await page.evaluate(() => window.roomFixture.calls.length), 0, "detail respects disabled direct controls");
await open("normal", 1440);
await page.evaluate(() => {
  const detail = document.querySelector("home-dashboard-room-detail");
  window.roomFixture.hass.callService = () => new Promise((resolve) => { window.resolvePendingCall = resolve; });
  detail.hass = window.roomFixture.hass;
  detail.shadowRoot.querySelector(".light-card").click();
});
await page.getByRole("status").waitFor();
assert.match(await page.getByRole("status").textContent(), /wordt uitgevoerd/, "pending service feedback is announced");
assert.equal(await page.locator(".light-card").first().isDisabled(), true, "pending target is locked against duplicate activation");
await page.evaluate(() => window.resolvePendingCall());
await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector('[role="status"]')?.textContent?.includes("bevestigd"));
assert.match(await page.getByRole("status").textContent(), /bevestigd/, "successful service completion is announced without optimistic state");
await open("normal", 1440);
await page.evaluate(async () => {
  const { config, hass } = window.roomFixture;
  const detail = document.querySelector("home-dashboard-room-detail");
  hass.callService = () => new Promise((_, reject) => { window.rejectStaleCall = reject; });
  detail.hass = hass;
  detail.shadowRoot.querySelector(".light-card").click();
  await Promise.resolve();
  detail.setConfig({ room: { ...config.rooms[0], controls_enabled: false } });
  detail.hass = hass;
  window.rejectStaleCall(new Error("stale fixture refusal"));
  await Promise.resolve();
});
assert.equal(await page.getByRole("alert").count(), 0, "stale service failures never attach alerts to a reconfigured room");
await open("normal", 1440);
await selectCapability("Luifel & screens");
await page.evaluate(() => {
  const { config, hass } = window.roomFixture;
  const detail = document.querySelector("home-dashboard-room-detail");
  const unsafe = config.rooms[0].control_cover_entity;
  hass.states[unsafe].attributes.device_class = "garage";
  detail.hass = { ...hass };
  window.roomFixture.calls.length = 0;
});
assert.equal(await page.locator(".cover-card button").first().isDisabled(), true, "garage, gate and door covers remain non-actionable in room detail");
await page.evaluate(() => {
  const { config, hass, ref } = window.roomFixture;
  const detail = document.querySelector("home-dashboard-room-detail");
  const rogue = ref("switch", "unmapped_fixture");
  hass.states[rogue] = { state: "on", attributes: { friendly_name: "Niet gemapte switch" } };
  detail.setConfig({ room: { ...config.rooms[0], control_entities: [rogue], control_light_entity: "", light_entities: [], light_switch_entities: [], light_groups: [] } });
  detail.hass = { ...hass };
});
assert.equal(await page.locator(".capability-rail button", { hasText: "Verlichting" }).count(), 0, "an unconfigured lighting capability no longer offers a rail item");
assert.equal(await page.locator(".light-card").count(), 0, "room detail never promotes an unmapped switch into lighting controls");
await open("normal", 1440);
await selectCapability("Luifel & screens");
await page.evaluate(() => {
  const { config, hass } = window.roomFixture;
  const entity = config.rooms[0].control_cover_entity;
  hass.states[entity].attributes.supported_features = 0;
  document.querySelector("home-dashboard-room-detail").hass = { ...hass };
});
assert.equal(await page.locator(".cover-card button").first().isDisabled(), true, "unsupported cover services remain disabled in room detail");
await open("normal", 1440);
await page.evaluate(() => { window.fixtureReject = true; });
await page.locator(".light-card").first().click();
await page.getByRole("alert").waitFor();
assert.match(await page.getByRole("alert").textContent(), /mislukt/);
await open("normal", 1440);
await page.evaluate(async () => {
  const detail = document.querySelector("home-dashboard-room-detail");
  const pending = [];
  window.roomFixture.hass.callService = () => new Promise((resolve, reject) => pending.push({ resolve, reject }));
  window.pendingCalls = pending;
  detail.hass = window.roomFixture.hass;
  detail.shadowRoot.querySelector(".light-card").click();
});
await selectCapability("Comfort");
await page.evaluate(async () => {
  document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".media-card .command").click();
  const pending = window.pendingCalls;
  pending[1].resolve();
  pending[0].reject(new Error("older fixture refusal"));
  await Promise.resolve();
});
assert.equal(await page.getByRole("alert").count(), 1, "each concurrent service failure keeps its own feedback");
assert.equal(await page.getByRole("status").count(), 1, "a concurrent successful request keeps its own feedback");
await selectCapability("Verlichting");
assert.equal(await page.locator(".light-card").first().isDisabled(), false, "settled older requests release their pending lock");
await open("normal", 1440);
await selectCapability("Comfort");
await page.evaluate(() => {
  const { config, hass } = window.roomFixture;
  hass.states[config.rooms[0].hvac.entity].attributes.supported_features = 0;
  document.querySelector("home-dashboard-room-detail").hass = { ...hass };
});
assert.equal(await page.locator(".climate-card .command").first().isDisabled(), true, "temperature controls require climate target-temperature support");
await open("normal", 390);
await page.evaluate(() => { window.loadCardHelpers = async () => { throw Error("fixture helper refusal"); }; });
await page.getByRole("tab", { name: "Historie" }).click();
await page.locator(".history-card").first().click();
await page.getByText("Kaart niet beschikbaar.", { exact: true }).waitFor();
await page.getByRole("button", { name: "Sluiten", exact: true }).click();
await open("normal", 390);
await page.evaluate(() => {
  window.historyConfigs = [];
  window.loadCardHelpers = async () => ({ createCardElement: (config) => {
    window.historyConfigs.push(config);
    const card = document.createElement("div"); card.textContent = "Fictieve historiekaart"; return card;
  } });
});
await page.getByRole("tab", { name: "Historie" }).click();
await page.locator(".history-card").first().click();
assert.equal(await page.evaluate(() => window.historyConfigs[0]?.type), "history-graph", "generic history supports sources without statistics");
await page.evaluate(() => {
  const detail = document.querySelector("home-dashboard-room-detail");
  detail.remove(); document.body.append(detail);
});
assert.equal(await page.locator("dialog").count(), 0, "disconnect cleans up history");
await page.locator(".history-card").first().click();
await page.evaluate(() => document.querySelector("home-dashboard-room-detail").setConfig({ room: window.roomFixture.config.rooms[0] }));
assert.equal(await page.locator("dialog").count(), 0, "configuration changes clean up history");
await open("normal", 390);
await selectCapability("Verlichting");
await page.evaluate(() => {
  const { hass, config } = window.roomFixture;
  hass.states[config.rooms[0].light_groups[0].member_entities[1]].state = "on";
  hass.states[config.rooms[0].light_groups[0].member_entities[1]].attributes.brightness = 128;
  document.querySelector("home-dashboard-room-detail").hass = { ...hass };
});
assert.match(await page.locator(".light-card:not(.light-group-card)").first().textContent(), /50%/, "attribute-only brightness changes update the card");
await page.locator(".light-card:not(.light-group-card)").first().focus();
await page.evaluate(() => {
  const { config, hass } = window.roomFixture;
  hass.states[config.rooms[0].light_groups[0].member_entities[1]].state = "off";
  document.querySelector("home-dashboard-room-detail").hass = { ...hass };
});
assert.equal(await page.locator(".light-card:not(.light-group-card)").first().evaluate((button) => button.getRootNode().activeElement === button), true, "relevant state updates preserve focus on the same direct control");
await page.evaluate(() => {
  const { config, hass } = window.roomFixture;
  hass.states[config.rooms[0].light_groups[0].member_entities[1]].state = "on";
  hass.states[config.rooms[0].light_groups[0].member_entities[1]].attributes.brightness = 128;
  document.querySelector("home-dashboard-room-detail").hass = { ...hass };
});
const callsBeforeSlider = await page.evaluate(() => window.roomFixture.calls.length);
const sliderChange = await page.evaluate(() => {
  const root = document.querySelector("home-dashboard-room-detail").shadowRoot;
  const input = root.querySelector('input[type="range"]');
  input.value = "70";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
});
assert.equal(sliderChange, true, "brightness slider dispatches without throwing");
assert.equal(await page.evaluate(() => window.roomFixture.calls.at(-1).service), "turn_on", "brightness slider commits via light.turn_on");
assert.equal(await page.evaluate(() => window.roomFixture.calls.at(-1).data.brightness_pct), 70, "brightness slider sends the chosen percentage");
assert.equal(await page.evaluate((before) => window.roomFixture.calls.length - before, callsBeforeSlider), 1, "brightness slider fires exactly one service call for both input and change events (no spam on drag)");
await open("normal", 390);
await selectCapability("Verlichting");
const disabledSlider = await page.evaluate(() => {
  const { config, hass } = window.roomFixture;
  delete hass.states[config.rooms[0].light_groups[0].member_entities[1]];
  document.querySelector("home-dashboard-room-detail").hass = { ...hass };
  const root = document.querySelector("home-dashboard-room-detail").shadowRoot;
  return [...root.querySelectorAll('input[type="range"]')].some((input) => input.disabled);
});
assert.equal(disabledSlider, true, "a missing light disables its brightness slider");
const performance = await page.evaluate(() => {
  const detail = document.querySelector("home-dashboard-room-detail");
  const { hass, ref } = window.roomFixture;
  const root = detail.shadowRoot.querySelector("main");
  const start = performance.now();
  for (let index = 0; index < 100; index++) detail.hass = { ...hass, states: { ...hass.states, [ref("sensor", "unrelated")]: { state: String(index) } } };
  return { retained: root === detail.shadowRoot.querySelector("main"), milliseconds: performance.now() - start };
});
assert.equal(performance.retained, true, "unrelated state updates retain the room DOM");
await page.evaluate(() => {
  const { config, hass } = window.roomFixture;
  const room = config.rooms[0];
  const controls = document.createElement("home-dashboard-room-controls");
  controls.setConfig({ room: { ...room, control_entities: undefined, control_light_entity: "", light_entities: [] }, expanded: true });
  controls.hass = hass;
  document.body.replaceChildren(controls);
});
assert.equal(await page.locator(".control.kind-light").count(), 1, "Home fallback renders an explicitly configured lighting switch");
await page.locator(".control.kind-light").click();
assert.deepEqual(await page.evaluate(() => window.roomFixture.calls.at(-1)), await page.evaluate(() => ({ domain: "switch", service: "turn_off", data: { entity_id: window.roomFixture.config.rooms[0].light_switch_entities[0] } })), "Home uses the switch domain and exact target");
assert.deepEqual(errors, []);
console.log(`Room-detail browser checks passed: normal/dark/warning/missing/unavailable at desktop/tablet/mobile; touch, dialog lifecycle, fallback, opt-in, service rejection, brightness slider and Home lighting switches. 100 unrelated updates: ${performance.milliseconds.toFixed(1)} ms, DOM retained.`);
await browser.close();
