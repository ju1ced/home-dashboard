import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(process.env.HD_BROWSER_PACKAGES ? `${process.env.HD_BROWSER_PACKAGES}/package.json` : import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch({
  headless: true,
  ...(process.env.HD_BROWSER_CHANNEL ? { channel: process.env.HD_BROWSER_CHANNEL } : {})
});
const page = await browser.newPage();
const prototypeUrl = process.env.HD_PROTOTYPE_URL || "http://127.0.0.1:4173";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 1024, height: 900 },
  { name: "desktop", width: 1440, height: 900 }
];
const routes = [
  { view: "home", active: "Home", marker: ".today-section h2", content: /^Vandaag$/ },
  { view: "rooms", active: "Kamers", marker: ".overview-hero h2", content: /^Kamers$/ },
  { view: "energy", active: "Energie", marker: ".energy-hero .card-eyebrow", content: /Actuele energiebalans/ },
  { view: "integrations", active: "Domeinen", marker: ".integration-hero h2", content: /Specialistische dashboards/ },
  { view: "more", active: "Meer", marker: ".overview-hero h2", content: /^Meer$/ },
  { view: "room", active: "Kamers", marker: ".room-hero h2", content: /Woonkamer/ },
  { view: "specialist", card: "kia", active: "Domeinen", marker: ".specialist-full-hero h2", content: /Kia Connect-dashboard/ },
  { view: "specialist", card: "robot", active: "Domeinen", marker: ".specialist-full-hero h2", content: /Robotdashboard/ },
  { view: "specialist", card: "garden", active: "Domeinen", marker: ".specialist-full-hero h2", content: /Tuindashboard/ },
  { view: "specialist", card: "printer", active: "Domeinen", marker: ".specialist-full-hero h2", content: /3D-printerdashboard/ },
  { view: "pool", active: "Domeinen", marker: ".pool-hero h2", content: /^Zwembad$/ }
];

async function checkCase({ route, viewport, state = "warning", theme = "light" }) {
  const label = `${route.view}${route.card ? `-${route.card}` : ""}/${state}/${theme}/${viewport.width}x${viewport.height}`;
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  const params = new URLSearchParams({ view: route.view, state, theme, clean: "1" });
  if (route.card) params.set("card", route.card);
  await page.goto(`${prototypeUrl}/?${params}`);
  await page.locator("#page").waitFor();

  assert.ok(await page.locator("#page > *").count(), `${label}: view renders content`);
  assert.equal(await page.locator("#view-tabs [aria-current=page]").textContent(), route.active, `${label}: active route is correct`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${label}: no horizontal overflow`);
  assert.match(await page.locator("body").getAttribute("class"), /clean-capture/, `${label}: clean verification mode is active`);
  assert.match(await page.locator(route.marker).first().textContent(), route.content, `${label}: route-specific content is rendered`);
  console.log(`PASS ${label}: render, route and overflow gate`);
}

try {
  for (const viewport of viewports) {
    for (const route of routes) await checkCase({ route, viewport });
  }

  for (const route of routes) {
    await checkCase({ route, viewport: viewports.at(-1), theme: "dark" });
  }

  for (const state of ["normal", "unavailable"]) {
    for (const route of routes.slice(0, 5)) {
      await checkCase({ route, viewport: viewports[0], state });
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${prototypeUrl}/?view=home&state=normal&theme=light&clean=1`);
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").count(), 1, "home/normal/light/390x844: keyboard focus is visible in the document");
  assert.notEqual(await page.locator(":focus").evaluate((element) => getComputedStyle(element).outlineStyle), "none", "home/normal/light/390x844: focused control has a visible outline");
  assert.deepEqual(errors, []);
  console.log("Prototype browser checks passed: all main/detail/specialist routes at 390×844, 1024×900 and 1440×900; dark desktop and normal/unavailable mobile variants.");
} finally {
  await browser.close();
}
