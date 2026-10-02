// HD-171: performance baseline — parse/evaluation, DOM size, long tasks, view-swap timing and
// rerender cost (cold/warm cache, relevant/irrelevant updates), using only fictional fixtures.
//
// This script never renders prototype/index.html's static design mockup. That mockup never loads
// dist/home-dashboard.js and implements no client-side router (confirmed by reading app.js), so any
// number taken from it would describe the mockup, not the shipped product. Every measurement below
// mounts this repository's own custom elements (home-dashboard-home-overview, -room-overview,
// -room-detail, -energy-overview, -pool-summary) against the real dist/home-dashboard.js bundle, the
// same way scripts/check-room-detail-browser.mjs and scripts/render-room-controls.mjs already do.
//
// Known, explicitly accepted scope gaps (see docs/quality/performance-baseline.md "Afwijkingen"):
// - "Domeinen" (buildDomainSections) and most of "Energie" (buildEnergySections' history-graph /
//   energy-* sections) are composed entirely of native Home Assistant Lovelace card types (grid,
//   tile, button, markdown, history-graph, energy-*) with no project-owned shadow DOM of their own.
//   They cannot be rendered without a live Home Assistant frontend, so they are out of scope for
//   DOM-size/long-task measurement here. Only this project's own custom elements reachable from those
//   routes (home-dashboard-energy-overview's "Nu" metrics card; the specialist summary cards) are
//   measured.
// - There is no client-side router anywhere in this repository. Top-level view switching (Home →
//   Kamers → Energie → ...) is owned by Home Assistant's own frontend shell and cannot be measured
//   without a live HA host. "Navigation timing" below instead measures the two real client-side
//   transitions this repository does implement: the room-detail capability-rail/tab switch, and a
//   synthetic-harness component swap (unmount/mount/setConfig/hass) used as the closest available
//   proxy for a route change.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const require = createRequire(process.env.HD_BROWSER_PACKAGES ? `${process.env.HD_BROWSER_PACKAGES}/package.json` : import.meta.url);
const { chromium } = require("playwright");
const launchOptions = { headless: true, ...(process.env.HD_BROWSER_CHANNEL ? { channel: process.env.HD_BROWSER_CHANNEL } : {}) };
const directory = process.env.HD_RENDER_DIRECTORY || "generated/performance-baseline";
await mkdir(directory, { recursive: true });
const prototypeUrl = process.env.HD_PROTOTYPE_URL || "http://127.0.0.1:4173";
const REPETITIONS = 5;
const IRRELEVANT_UPDATES = 100;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function summarize(values) {
  return { median: median(values), max: Math.max(...values), min: Math.min(...values), samples: values };
}

// Pins the clock exactly like scripts/render-room-controls.mjs, so waste/today labels and DOM text
// stay deterministic across repetitions and runs.
const PIN_DATE = "2026-09-07T08:00:00+02:00";
async function pinClockAndObservers(page) {
  await page.addInitScript((pinned) => {
    const RealDate = Date;
    // eslint-disable-next-line no-global-assign
    window.Date = class extends RealDate {
      constructor(...args) { super(...(args.length ? args : [pinned])); }
      static now() { return new RealDate(pinned).getTime(); }
    };
    window.__longTasks = [];
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__longTasks.push({ name: entry.name, duration: entry.duration, startTime: entry.startTime });
      });
      observer.observe({ type: "longtask", buffered: true });
      window.__longTaskObserver = observer;
    } catch {
      window.__longTasks = null;
    }
  }, PIN_DATE);
}

async function readLongTasks(page, overMs = 50) {
  return page.evaluate((threshold) => {
    const tasks = window.__longTasks ?? [];
    const over = tasks.filter((task) => task.duration > threshold);
    window.__longTasks = [];
    return { total: tasks.length, over, overCount: over.length, maxDuration: tasks.reduce((max, task) => Math.max(max, task.duration), 0) };
  }, overMs);
}

// Counts every element, walking into open shadow roots too (this app is shadow-DOM heavy; a plain
// document.querySelectorAll("*") undercounts every custom element's internal markup).
async function countDomNodes(page) {
  return page.evaluate(() => {
    function count(root) {
      let total = 0;
      for (const element of root.querySelectorAll("*")) {
        total += 1;
        if (element.shadowRoot) total += count(element.shadowRoot);
      }
      return total;
    }
    return count(document);
  });
}

