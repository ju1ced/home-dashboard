import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const require = createRequire(process.env.HD_BROWSER_PACKAGES ? `${process.env.HD_BROWSER_PACKAGES}/package.json` : import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const directory = 'generated/header-row';
await mkdir(directory, { recursive: true });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => {
  const RealDate = Date;
  window.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : ['2026-09-14T12:00:00Z'])); }
    static now() { return new RealDate('2026-09-14T12:00:00Z').getTime(); }
  };
});
async function settle() {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)))));
}
async function layout() {
  return page.evaluate(() => {
    const root = roomFixture.home.shadowRoot;
    const header = root.querySelector('.top');
    const nav = root.querySelector('home-dashboard-navigation') ?? document.querySelector('home-dashboard-navigation');
    const rect = node => { const r = node.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height, right:r.right, bottom:r.bottom, cx:r.x+r.width/2, cy:r.y+r.height/2 }; };
    return { header:rect(header), intro:rect(header.querySelector('.intro')), pills:rect(header.querySelector('.pills')), chips:[...header.querySelectorAll('.pill')].map(rect), nav:nav ? rect(nav.shadowRoot.querySelector('nav')) : null, controls:nav ? [...nav.shadowRoot.querySelectorAll('nav a,nav button')].map(rect) : [], overflow:document.documentElement.scrollWidth>innerWidth };
  });
}
try {
  for (const mode of ['integrated', 'kiosk']) {
    await page.setViewportSize({ width:1920, height:1000 });
    await page.goto(`http://127.0.0.1:4173/room-controls.html?navigation=${mode}`);
    await page.waitForFunction(() => window.roomFixture);
    await settle();
    const wide = await layout();
    assert.ok(Math.abs(wide.intro.cy - wide.nav.cy) < 1, 'wide header: navigation and greeting must share one horizontal row');
    assert.ok(Math.abs(wide.pills.cy - wide.nav.cy) < 1, 'wide header: status chips share the navigation row');
    assert.ok(Math.abs(wide.intro.cx - wide.header.cx) < 1, 'greeting centred in the complete header');
    assert.ok(wide.controls.at(-1).right < wide.intro.x && wide.intro.right < wide.pills.x, 'no collisions');
    assert.equal(wide.overflow, false);
    await page.screenshot({ path:`${directory}/1920-${mode}.png` });
    await page.setViewportSize({ width:390, height:1000 });
    await settle();
    const mobile = await layout();
    assert.ok(mobile.intro.y >= mobile.nav.bottom, 'mobile greeting below navigation');
    assert.ok(mobile.pills.y >= mobile.intro.bottom, 'mobile chips below greeting');
    assert.equal(mobile.overflow, false);
    assert.ok(mobile.chips.every((chip, index) => !index || chip.y >= mobile.chips[index-1].bottom), 'mobile chips stack');
    await page.screenshot({ path:`${directory}/390-${mode}.png` });
  }
  assert.deepEqual(errors, []);
  console.log('Home single-row regression passed: wide alignment and mobile stacking.');
} finally { await browser.close(); }
