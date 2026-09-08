import { createRequire } from "node:module";
import { mkdir, readFile } from "node:fs/promises";

const require = createRequire(process.env.HD_BROWSER_PACKAGES ? `${process.env.HD_BROWSER_PACKAGES}/package.json` : import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch({ headless: true, channel: process.env.HD_BROWSER_CHANNEL || "msedge" });
const directory = "docs/renders/palette-options";
await mkdir(directory, { recursive: true });

const palettes = [
  {
    id: "warm-stone", label: "A · Warm zand", note: "zacht taupe met warme accenten",
    colors: { bg: "#F3F0EA", surface: "#FFFEFC", raised: "#F8F5F0", mutedSurface: "#ECE7DE", text: "#292722", muted: "#6D6860", border: "#DDD6CC", brand: "#765F52", soft: "#EDE4DC", hero: "#765F52", light: "#A96500", media: "#765C86", cover: "#527985", climate: "#B6533A" }
  },
  {
    id: "quiet-sage", label: "B · Rustig salie", note: "natuurlijk en huiselijk",
    colors: { bg: "#EEF2ED", surface: "#FCFDFB", raised: "#F5F8F4", mutedSurface: "#E3E9E2", text: "#202923", muted: "#617067", border: "#D3DDD4", brand: "#456F5C", soft: "#DDEBE3", hero: "#456F5C", light: "#A66A00", media: "#6F5C86", cover: "#3F7580", climate: "#B4513D" }
  },
  {
    id: "soft-slate", label: "C · Zacht leisteen", note: "maximaal neutraal en rustig",
    colors: { bg: "#EFF2F4", surface: "#FFFFFF", raised: "#F7F9FA", mutedSurface: "#E5EAED", text: "#20282D", muted: "#66737B", border: "#D5DDE2", brand: "#526975", soft: "#E1E9ED", hero: "#526975", light: "#A96800", media: "#6D6084", cover: "#467783", climate: "#AF5540" }
  },
  {
    id: "muted-petrol", label: "D · Gedempt petrol", note: "koel, maar minder uitgesproken dan blauw",
    colors: { bg: "#ECF2F2", surface: "#FBFDFD", raised: "#F3F8F8", mutedSurface: "#DFE9E9", text: "#193033", muted: "#5C7072", border: "#CFDDDE", brand: "#316B6D", soft: "#D8E9E9", hero: "#316B6D", light: "#A76A00", media: "#6D5D86", cover: "#30757C", climate: "#B2503D" }
  }
];

const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
await page.addInitScript(() => {
  const RealDate = Date;
  window.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : ["2026-09-07T08:00:00+02:00"])); }
    static now() { return new RealDate("2026-09-07T08:00:00+02:00").getTime(); }
  };
});

for (const palette of palettes) {
  await page.goto("http://127.0.0.1:4173/room-controls.html");
  await page.waitForFunction(() => window.roomFixture?.home?.shadowRoot?.querySelector("home-dashboard-room-controls"));
  await page.evaluate(({ colors, label, note }) => {
    const fixture = window.roomFixture;
    const room = fixture.config.rooms[0];
    const secondLight = ["light", "second_fixture"].join(".");
    const secondCover = ["cover", "second_fixture"].join(".");
    fixture.hass.states[secondLight] = { state: "on", attributes: { friendly_name: "Leeslamp", icon: "mdi:floor-lamp" } };
    fixture.hass.states[secondCover] = { state: "closed", attributes: { friendly_name: "Rolluik terras", supported_features: 11, device_class: "shutter", icon: "mdi:blinds-horizontal" } };
    room.control_entities = [room.control_cover_entity, secondLight, room.control_light_entity, secondCover, room.control_awning_entity, room.control_media_entity, room.hvac.entity];
    fixture.home.setConfig({ ...fixture.config, type: "custom:home-dashboard-home-overview", theme_mode: "light" });
    fixture.home.hass = fixture.hass;
    const vars = {
      "--primary-background-color": colors.bg, "--secondary-background-color": colors.mutedSurface,
      "--card-background-color": colors.surface, "--ha-card-background": colors.surface,
      "--primary-text-color": colors.text, "--secondary-text-color": colors.muted,
      "--divider-color": colors.border, "--primary-color": colors.brand,
      "--hd-surface": colors.surface, "--hd-surface-raised": colors.raised,
      "--hd-surface-muted": colors.mutedSurface, "--hd-text": colors.text,
      "--hd-muted": colors.muted, "--hd-border": colors.border,
      "--hd-brand": colors.brand, "--hd-brand-soft": colors.soft, "--hd-hero": colors.hero,
      "--state-light-active-color": colors.light, "--state-media-player-active-color": colors.media,
      "--state-cover-active-color": colors.cover, "--state-climate-heat-color": colors.climate
    };
    for (const [property, value] of Object.entries(vars)) {
      document.body.style.setProperty(property, value);
      fixture.home.style.setProperty(property, value);
    }
    document.body.style.background = colors.bg;
    document.body.style.color = colors.text;
    document.querySelector("#fixture-note").textContent = `${label} · ${note}`;
  }, palette);
  await page.getByRole("button", { name: "Bediening Woonkamer", exact: true }).click();
  await page.screenshot({ path: `${directory}/${palette.id}.png`, fullPage: true });
  await page.locator("home-dashboard-room-controls").first().screenshot({ path: `${directory}/${palette.id}-actions.png` });
}

async function comparison(suffix, title, description) {
  const cards = await Promise.all(palettes.map(async palette => ({
    ...palette,
    image: (await readFile(`${directory}/${palette.id}${suffix}.png`)).toString("base64")
  })));
  await page.setViewportSize({ width: 1600, height: 1200 });
  await page.setContent(`<!doctype html><html lang="nl"><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;padding:34px;background:#f2f3f3;color:#202629;font:15px Arial,sans-serif}h1{margin:0 0 8px;font-size:30px}p{margin:0 0 28px;color:#647078}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.card{overflow:hidden;border:1px solid #d8dddf;border-radius:18px;background:white;box-shadow:0 8px 28px #2531380d}.head{display:flex;justify-content:space-between;align-items:center;padding:15px 17px}.head strong{font-size:18px}.head span{color:#66737a}.swatches{display:flex;gap:5px}.swatches i{width:20px;height:20px;border-radius:50%;border:1px solid #0001}.card img{display:block;width:100%;height:auto;border-top:1px solid #e0e4e5}
  </style><body><h1>${title}</h1><p>${description}</p><div class="grid">${cards.map(card => `<article class="card"><div class="head"><span><strong>${card.label}</strong><br>${card.note}</span><span class="swatches">${[card.colors.bg, card.colors.hero, card.colors.light, card.colors.cover, card.colors.climate].map(color => `<i style="background:${color}"></i>`).join("")}</span></div><img src="data:image/png;base64,${card.image}" alt="${card.label}"></article>`).join("")}</div></body></html>`);
  await page.screenshot({ path: `${directory}/${suffix ? "actions-comparison" : "dashboard-comparison"}.png`, fullPage: true });
}

await comparison("", "Vier rustige kleurpaletten", "Dezelfde informatie, states en lay-out; alleen achtergrond, merkvlak en semantische accenten verschillen.");
await comparison("-actions", "Quick actions per kleurpalet", "Actieve states blijven duidelijk, terwijl de algemene interface rustig blijft.");
await browser.close();
console.log(`Paletrenders gemaakt: ${palettes.length * 2 + 2} bestanden in ${directory}.`);
