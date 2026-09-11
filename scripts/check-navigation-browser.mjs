import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const require = createRequire(process.env.HD_BROWSER_PACKAGES ? `${process.env.HD_BROWSER_PACKAGES}/package.json` : import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.HD_BROWSER_CHANNEL ? { channel: process.env.HD_BROWSER_CHANNEL } : {}) });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
// A synthetic HA shell: tests the actual card and its DOM boundary, not a live installation.
async function mount(mode = 'kiosk', admin = true) {
  await page.goto('http://127.0.0.1:4173/room-controls.html');
  await page.waitForFunction(() => window.roomFixture);
  await page.evaluate(async ({ mode, admin }) => {
    await import('/dist/home-dashboard.js');
    document.body.replaceChildren();
    const root = document.createElement('hui-root');
    const shadow = root.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>:host{display:block;--header-height:56px}.header{height:56px}hui-view-container{display:block;padding-top:var(--header-height)}</style><div class="shell"><div class="header">Home Assistant<ha-icon-button></ha-icon-button></div><hui-view-container></hui-view-container></div>';
    const edit = shadow.querySelector('ha-icon-button');
    edit.label = 'Edit dashboard';
    edit.addEventListener('click', () => { window.editorOpened = true; });
    const hass = { user: { is_admin: admin }, localize: key => key === 'ui.panel.lovelace.menu.configure_ui' ? 'Edit dashboard' : key };
    const nav = document.createElement('home-dashboard-navigation');
    nav.setConfig({ type: 'custom:home-dashboard-navigation', active: 'home', navigation_mode: mode, palette: 'quiet_sage', theme_mode: 'light' });
    nav.hass = hass;
    shadow.querySelector('hui-view-container').append(nav);
    document.body.append(root);
    window.navigationFixture = { root, shadow, nav, hass, mode };
    window.editorOpened = false;
  }, { mode, admin });
}
try {
  await mount();
  assert.equal(await page.locator('hui-root .header').isVisible(), false, 'kiosk must actually hide the HA header without another resource');
  assert.equal(await page.locator('hui-view-container').evaluate(el => getComputedStyle(el).paddingTop), '0px');
  if (process.env.HD_KIOSK_ONLY === '1') {
    console.log('Kiosk header regression passed.');
  } else {
    await page.getByRole('button', { name: 'Dashboard instellen', exact: true }).click();
    assert.equal(await page.evaluate(() => editorOpened), true, 'must invoke the native dashboard editor');
    await mount();
    await page.evaluate(() => {
      const f = navigationFixture;
      f.shadow.querySelector('ha-icon-button').remove();
      const dropdown = document.createElement('ha-dropdown');
      const item = document.createElement('ha-dropdown-item');
      item.value = 'ui.panel.lovelace.menu.configure_ui';
      item.data = { overflowAction: () => { window.editorOpened = true; } };
      dropdown.append(item);
      dropdown.addEventListener('wa-select', event => event.detail.item.data.overflowAction());
      f.shadow.querySelector('.header').append(dropdown);
    });
    await page.getByRole('button', { name: 'Dashboard instellen', exact: true }).click();
    assert.equal(await page.evaluate(() => editorOpened), true, 'native overflow menu must open the same editor');
    await mount();
    await page.evaluate(() => navigationFixture.shadow.querySelector('ha-icon-button').remove());
    await page.getByRole('button', { name: 'Dashboard instellen', exact: true }).click();
    assert.equal(await page.locator('hui-root .header').isVisible(), true, 'unknown editor markup must fail open');
    assert.equal(await page.getByRole('link', { name: 'Dashboardbeheer openen' }).getAttribute('href'), '/config/lovelace/dashboards');
    assert.equal(await page.evaluate(() => editorOpened), false);
    await mount();
    const performance = await page.evaluate(() => {
      const f = navigationFixture;
      const button = f.nav.shadowRoot.querySelector('button');
      const start = window.performance.now();
      for (let i = 0; i < 100; i++) f.nav.hass = { ...f.hass };
      return { same: button === f.nav.shadowRoot.querySelector('button'), ms: window.performance.now() - start };
    });
    assert.equal(performance.same, true, 'unrelated HA updates must preserve navigation DOM and focus');
    await page.getByRole('button', { name: 'Dashboard instellen', exact: true }).focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => editorOpened), true);
    await page.evaluate(() => {
      const f = navigationFixture;
      history.replaceState(null, '', '?disable_km');
      f.nav.setConfig({ type: 'custom:home-dashboard-navigation', active: 'home', navigation_mode: 'kiosk' });
    });
    assert.equal(await page.locator('hui-root .header').isVisible(), true, 'URL recovery must override kiosk');
    assert.equal(await page.getByRole('link', { name: 'Home', exact: true }).getAttribute('href'), 'home?disable_km');
    await mount('integrated');
    assert.equal(await page.locator('hui-root .header').isVisible(), true);
    await mount('kiosk', false);
    assert.equal(await page.getByRole('button', { name: 'Dashboard instellen', exact: true }).count(), 0);
    await mount();
    await page.evaluate(() => navigationFixture.shadow.querySelector('.shell').classList.add('edit-mode'));
    assert.equal(await page.locator('hui-root .header').isVisible(), true, 'native editing must reveal the header');
    await page.evaluate(() => navigationFixture.shadow.querySelector('.shell').classList.remove('edit-mode'));
    assert.equal(await page.locator('hui-root .header').isVisible(), false);
    await page.evaluate(() => navigationFixture.nav.remove());
    assert.equal(await page.locator('hui-root .header').isVisible(), true, 'leaving must restore the HA header');
    await mount();
    await page.getByRole('button', { name: 'Home Assistant-balk tonen', exact: true }).click();
    assert.equal(await page.locator('hui-root .header').isVisible(), true);
    await page.getByRole('button', { name: 'Kiosk hervatten', exact: true }).click();
    assert.equal(await page.locator('hui-root .header').isVisible(), false);
    for (const width of [390, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await mount('integrated');
      let baseline;
      let linkPositions;
      for (const active of ['home', 'rooms', 'energy', 'domains', 'more', 'room', 'specialist-kia']) {
        await page.evaluate(active => {
          const f = navigationFixture;
          f.nav.setConfig({ type: 'custom:home-dashboard-navigation', active, navigation_mode: 'integrated', palette: 'quiet_sage', theme_mode: 'light' });
          f.nav.hass = f.hass;
        }, active);
        const rect = await page.getByRole('navigation').boundingBox();
        if (!baseline) baseline = rect;
        assert.deepEqual(rect, baseline, `navigation geometry must stay fixed: ${width}/${active}`);
        const positions = await page.locator('nav a,nav button').evaluateAll(nodes => nodes.map(node => { const r = node.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }));
        if (!linkPositions) linkPositions = positions;
        assert.deepEqual(positions, linkPositions, `individual controls must not move: ${width}/${active}`);
        const current = active === 'room' ? 'rooms' : active === 'specialist-kia' ? 'domains' : active;
        assert.equal(await page.locator('nav a[aria-current="page"]').getAttribute('href'), current);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        assert.equal(await page.locator('nav a,nav button').evaluateAll(nodes => nodes.some(node => { const r = node.getBoundingClientRect(); return r.width < 44 || r.height < 44; })), false);
      }
      await mkdir('generated/navigation', { recursive: true });
      await page.screenshot({ path: `generated/navigation/navigation-${width}.png` });
    }
    assert.deepEqual(errors, []);
    console.log('Navigation browser checks passed: identical geometry across seven views and three widths; native editor, admin gate, kiosk, edit recovery, escape and disconnect cleanup. Synthetic shell only; live HA acceptance remains required.');
  }
} finally {
  await browser.close();
}
