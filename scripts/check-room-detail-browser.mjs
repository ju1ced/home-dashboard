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
  await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector(".room-summary-grid"));
}

for (const variant of ["normal", "warning", "missing", "unavailable"]) {
  for (const width of [1440, 390]) {
    await open(variant, width);
    const layout = await page.evaluate((mobile) => {
      const root = document.querySelector("home-dashboard-room-detail").shadowRoot;
      const summary = root.querySelector(".room-summary-grid");
      const labels = [...summary.querySelectorAll("small")].map((item) => item.textContent);
      const cards = [...summary.querySelectorAll("button")].map((item) => {
        const rect = item.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      });
      return {
        labels,
        count: cards.length,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        inside: cards.every((card) => card.left >= 0 && card.right <= innerWidth),
        mobileGrid: mobile ? getComputedStyle(summary).gridTemplateColumns.split(" ").length : 0
      };
    }, width <= 600);
    assert.ok(layout.count >= 4, `${variant}/${width}: overview retains configured room capabilities`);
    for (const label of ["Comfort", "Verlichting actief", "Openingen", "Media"]) assert.ok(layout.labels.includes(label), `${variant}/${width}: ${label} remains visible`);
    assert.equal(layout.horizontalOverflow, false, `${variant}/${width}: no horizontal overflow`);
    assert.equal(layout.inside, true, `${variant}/${width}: summary cards remain contained`);
    if (width <= 600) assert.equal(layout.mobileGrid, 2, `${variant}/${width}: mobile overview uses two columns`);
    await page.screenshot({ path: `${directory}/${variant}-${width}.png`, fullPage: true });
  }
}
assert.deepEqual(errors, []);
console.log("Room-detail browser checks passed: normal, warning, missing and unavailable on desktop and mobile.");
await browser.close();
