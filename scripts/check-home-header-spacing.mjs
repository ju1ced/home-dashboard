import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const require = createRequire(process.env.HD_BROWSER_PACKAGES ? `${process.env.HD_BROWSER_PACKAGES}/package.json` : import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const directory = process.env.HD_RENDER_DIRECTORY || 'generated/header-spacing';
await mkdir(directory, { recursive: true });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  for (const width of [1440, 1024, 390]) {
    for (const mode of ['integrated', 'kiosk', 'native']) {
      for (const gap of [24, 32]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`http://127.0.0.1:4173/room-controls.html?navigation=${mode}`);
        await page.waitForFunction(() => window.roomFixture);
        // Model the inherited HA Sections gap, not an arbitrary fixture margin.
        await page.evaluate(gap => {
          document.body.style.setProperty('--ha-view-sections-row-gap', `${gap}px`);
          const nav = document.querySelector('home-dashboard-navigation');
          if (nav) nav.style.marginBottom = `${gap}px`;
        }, gap);
        const layout = await page.evaluate(() => {
          const nav = document.querySelector('home-dashboard-navigation');
          const header = roomFixture.home.shadowRoot.querySelector('.top');
          const intro = header.querySelector('.intro').getBoundingClientRect();
          const bounds = header.getBoundingClientRect();
          const navBounds = nav?.getBoundingClientRect();
          return {
            joined: header.classList.contains('joined'),
            seam: navBounds ? bounds.top - navBounds.bottom : null,
            introInset: intro.top - bounds.top,
            padding: parseFloat(getComputedStyle(header).paddingTop),
            overflow: document.documentElement.scrollWidth > innerWidth,
            navigationHeight: navBounds?.height
          };
        });
        console.log(JSON.stringify({ width, mode, gap, ...layout }));
        await page.screenshot({ path: `${directory}/${width}-${mode}-${gap}.png` });
        if (mode !== 'native') {
          assert.equal(layout.joined, true);
          assert.ok(Math.abs(layout.seam) < 1, 'navigation and greeting surfaces meet');
          assert.ok(layout.introInset <= 12, `excess space above greeting: ${layout.introInset}px`);
          assert.equal(layout.navigationHeight, 66, 'navigation geometry stays fixed');
        } else {
          assert.equal(layout.joined, false);
          assert.equal(layout.padding, width <= 700 ? 18 : 24, 'standalone native header keeps its padding');
        }
        assert.equal(layout.overflow, false);
      }
    }
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
