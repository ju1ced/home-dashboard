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
  await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector(".mushroom-controls"));
}

for (const variant of ["normal", "dark", "warning", "missing", "unavailable"]) {
  for (const { width, height } of [{ width: 1440, height: 900 }, { width: 1024, height: 900 }, { width: 390, height: 844 }]) {
    await open(variant, width, height);
    const layout = await page.evaluate((mobile) => {
      const root = document.querySelector("home-dashboard-room-detail").shadowRoot;
      const controls = root.querySelector(".mushroom-controls");
      const labels = [...controls.querySelectorAll("strong")].map((item) => item.textContent);
      const cards = [...controls.querySelectorAll("button")].map((item) => {
        const rect = item.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width, height: rect.height };
      });
      return {
        labels,
        count: cards.length,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        inside: cards.every((card) => card.left >= 0 && card.right <= innerWidth),
        touch: [...root.querySelectorAll("button")].filter(button => !button.hidden).every(button => { const bounds = button.getBoundingClientRect(); return bounds.width >= 44 && bounds.height >= 44; }),
        mobileGrid: mobile ? getComputedStyle(controls.querySelector(".mushroom-grid")).gridTemplateColumns.split(" ").length : 0,
        tabletBalance: !mobile && innerWidth <= 1100 ? (() => {
          const operations = root.querySelector(".operations").getBoundingClientRect();
          const climate = root.querySelector(".climate").getBoundingClientRect();
          const energy = root.querySelector(".energy").getBoundingClientRect();
          return operations.width > climate.width * 1.8 && Math.abs(climate.top - energy.top) < 1;
        })() : true
      };
    }, width <= 600);
    const label = `${variant}/${width}x${height}`;
    assert.ok(layout.count >= 5, `${label}: direct controls retain configured room capabilities`);
    assert.ok(layout.labels.length >= 3, `${label}: light, cover and media remain directly represented`);
    assert.equal(layout.horizontalOverflow, false, `${label}: no horizontal overflow`);
    assert.equal(layout.inside, true, `${label}: summary cards remain contained`);
    assert.equal(layout.touch, true, `${label}: all visible controls meet 44px touch targets`);
    assert.equal(layout.tabletBalance, true, `${label}: tablet gives capabilities full width and balances secondary columns`);
    if (width <= 600) assert.equal(layout.mobileGrid, 1, `${label}: mobile controls use one clear column`);
    if (variant === "missing") assert.equal(await page.locator(".light-card").first().isDisabled(), true);
    if (variant === "unavailable") assert.equal(await page.locator(".cover-card button").first().isDisabled(), true);
    if (variant === "warning") assert.equal(await page.locator(".info.warning").count(), 1);
    await page.screenshot({ path: `${directory}/${variant}-${width}.png`, fullPage: true });
  }
}
await open("normal", 1440);
const directBehavior = await page.evaluate(() => {
  const root = document.querySelector("home-dashboard-room-detail").shadowRoot;
  return {
    plug: Boolean(root.querySelector(".smart-plug-card")),
    trend: Boolean(root.querySelector(".history-card")),
    photo: Boolean(root.querySelector(".room-photo")),
    open: [...root.querySelectorAll(".cover-card button")].some((button) => button.textContent === "Open")
  };
});
assert.deepEqual(directBehavior, { plug: true, trend: true, photo: true, open: true });
await page.evaluate(() => document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".plug-lock").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.length), 0, "unlocking a plug must not switch it");
await page.evaluate(() => document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".smart-plug-card .command").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.at(-1).service), "turn_off", "plug needs the explicit second confirmation");
await page.evaluate(() => [...document.querySelector("home-dashboard-room-detail").shadowRoot.querySelectorAll(".cover-card button")].find((button) => button.textContent === "Open").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.at(-1).service), "turn_off", "cover motion needs an inline confirmation");
await page.evaluate(() => [...document.querySelector("home-dashboard-room-detail").shadowRoot.querySelectorAll(".cover-card button")].find((button) => button.textContent === "Bevestig open").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.at(-1).service), "open_cover", "cover opens directly from the room detail");
await page.evaluate(() => [...document.querySelector("home-dashboard-room-detail").shadowRoot.querySelectorAll(".cover-card button")].find((button) => button.textContent === "Open").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.filter(call => call.service === "open_cover").length), 1, "cover confirmation relocks after every movement request");
const plugLayout = await page.locator(".smart-plug-card .plug-lock").evaluate((button) => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height }));
assert.ok(plugLayout.width >= 44 && plugLayout.height < 120, "plug unlock stays readable, not squeezed into an icon column");
await page.locator(".smart-plug-card .plug-lock").click();
await page.locator(".smart-plug-card .command").click();
assert.equal(await page.locator(".smart-plug-card .command").isHidden(), true, "smart plug relocks after every confirmed request");
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
await page.evaluate(() => {
  const { config, hass } = window.roomFixture;
  const detail = document.querySelector("home-dashboard-room-detail");
  detail.setConfig({ room: { ...config.rooms[0], controls_enabled: false } });
  detail.hass = hass;
  window.roomFixture.calls.length = 0;
  detail.shadowRoot.querySelector(".light-card").click();
});
assert.equal(await page.evaluate(() => window.roomFixture.calls.length), 0, "detail respects disabled direct controls");
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
  detail.setConfig({ room: { ...config.rooms[0], control_entities: [rogue], control_light_entity: "", light_entities: [], light_switch_entities: [] } });
  detail.hass = { ...hass };
});
assert.equal(await page.locator(".light-card").count(), 0, "room detail never promotes an unmapped switch into lighting controls");
await open("normal", 1440);
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
  detail.hass = window.roomFixture.hass;
  detail.shadowRoot.querySelector(".light-card").click();
  detail.shadowRoot.querySelector(".media-card .command").click();
  pending[1].resolve();
  pending[0].reject(new Error("older fixture refusal"));
  await Promise.resolve();
});
assert.equal(await page.getByRole("alert").count(), 0, "an older failure cannot overwrite a newer successful request");
await open("normal", 1440);
await page.evaluate(() => {
  const { config, hass } = window.roomFixture;
  hass.states[config.rooms[0].hvac.entity].attributes.supported_features = 0;
  document.querySelector("home-dashboard-room-detail").hass = { ...hass };
});
assert.equal(await page.locator(".climate-card .command").first().isDisabled(), true, "temperature controls require climate target-temperature support");
await open("normal", 390);
await page.evaluate(() => { window.loadCardHelpers = async () => { throw Error("fixture helper refusal"); }; });
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
await page.evaluate(() => {
  const { hass, config } = window.roomFixture;
  hass.states[config.rooms[0].control_light_entity].attributes.brightness = 128;
  document.querySelector("home-dashboard-room-detail").hass = { ...hass };
});
assert.match(await page.locator(".light-card").first().textContent(), /50%/, "attribute-only brightness changes update the card");
await page.locator(".light-card").first().focus();
await page.evaluate(() => {
  const { config, hass } = window.roomFixture;
  hass.states[config.rooms[0].control_light_entity].state = "off";
  document.querySelector("home-dashboard-room-detail").hass = { ...hass };
});
assert.equal(await page.locator(".light-card").first().evaluate((button) => button.getRootNode().activeElement === button), true, "relevant state updates preserve focus on the same direct control");
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
console.log(`Room-detail browser checks passed: normal/dark/warning/missing/unavailable at desktop/tablet/mobile; touch, dialog lifecycle, fallback, opt-in, service rejection and Home lighting switches. 100 unrelated updates: ${performance.milliseconds.toFixed(1)} ms, DOM retained.`);
await browser.close();