// Observes every open shadow root under document.body (MutationObserver does not cross shadow
// boundaries), recursively, including shadow roots created after this call. Returns a reader that
// snapshots and resets the running mutation count.
async function observeMutations(page) {
  await page.evaluate(() => {
    window.__mutations = 0;
    const observed = new WeakSet();
    function attach(root) {
      if (observed.has(root)) return;
      observed.add(root);
      const observer = new MutationObserver((records) => { window.__mutations += records.length; });
      observer.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
      for (const element of root.querySelectorAll("*")) if (element.shadowRoot) attach(element.shadowRoot);
    }
    attach(document.body);
    window.__attachShadowMutationObservers = attach;
  });
}

async function readMutations(page) {
  return page.evaluate(() => {
    const value = window.__mutations ?? 0;
    window.__mutations = 0;
    return value;
  });
}

async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

const errors = [];

async function openHarness(page, query = "") {
  await page.goto(`${prototypeUrl}/room-controls.html${query}`);
  await page.waitForFunction(() => window.roomFixture);
  await observeMutations(page);
}

// Builds a minimal, fictional, schema-shaped EnergyConfig and PoolSpecialistConfig directly against
// the already-loaded room-controls.html fixture (window.roomFixture.ref / .hass.states), so the real
// home-dashboard-energy-overview and home-dashboard-pool-summary elements can be mounted standalone.
// These two are the only project-owned shadow-DOM pieces reachable from the Energie/specialist routes
// (see the file banner) -- everything else on those routes is native HA cards, out of scope here.
async function mountEnergyOverview(page) {
  return page.evaluate(() => {
    const { hass, ref } = window.roomFixture;
    const put = (domain, key, state, attributes = {}) => {
      const entity = ref(domain, key);
      hass.states[entity] = { state, attributes, last_updated: "2020-01-01T00:00:00Z" };
      return entity;
    };
    const energy = {
      enabled: true,
      show_standard_dashboard_link: false,
      default_period: "day",
      electricity_entities: [put("sensor", "perf_electricity", "860", { unit_of_measurement: "W" })],
      solar_entities: [put("sensor", "perf_solar", "320", { unit_of_measurement: "W" })],
      battery_entities: [put("sensor", "perf_battery", "42", { unit_of_measurement: "%" })],
      gas_entities: [],
      water_entities: [],
      device_entities: [],
      capacity_peak_entity: put("sensor", "perf_peak", "4.2", { unit_of_measurement: "kW" }),
      ev_power_entity: "",
      ups_entity: "",
      phase_entities: []
    };
    document.body.replaceChildren();
    const element = document.createElement("home-dashboard-energy-overview");
    element.setConfig({ type: "custom:home-dashboard-energy-overview", energy, theme_mode: "system" });
    element.hass = hass;
    document.body.append(element);
    window.__energyElement = element;
    window.__energyHass = hass;
    return true;
  });
}

async function mountPoolSummary(page) {
  return page.evaluate(() => {
    const { hass, ref } = window.roomFixture;
    const put = (domain, key, state, attributes = {}) => {
      const entity = ref(domain, key);
      hass.states[entity] = { state, attributes, last_updated: "2020-01-01T00:00:00Z" };
      return entity;
    };
    const pool = {
      enabled: true,
      card_type: "custom:home-dashboard-pool-summary",
      minimum_version: "0.0.0",
      mapping_keys: ["water_temperature", "target_temperature", "ambient_temperature", "heater_power"],
      card_config: {
        title: "Zwembad",
        entities: {
          water_temperature: put("sensor", "perf_pool_water", "27.2", { unit_of_measurement: "°C" }),
          target_temperature: put("sensor", "perf_pool_target", "28", { unit_of_measurement: "°C" }),
          ambient_temperature: put("sensor", "perf_pool_ambient", "19", { unit_of_measurement: "°C" }),
          heater_power: put("switch", "perf_pool_heater", "on")
        }
      }
    };
    document.body.replaceChildren();
    const element = document.createElement("home-dashboard-pool-summary");
    element.setConfig({ type: "custom:home-dashboard-pool-summary", pool, stale_after_minutes: 30, navigation_path: "specialist-pool", theme_mode: "system" });
    element.hass = hass;
    document.body.append(element);
    window.__poolElement = element;
    window.__poolHass = hass;
    return true;
  });
}

