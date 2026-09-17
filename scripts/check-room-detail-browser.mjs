import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const require = createRequire(process.env.HD_BROWSER_PACKAGES ? `${process.env.HD_BROWSER_PACKAGES}/package.json` : import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const directory = process.env.HD_RENDER_DIRECTORY || "generated/room-detail";
await mkdir(directory, { recursive: true });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

async function open(variant, width) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(`http://127.0.0.1:4173/room-controls.html?fixture=${variant}`);
  await page.waitForFunction(() => window.roomFixture);
  await page.evaluate(() => {
    const fixture = window.roomFixture;
    document.body.replaceChildren();
    const detail = document.createElement("home-dashboard-room-detail");
    detail.setConfig({ type: "custom:home-dashboard-room-detail", room: fixture.config.rooms[0] });
    detail.hass = fixture.hass;
    document.body.append(detail);
  });
  await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector(".direct-controls"));
}

for (const variant of ["normal", "warning", "missing", "unavailable"]) {
  for (const width of [1440, 390]) {
    await open(variant, width);
    const layout = await page.evaluate((mobile) => {
      const root = document.querySelector("home-dashboard-room-detail").shadowRoot;
      const controls = root.querySelector(".direct-controls");
      const labels = [...controls.querySelectorAll("strong")].map((item) => item.textContent);
      const cards = [...controls.querySelectorAll("button")].map((item) => {
        const rect = item.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      });
      return {
        labels,
        count: cards.length,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        inside: cards.every((card) => card.left >= 0 && card.right <= innerWidth),
        mobileGrid: mobile ? getComputedStyle(controls.querySelector(".direct-grid")).gridTemplateColumns.split(" ").length : 0
      };
    }, width <= 600);
    assert.ok(layout.count >= 5, `${variant}/${width}: direct controls retain configured room capabilities`);
    assert.ok(layout.labels.length >= 3, `${variant}/${width}: light, cover and media remain directly represented`);
    assert.equal(layout.horizontalOverflow, false, `${variant}/${width}: no horizontal overflow`);
    assert.equal(layout.inside, true, `${variant}/${width}: summary cards remain contained`);
    if (width <= 600) assert.equal(layout.mobileGrid, 1, `${variant}/${width}: mobile controls use one clear column`);
    await page.screenshot({ path: `${directory}/${variant}-${width}.png`, fullPage: true });
  }
}
await open("normal", 1440);
const directBehavior = await page.evaluate(() => {
  const root = document.querySelector("home-dashboard-room-detail").shadowRoot;
  return {
    plug: Boolean(root.querySelector(".plug-card")),
    trend: Boolean(root.querySelector(".temperature-graph")),
    photo: Boolean(root.querySelector(".room-photo")),
    open: [...root.querySelectorAll(".direct-card button")].some((button) => button.textContent === "Open")
  };
});
assert.deepEqual(directBehavior, { plug: true, trend: true, photo: true, open: true });
await page.evaluate(() => document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".plug-lock").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.length), 0, "unlocking a plug must not switch it");
await page.evaluate(() => document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".plug-card .command").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.at(-1).service), "turn_off", "plug needs the explicit second confirmation");
await page.evaluate(() => [...document.querySelector("home-dashboard-room-detail").shadowRoot.querySelectorAll(".direct-card button")].find((button) => button.textContent === "Open").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.at(-1).service), "turn_off", "cover motion needs an inline confirmation");
await page.evaluate(() => [...document.querySelector("home-dashboard-room-detail").shadowRoot.querySelectorAll(".direct-card button")].find((button) => button.textContent === "Bevestig open").click());
assert.equal(await page.evaluate(() => window.roomFixture.calls.at(-1).service), "open_cover", "cover opens directly from the room detail");
assert.deepEqual(errors, []);
console.log("Room-detail browser checks passed: normal, warning, missing and unavailable on desktop and mobile.");
await browser.close();