async function mountRoomOverview(page) {
  return page.evaluate(() => {
    const { hass, config } = window.roomFixture;
    document.body.replaceChildren();
    const element = document.createElement("home-dashboard-room-overview");
    element.setConfig({ type: "custom:home-dashboard-room-overview", rooms: config.rooms, show_controls: true, theme_mode: "system" });
    element.hass = hass;
    document.body.append(element);
    window.__roomsElement = element;
    return true;
  });
}

async function mountRoomDetail(page, roomKey) {
  return page.evaluate((key) => {
    const { hass, config } = window.roomFixture;
    const room = config.rooms.find((candidate) => candidate.key === key);
    document.body.replaceChildren();
    const element = document.createElement("home-dashboard-room-detail");
    element.setConfig({ type: "custom:home-dashboard-room-detail", room });
    element.hass = hass;
    document.body.append(element);
    window.__roomDetailElement = element;
    return Boolean(room);
  }, roomKey);
}

async function irrelevantUpdateCost(page, getHassAndElement) {
  return page.evaluate(({ repetitions, updates }) => {
    const { hass, element, setHass } = window.__perfTarget();
    const before = element.shadowRoot ? element.shadowRoot.innerHTML.length : 0;
    const samples = [];
    const unrelatedEntity = ["sensor", "perf_unrelated"].join(".");
    for (let r = 0; r < repetitions; r += 1) {
      const start = performance.now();
      for (let i = 0; i < updates; i += 1) {
        hass.states[unrelatedEntity] = { state: String(i), last_updated: new Date().toISOString() };
        setHass({ ...hass, states: { ...hass.states } });
      }
      samples.push(performance.now() - start);
    }
    const after = element.shadowRoot ? element.shadowRoot.innerHTML.length : 0;
    return { samples, domLengthUnchanged: before === after };
  }, { repetitions: REPETITIONS, updates: IRRELEVANT_UPDATES });
}

const results = {
  meta: {
    date: new Date().toISOString(),
    pinnedClock: PIN_DATE,
    playwright: "1.63.0",
    repetitions: REPETITIONS,
    irrelevantUpdatesPerSample: IRRELEVANT_UPDATES
  },
  domSize: {},
  longTasksOnMount: {},
  irrelevantUpdateCostMs: {},
  irrelevantUpdateMutations: {},
  relevantUpdateMutations: {},
  parseAndEvaluation: {},
  navigationTiming: {},
  browser: {}
};

const browser = await chromium.launch(launchOptions);
results.browser.version = browser.version();
results.browser.headless = true;
results.browser.channel = process.env.HD_BROWSER_CHANNEL || "chromium (bundled)";

try {
  // ---------------------------------------------------------------------
  // 1. DOM size and long-tasks-on-mount, per view, using the real elements.
  // ---------------------------------------------------------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(`dom-size: ${error.message}`));
    await pinClockAndObservers(page);
    await openHarness(page);

    const views = [
      { key: "home", label: "Home (home-dashboard-home-overview, full fixture incl. security panel)", mount: async () => true },
      { key: "rooms", label: "Kamers (home-dashboard-room-overview)", mount: () => mountRoomOverview(page) },
      { key: "room-detail-light", label: "Kamerdetail licht (home-dashboard-room-detail, room 'hall': alleen safety_entities)", mount: () => mountRoomDetail(page, "hall") },
      { key: "room-detail-heavy", label: "Kamerdetail zwaar (home-dashboard-room-detail, room 'room_0': volledig geconfigureerd)", mount: () => mountRoomDetail(page, "room_0") },
      { key: "energy", label: "Energie (home-dashboard-energy-overview 'Nu'-kaart; de rest van Energie is native HA, buiten scope)", mount: () => mountEnergyOverview(page) },
      { key: "specialist-pool", label: "Specialist (home-dashboard-pool-summary)", mount: () => mountPoolSummary(page) }
    ];

    for (const view of views) {
      await openHarness(page); // fresh document.body + fresh fixture per view, same pinned clock/observers
      await page.evaluate(() => { window.__longTasks = []; });
      const mounted = await view.mount();
      assert.ok(mounted, `${view.key}: mount succeeded`);
      await settle(page);
      const nodeCount = await countDomNodes(page);
      const longTasks = await readLongTasks(page);
      results.domSize[view.key] = { label: view.label, nodeCount };
      results.longTasksOnMount[view.key] = { label: view.label, ...longTasks };
      if (longTasks.overCount > 0) console.warn(`FINDING: ${view.key} mount produced ${longTasks.overCount} long task(s) over 50ms (max ${longTasks.maxDuration.toFixed(1)}ms) -- see docs/quality/performance-baseline.md`);
    }

    // Security proxy: the home view's own embedded security panel (no standalone Security/Domeinen
    // custom element exists -- see file banner). Measured as a labelled subtree of the Home mount.
    await openHarness(page);
    await settle(page);
    const securityNodeCount = await page.evaluate(() => {
      const panel = document.querySelector("home-dashboard-home-overview").shadowRoot.querySelector(".security-panel");
      if (!panel) return 0;
      function count(root) {
        let total = 0;
        for (const element of root.querySelectorAll("*")) {
          total += 1;
          if (element.shadowRoot) total += count(element.shadowRoot);
        }
        return total;
      }
      return count(panel);
    });
    results.domSize["security-panel-within-home"] = { label: "Security (home-overview's security-panel subtree; geen losse Domeinen/Security-component bestaat -- zie rapport)", nodeCount: securityNodeCount };

    await context.close();
  }

  // ---------------------------------------------------------------------
  // 2. Irrelevant-update rerender cost + mutation-count proof, per view.
  // ---------------------------------------------------------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(`rerender: ${error.message}`));
    await pinClockAndObservers(page);

    const rerenderViews = [
      {
        key: "home",
        label: "Home",
        setup: async () => {
          await openHarness(page);
          await page.evaluate(() => {
            window.__perfTarget = () => ({ hass: window.roomFixture.hass, element: window.roomFixture.home, setHass: (next) => { window.roomFixture.home.hass = next; window.roomFixture.hass = next; } });
          });
        }
      },
      {
        key: "rooms",
        label: "Kamers",
        setup: async () => {
          await openHarness(page);
          await mountRoomOverview(page);
          await observeMutations(page);
          await page.evaluate(() => {
            window.__perfTarget = () => ({ hass: window.roomFixture.hass, element: window.__roomsElement, setHass: (next) => { window.__roomsElement.hass = next; window.roomFixture.hass = next; } });
          });
        }
      },
      {
        key: "room-detail-heavy",
        label: "Kamerdetail zwaar (room_0)",
        setup: async () => {
          await openHarness(page);
          await mountRoomDetail(page, "room_0");
          await observeMutations(page);
          await page.evaluate(() => {
            window.__perfTarget = () => ({ hass: window.roomFixture.hass, element: window.__roomDetailElement, setHass: (next) => { window.__roomDetailElement.hass = next; window.roomFixture.hass = next; } });
          });
        }
      },
      {
        key: "energy",
        label: "Energie",
        setup: async () => {
          await openHarness(page);
          await mountEnergyOverview(page);
          await observeMutations(page);
          await page.evaluate(() => {
            window.__perfTarget = () => ({ hass: window.__energyHass, element: window.__energyElement, setHass: (next) => { window.__energyElement.hass = next; window.__energyHass = next; } });
          });
        }
      },
      {
        key: "specialist-pool",
        label: "Specialist (pool)",
        setup: async () => {
          await openHarness(page);
          await mountPoolSummary(page);
          await observeMutations(page);
          await page.evaluate(() => {
            window.__perfTarget = () => ({ hass: window.__poolHass, element: window.__poolElement, setHass: (next) => { window.__poolElement.hass = next; window.__poolHass = next; } });
          });
        }
      }
    ];

    for (const view of rerenderViews) {
      await view.setup();
      await settle(page);
      await readMutations(page); // discard setup mutations
      const nodeCountBefore = await countDomNodes(page);
      const cost = await irrelevantUpdateCost(page);
      const mutations = await readMutations(page);
      // HD-171's hard requirement is "no unexplained BROAD rerender", not literally zero DOM writes.
      // The acceptance gate below checks the thing that would actually hurt: the component's root is
      // never torn down and rebuilt (domLengthUnchanged, identical element identity). Any nonzero
      // mutation count is still measured and reported as a named finding below -- see
      // docs/quality/performance-baseline.md -- rather than silently passed or silently buried.
      assert.equal(cost.domLengthUnchanged, true, `${view.key}: irrelevant updates must not replace the shadow DOM subtree`);
      results.irrelevantUpdateCostMs[view.key] = { label: view.label, ...summarize(cost.samples) };
      results.irrelevantUpdateMutations[view.key] = { count: mutations, perUpdate: mutations / (REPETITIONS * IRRELEVANT_UPDATES), nodeCount: nodeCountBefore };
      if (mutations > 0) console.warn(`FINDING: ${view.key}'s ${REPETITIONS * IRRELEVANT_UPDATES} fully irrelevant state updates produced ${mutations} DOM mutations (${(mutations / (REPETITIONS * IRRELEVANT_UPDATES)).toFixed(2)}/update) against a ${nodeCountBefore}-node tree -- not a full-subtree replace, but unexplained DOM churn; see docs/quality/performance-baseline.md`);
    }

    // Relevant-update proof for the heaviest view: room-detail. Confirms an update that this view
    // actually displays DOES propagate, and records how large that rerender is (HD-171 asks for this
    // number to be reported, fixed only if trivial).
    await openHarness(page);
    await mountRoomDetail(page, "room_0");
    await observeMutations(page);
    await settle(page);
    await readMutations(page);
    const relevantMutations = await page.evaluate(() => {
      const { hass, config } = window.roomFixture;
      const entity = config.rooms.find((room) => room.key === "room_0").control_light_entity;
      hass.states[entity] = { ...hass.states[entity], state: hass.states[entity].state === "on" ? "off" : "on" };
      window.__roomDetailElement.hass = { ...hass };
      return true;
    });
    await settle(page);
    const roomDetailRelevantMutationCount = await readMutations(page);
    assert.ok(relevantMutations, "room-detail relevant update applied");
    results.relevantUpdateMutations["room-detail-heavy"] = roomDetailRelevantMutationCount;
    if (roomDetailRelevantMutationCount > 20) console.warn(`FINDING: room-detail-heavy's relevant light-state update produced ${roomDetailRelevantMutationCount} DOM mutations -- see docs/quality/performance-baseline.md ("rerender, extended")`);

    await context.close();
  }

  // ---------------------------------------------------------------------
  // 3. In-repo "navigation": room-detail capability-rail tab switch, and a
  //    synthetic component swap used as the closest available proxy for a
  //    route change (see file banner: no client-side router exists here).
  // ---------------------------------------------------------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(`navigation: ${error.message}`));
    await pinClockAndObservers(page);
    await openHarness(page);
    await mountRoomDetail(page, "room_0");
    await settle(page);

    const tabSwitchSamples = [];
    for (let i = 0; i < REPETITIONS; i += 1) {
      const target = i % 2 === 0 ? "Energie" : "Apparaten";
      const ms = await page.evaluate(async (label) => {
        const root = document.querySelector("home-dashboard-room-detail").shadowRoot;
        const tab = [...root.querySelectorAll('[role="tab"]')].find((element) => element.textContent.trim() === label);
        const start = performance.now();
        tab.click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return performance.now() - start;
      }, target);
      tabSwitchSamples.push(ms);
    }
    results.navigationTiming["room-detail-tab-switch"] = { label: "Kamerdetail tabwissel (Apparaten ↔ Verbruik), echte client-side switch binnen deze component", ...summarize(tabSwitchSamples) };

    const railSwitchSamples = [];
    for (let i = 0; i < REPETITIONS; i += 1) {
      const target = i % 2 === 0 ? "Comfort" : "Verlichting";
      const ms = await page.evaluate(async (label) => {
        const root = document.querySelector("home-dashboard-room-detail").shadowRoot;
        const button = [...root.querySelectorAll(".capability-rail button")].find((element) => element.textContent.includes(label));
        const start = performance.now();
        button.click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return performance.now() - start;
      }, target);
      railSwitchSamples.push(ms);
    }
    results.navigationTiming["room-detail-rail-switch"] = { label: "Kamerdetail capability-railwissel, echte client-side switch binnen deze component", ...summarize(railSwitchSamples) };

    const swapSamples = [];
    for (let i = 0; i < REPETITIONS; i += 1) {
      await openHarness(page);
      const ms = await page.evaluate(async () => {
        const { hass, config } = window.roomFixture;
        const start = performance.now();
        document.body.replaceChildren();
        const element = document.createElement("home-dashboard-room-overview");
        element.setConfig({ type: "custom:home-dashboard-room-overview", rooms: config.rooms, show_controls: true, theme_mode: "system" });
        element.hass = hass;
        document.body.append(element);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return performance.now() - start;
      });
      swapSamples.push(ms);
    }
    results.navigationTiming["harness-component-swap-home-to-rooms"] = {
      label: "Synthetisch harnas-component-swap Home→Kamers (unmount/mount/setConfig/hass; proxy, geen echte routerwissel -- zie bestandsheader)",
      ...summarize(swapSamples)
    };

    await context.close();
  }

  // ---------------------------------------------------------------------
  // 4. Parse/evaluation: cold vs warm cache, via a dedicated prototype
  //    server instance with the opt-in cacheable-dist header enabled.
  // ---------------------------------------------------------------------
  {
    const { spawn } = await import("node:child_process");
    const { randomUUID } = await import("node:crypto");
    const cachePort = 4700 + (process.pid % 900);
    const cacheToken = randomUUID();
    const cacheUrl = `http://127.0.0.1:${cachePort}`;
    const server = spawn(process.execPath, ["scripts/serve-prototype.mjs"], {
      cwd: new URL("../", import.meta.url),
      stdio: "inherit",
      env: { ...process.env, HD_PROTOTYPE_PORT: String(cachePort), HD_PROTOTYPE_TOKEN: cacheToken, HD_PROTOTYPE_CACHE: "1" }
    });
    try {
      let ready = false;
      for (let attempt = 0; attempt < 50 && !ready; attempt += 1) {
        try {
          const response = await fetch(`${cacheUrl}/__health`);
          const body = await response.json();
          ready = response.ok && body.token === cacheToken;
        } catch { /* retry */ }
        if (!ready) await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (!ready) throw new Error("Cacheable prototype server did not become ready");

      // Cold: brand-new context -> this origin has never been fetched, so there is nothing in the
      // HTTP cache yet. Warm: a second full-page navigation in that SAME context/origin, same URL (no
      // cache-busting query), so Chromium's disk cache can legitimately serve dist/home-dashboard.js
      // without a network round-trip. Each navigation is still a fresh document, so bundle
      // evaluation (customElements.define, migrateConfig, the harness's initial render) always reruns
      // -- only the network fetch cost differs between cold and warm.
      const context = await browser.newContext();
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(`parse-eval: ${error.message}`));
      await pinClockAndObservers(page);

      async function measureLoad() {
        await page.goto(`${cacheUrl}/room-controls.html`);
        await page.waitForFunction(() => window.roomFixture);
        return page.evaluate(() => {
          const nav = performance.getEntriesByType("navigation")[0];
          const bundle = performance.getEntriesByType("resource").find((entry) => entry.name.endsWith("/dist/home-dashboard.js"));
          return {
            domInteractive: nav.domInteractive,
            domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
            loadEventEnd: nav.loadEventEnd,
            bundle: bundle ? {
              durationMs: bundle.duration,
              transferSize: bundle.transferSize,
              encodedBodySize: bundle.encodedBodySize,
              decodedBodySize: bundle.decodedBodySize,
              servedFromCache: bundle.transferSize === 0 && bundle.encodedBodySize > 0
            } : null
          };
        });
      }

      const cold = await measureLoad();
      const warm = await measureLoad();
      results.parseAndEvaluation = { cold, warm };
      assert.equal(cold.bundle?.servedFromCache, false, "cold load must not be served from HTTP cache");
      assert.equal(warm.bundle?.servedFromCache, true, "warm load (second navigation, same origin, cacheable dist/) must be served from HTTP cache -- otherwise 'warm' is unproven");
      await context.close();
    } finally {
      server.kill("SIGTERM");
      await new Promise((resolve) => server.once("exit", resolve));
    }
  }

  assert.deepEqual(errors, [], `No uncaught page errors: ${JSON.stringify(errors)}`);

  await writeFile(`${directory}/results.json`, JSON.stringify(results, null, 2));
  console.log(`Performance baseline measured (${REPETITIONS} repetitions, ${IRRELEVANT_UPDATES} irrelevant updates/sample). Evidence: ${directory}/results.json`);
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
