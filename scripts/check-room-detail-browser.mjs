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
      const deckHead = root.querySelector(".deck-head");
      const railButtons = [...root.querySelectorAll(".capability-rail button")];
      const stageHead = root.querySelector(".stage-head");
      const badge = stageHead?.querySelector(".state-badge");
      const deck = root.querySelector(".control-deck");
      const deckStyle = deck ? getComputedStyle(deck) : undefined;
      return {
        heroHasSubtitle: Boolean(root.querySelector(".hero p")),
        deckHasBorder: deckStyle ? deckStyle.borderTopWidth !== "0px" && deckStyle.borderTopStyle !== "none" : false,
        deckHasRadius: deckStyle ? parseFloat(deckStyle.borderTopLeftRadius) > 0 : false,
        deckHasFrame: deckStyle ? deckStyle.boxShadow !== "none" || deckStyle.backgroundColor !== "rgba(0, 0, 0, 0)" : false,
        labels,
        count: cards.length,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        inside: cards.every((card) => card.left >= 0 && card.right <= innerWidth),
        touch: [...root.querySelectorAll("button")].filter(button => button.checkVisibility()).every(button => { const bounds = button.getBoundingClientRect(); return bounds.width >= 44 && bounds.height >= 44; }),
        mobileGrid: mobile && mushroomGrid ? getComputedStyle(mushroomGrid).gridTemplateColumns.split(" ").length : 0,
        tabs: root.querySelectorAll('.detail-tabs [role="tab"]').length,
        tabSelected: root.querySelector('.detail-tabs [role="tab"][aria-selected="true"]')?.textContent,
        railVisible: root.querySelector(".capability-rail").checkVisibility(),
        railButtons: railButtons.length,
        selectedCapabilities: root.querySelectorAll('.capability-rail button[aria-selected="true"]').length,
        deckHeadVisible: Boolean(deckHead?.checkVisibility()),
        deckHeadRoomName: deckHead?.querySelector(".deck-title strong")?.textContent,
        deckHeadCount: deckHead?.querySelector(":scope > span")?.textContent,
        railIconsPresent: railButtons.every((button) => Boolean(button.querySelector("ha-icon svg"))),
        railLabelsPresent: railButtons.every((button) => Boolean(button.querySelector(".mushroom-copy strong")?.textContent)),
        railSummaryCount: railButtons.filter((button) => Boolean(button.querySelector(".mushroom-copy small")?.textContent)).length,
        stageHeadEyebrow: stageHead?.querySelector(".eyebrow")?.textContent,
        stageHeadHasTitle: Boolean(stageHead?.querySelector("h3")),
        stageHeadHasDescription: Boolean(stageHead?.querySelector(":scope > small")),
        stageHeadPrecedesContent: stageHead ? stage.children[0] === stageHead && stage.children[1] !== stageHead : false,
        badgeText: badge?.textContent,
        badgeDegraded: Boolean(badge?.classList.contains("unavailable"))
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
    assert.equal(layout.deckHeadVisible, true, `${label}: deck-head is visible above the capability rail`);
    assert.ok(layout.deckHeadRoomName?.length > 0, `${label}: deck-head names the room`);
    assert.match(layout.deckHeadCount, /\d/, `${label}: deck-head shows a non-fabricated count string`);
    assert.equal(layout.railIconsPresent, true, `${label}: every rail button has an icon`);
    assert.equal(layout.railLabelsPresent, true, `${label}: every rail button keeps its capability label`);
    assert.ok(layout.railSummaryCount >= 1, `${label}: at least one rail button shows a one-line summary`);
    assert.ok(layout.stageHeadEyebrow?.length > 0, `${label}: the active stage shows a stage-head eyebrow label`);
    assert.equal(layout.stageHeadHasTitle, false, `${label}: HD-208 removes the redundant room-name h3 from the stage-head`);
    assert.equal(layout.stageHeadHasDescription, false, `${label}: HD-208 removes the static, non-status stage-head description`);
    assert.equal(layout.stageHeadPrecedesContent, true, `${label}: the stage-head renders before the stage's own content`);
    assert.ok(["Beschikbaar", "Aandacht", "Deels niet beschikbaar"].includes(layout.badgeText), `${label}: the stage-head badge shows a real availability tone`);
    assert.equal(layout.heroHasSubtitle, false, `${label}: HD-208 removes the static, non-dynamic hero subtitle`);
    assert.equal(layout.deckHasBorder, true, `${label}: HD-208 gives the Control Deck a bounded card border`);
    assert.equal(layout.deckHasRadius, true, `${label}: HD-208 gives the Control Deck a card border-radius`);
    assert.equal(layout.deckHasFrame, true, `${label}: HD-208 gives the Control Deck a visible card background/shadow`);
    if (width <= 600) assert.equal(layout.mobileGrid, 1, `${label}: mobile controls use one clear column`);
    if (variant === "normal") assert.equal(layout.badgeDegraded, false, `${label}: a fully healthy stage's badge is not degraded`);
    if (variant === "missing") assert.equal(await page.locator(".light-card").first().isDisabled(), true);
    if (variant === "unavailable") {
      assert.equal(layout.badgeDegraded, false, `${label}: the default lighting stage stays available when only the cover entity is unavailable`);
      await selectCapability("Luifel & screens");
      assert.equal(await page.locator(".cover-card button").first().isDisabled(), true);
      const coverStage = await page.evaluate(() => {
        const badge = document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".stage-head .state-badge");
        return { text: badge?.textContent, degraded: badge?.classList.contains("unavailable") ?? false };
      });
      assert.equal(coverStage.degraded, true, `${label}: the covers stage badge switches tone when its entity is unavailable`);
      assert.equal(coverStage.text, "Deels niet beschikbaar", `${label}: the degraded badge shows the unavailable-state copy`);
      await selectCapability("Verlichting");
    }
    if (variant === "warning") {
      await selectCapability("Comfort");
      assert.equal(await page.locator(".info.warning").count(), 1);
      const comfortBadge = await page.evaluate(() => {
        const badge = document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".stage-head .state-badge");
        return { text: badge?.textContent, warning: badge?.classList.contains("warning") ?? false };
      });
      assert.equal(comfortBadge.warning, true, `${label}: the Comfort stage-head badge switches to the warning tone when a safety entity needs attention`);
      assert.equal(comfortBadge.text, "Aandacht", `${label}: the warning badge shows the Aandacht copy rather than a fabricated Beschikbaar`);
      await selectCapability("Verlichting");
    }
    // Captured here, before any of the ad-hoc fixture remounts below replace document.body's contents — otherwise
    // the unavailable/1440 screenshot would document whichever of those fixtures happened to mount last instead of
    // the actual unavailable-variant room (HD-207).
    await page.screenshot({ path: `${directory}/${variant}-${width}.png`, fullPage: true });
    if (variant === "unavailable" && width === 1440) {
      // HD-206 fix regression: a plugs-only energy room whose only checkable entity is currently unavailable must
      // show "Deels niet beschikbaar", never fabricate "Beschikbaar" from an incomplete entity check.
      const plugsOnlyBadge = await page.evaluate(() => {
        const fixture = window.roomFixture;
        const room = fixture.config.rooms.find((candidate) => candidate.key === "plugs_only_energy");
        const detail = document.createElement("home-dashboard-room-detail");
        detail.setConfig({ type: "custom:home-dashboard-room-detail", room });
        detail.hass = fixture.hass;
        document.body.replaceChildren(detail);
        return true;
      });
      assert.equal(plugsOnlyBadge, true, `${label}: plugs-only energy room detail mounted`);
      await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector(".control-deck"));
      // HD-207 fix: the plugs-stage badge itself must also degrade when a configured plug's energy sensor is
      // unavailable, not just the separate Verbruik-stage badge checked below — capabilityEntityRoles()'s "plugs"
      // branch previously only checked switch_entity/power_entity, missing energy_day/month/year_entity entirely.
      await selectCapability("Smart plugs");
      const plugsOnlyPlugsBadge = await page.evaluate(() => {
        const badge = document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".stage-head .state-badge");
        return { text: badge?.textContent, degraded: badge?.classList.contains("unavailable") ?? false };
      });
      assert.equal(plugsOnlyPlugsBadge.degraded, true, `${label}: a plugs-only energy room's Smart plugs badge degrades when its plug's energy sensor is unavailable`);
      assert.equal(plugsOnlyPlugsBadge.text, "Deels niet beschikbaar", `${label}: the degraded Smart plugs badge shows the unavailable-state copy, not a fabricated Beschikbaar`);
      await selectCapability("Verbruik");
      const plugsOnlyEnergyBadge = await page.evaluate(() => {
        const badge = document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".stage-head .state-badge");
        return { text: badge?.textContent, degraded: badge?.classList.contains("unavailable") ?? false };
      });
      assert.equal(plugsOnlyEnergyBadge.degraded, true, `${label}: a plugs-only energy room's Verbruik badge degrades when its only sensor is unavailable`);
      assert.equal(plugsOnlyEnergyBadge.text, "Deels niet beschikbaar", `${label}: the plugs-only energy badge shows the unavailable-state copy, not a fabricated Beschikbaar`);
      // Own, separately named evidence (HD-207) — this fixture no longer overwrites the unavailable-1440.png above.
      await page.screenshot({ path: `${directory}/plugs-only-energy-${width}.png`, fullPage: true });

      // HD-208: a room with only a generic power_entities entry (no smart_plugs, no room_energy) must still show a
      // combined current-wattage figure in the Energie tab's room-total card, proving roomCurrentWatts() counts it.
      const aircoOnlyMounted = await page.evaluate(() => {
        const fixture = window.roomFixture;
        const room = fixture.config.rooms.find((candidate) => candidate.key === "airco_only_energy");
        const detail = document.createElement("home-dashboard-room-detail");
        detail.setConfig({ type: "custom:home-dashboard-room-detail", room });
        detail.hass = fixture.hass;
        document.body.replaceChildren(detail);
        return true;
      });
      assert.equal(aircoOnlyMounted, true, `${label}: airco-only energy room detail mounted`);
      await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector(".control-deck"));
      // HD-207 fix: an energy-only room (no lamps/openings/plugs at all) has nothing for countParts to count, so the
      // deck-head must omit the trailing count span entirely rather than render an empty, dangling label.
      const aircoOnlyDeckHead = await page.evaluate(() => {
        const deckHead = document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".deck-head");
        return { spanCount: deckHead?.querySelectorAll("span").length ?? -1 };
      });
      assert.equal(aircoOnlyDeckHead.spanCount, 1, `${label}: an energy-only room's deck-head renders only the eyebrow span, no empty trailing count span`);
      await selectCapability("Verbruik");
      const aircoOnlyTotalText = await page.evaluate(() => document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".energy-card")?.textContent ?? "");
      assert.match(aircoOnlyTotalText, /650 W/, `${label}: the room-total card combines a power_entities-only reading into the current-wattage figure`);

      // HD-208: a room with BOTH a reporting smart plug AND a power_entities entry (no room_energy) must show the
      // SAME combined wattage number on the Energie tab's room-total card as on the rail "plugs" summary and the
      // plugs-stage summary-strip — this is the exact gap where the room-total card previously went silently blank.
      const comboMounted = await page.evaluate(() => {
        const fixture = window.roomFixture;
        const room = fixture.config.rooms.find((candidate) => candidate.key === "plugs_and_airco_energy");
        const detail = document.createElement("home-dashboard-room-detail");
        detail.setConfig({ type: "custom:home-dashboard-room-detail", room });
        detail.hass = fixture.hass;
        document.body.replaceChildren(detail);
        return true;
      });
      assert.equal(comboMounted, true, `${label}: plugs+airco combined energy room detail mounted`);
      await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector(".control-deck"));
      await selectCapability("Smart plugs");
      const comboRailSummaryText = await page.locator('.capability-rail button[aria-selected="true"] .mushroom-copy small').textContent();
      assert.match(comboRailSummaryText, /700 W/, `${label}: the rail's Smart plugs summary shows the combined plug+power_entities wattage`);
      const comboSummaryStripText = await page.locator(".stage .summary-strip").first().textContent();
      assert.match(comboSummaryStripText, /700 W/, `${label}: the plugs-stage summary-strip shows the combined plug+power_entities wattage`);
      await selectCapability("Verbruik");
      const comboTotalText = await page.evaluate(() => document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".energy-card")?.textContent ?? "");
      assert.match(comboTotalText, /700 W/, `${label}: the Energie tab's room-total card shows the same combined wattage as the plugs-stage summary and rail, not a blank value`);

      // HD-212: mountCard()'s fallback catch-path (shared by the LINAK desk card and history-graph)
      // was never actually exercised by any test -- only the card_config pass-through was checked
      // (tests/room-cards-source.test.mjs). Simulate both real failure modes: loadCardHelpers()
      // resolving to nothing, and createCardElement() throwing. Reloaded on the next open(), so no
      // manual restore is needed -- this is the last scenario in this block.
      const deskNoHelpers = await page.evaluate(() => {
        window.loadCardHelpers = async () => undefined;
        const fixture = window.roomFixture;
        const room = fixture.config.rooms.find((candidate) => candidate.key === "room_1");
        const detail = document.createElement("home-dashboard-room-detail");
        detail.setConfig({ type: "custom:home-dashboard-room-detail", room });
        detail.hass = fixture.hass;
        document.body.replaceChildren(detail);
        return Boolean(room?.desk?.card_config && Object.keys(room.desk.card_config).length > 0);
      });
      assert.equal(deskNoHelpers, true, `${label}: room_1 (Bureau) has a non-empty desk config, so the desk card attempts to mount`);
      await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector(".control-deck"));
      await selectCapability("Comfort");
      await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector(".desk-card")?.textContent?.trim());
      const deskNoHelpersText = await page.evaluate(() => document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".desk-card")?.textContent ?? "");
      assert.equal(deskNoHelpersText, "Kaart niet beschikbaar.", `${label}: a missing loadCardHelpers() falls back to the native "not available" text, never a crash or a silently empty card`);

      const deskThrowingHelpers = await page.evaluate(() => {
        window.loadCardHelpers = async () => ({ createCardElement: () => { throw new Error("fixture: card constructor failure"); } });
        const fixture = window.roomFixture;
        const room = fixture.config.rooms.find((candidate) => candidate.key === "room_1");
        const detail = document.createElement("home-dashboard-room-detail");
        detail.setConfig({ type: "custom:home-dashboard-room-detail", room });
        detail.hass = fixture.hass;
        document.body.replaceChildren(detail);
        return true;
      });
      assert.equal(deskThrowingHelpers, true, `${label}: room_1 (Bureau) detail remounted`);
      await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector(".control-deck"));
      await selectCapability("Comfort");
      await page.waitForFunction(() => document.querySelector("home-dashboard-room-detail")?.shadowRoot?.querySelector(".desk-card")?.textContent?.trim());
      const deskThrowingHelpersText = await page.evaluate(() => document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".desk-card")?.textContent ?? "");
      assert.equal(deskThrowingHelpersText, "Kaart niet beschikbaar.", `${label}: a throwing createCardElement() also falls back to the native "not available" text, not an unhandled exception`);
    }
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
// HD-208: room_0 configures a 420 W room_energy.power_entity that is authoritative over its 176 W + 34 W plugs
// (it already includes them). roomCurrentWatts() now shares this room_energy-priority figure with the rail and
// plugs-stage summary too, so both read 420 W here, not the 210 W plug-only sum they showed before HD-208.
assert.match(await page.locator(".stage .summary-strip").first().textContent(), /420 W/, "the plugs-stage current-wattage metric defers to the authoritative room_energy reading, not just its own plugs");
assert.match(await page.locator('.capability-rail button[aria-selected="true"] .mushroom-copy small').textContent(), /420 W/, "the rail's Smart plugs summary shares the same authoritative room_energy wattage");
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
// HD-205: the Historie tab is a proper tab panel (temperature/humidity line graph + logbook), not a
// per-entity dialog. The fixture's `sendMessagePromise` rejects every non-photo WS message, so the real,
// documented contract to prove here is the explicit "niet beschikbaar" fallback -- never a fabricated
// chart or event -- plus a working 24u/7d/30d window toggle that re-requests rather than being stuck.
await page.getByRole("tab", { name: "Historie" }).click();
assert.equal(await page.getByRole("group", { name: "Historieperiode" }).count(), 1, "historie tab offers the shared 24u/7d/30d window selector");
assert.equal(await page.locator('[data-control-key="history-window:24h"]').getAttribute("aria-pressed"), "true", "24u is the default window");
assert.match(await page.locator(".details-card").textContent(), /niet beschikbaar/i, "a rejected HD-205 statistics/history/logbook call shows an explicit unavailable state, never fabricated data");
await page.locator('[data-control-key="history-window:7d"]').click();
assert.equal(await page.locator('[data-control-key="history-window:7d"]').getAttribute("aria-pressed"), "true", "window toggle switches without a page reload");
assert.equal(await page.locator('[data-control-key="history-window:24h"]').getAttribute("aria-pressed"), "false", "switching window un-presses the previous one");
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
// HD-205 normal case: a resolving `sendMessagePromise` (the shared fixture's default mock rejects every
// non-photo WS call so the earlier assertions could prove the fallback) proves the chart/logbook panels
// render real, non-fabricated content once genuine statistics/history/logbook responses settle.
await open("normal", 390);
await page.evaluate(() => {
  const { hass, config, ref } = window.roomFixture;
  const temperatureEntity = config.rooms[0].temperature_history_entity;
  const outsideRoomEntity = ref("sensor", "not_mapped_to_this_room");
  hass.states[outsideRoomEntity] = { state: "21", attributes: { friendly_name: "Niet-gemapte sensor" } };
  hass.connection.sendMessagePromise = async (message) => {
    if (message.type === "recorder/statistics_during_period") {
      const result = {};
      for (const id of message.statistic_ids) result[id] = [{ start: 0, end: 1, sum: 1.23 }];
      return result;
    }
    if (message.type === "history/history_during_period") return { [temperatureEntity]: [{ s: "20", lu: 1 }, { s: "21", lu: 2 }] };
    if (message.type === "logbook/get_events") return [
      { when: 2, entity_id: config.rooms[0].control_light_entity, name: "Woonkamer lichten" },
      { when: 1, entity_id: outsideRoomEntity, name: "Niet-gemapte sensor" },
      { when: 3, entity_id: config.rooms[0].control_light_entity, domain: "automation", name: "Automatisering" },
      // Some HA versions put the raw entity_id itself in `name` when the entity never had a friendly_name.
      // This must never render verbatim -- the UI must fall back to a resolved/generic label instead.
      { when: 4, entity_id: config.rooms[0].control_cover_entity, name: config.rooms[0].control_cover_entity }
    ];
    throw Error("fixture media_source refusal");
  };
  document.querySelector("home-dashboard-room-detail").hass = { ...hass };
});
await page.getByRole("tab", { name: "Historie" }).click();
await page.waitForFunction(() => !document.querySelector("home-dashboard-room-detail").shadowRoot.querySelector(".details-card")?.textContent?.includes("wordt geladen"));
assert.match(await page.locator(".details-card").textContent(), /Woonkamer totaal|Mediahoek|Netwerkhoek/, "the Verbruik bar chart renders a real per-device statistics series");
assert.equal(await page.locator(".details-card svg.stat-svg").count() > 0, true, "HD-205 renders inline SVG charts, never a fabricated native history-graph card");
assert.match(await page.locator(".details-card").textContent(), /Woonkamer lichten/, "the logbook list shows the room's own mapped entity");
assert.doesNotMatch(await page.locator(".details-card").textContent(), /Niet-gemapte sensor/, "an entity outside this room's own mapping never leaks into its logbook (D-058 point 1)");
await page.evaluate(() => { window.roomFixtureCoverEntity = window.roomFixture.config.rooms[0].control_cover_entity; });
const detailsCardText = await page.locator(".details-card").textContent();
const rawCoverEntityId = await page.evaluate(() => window.roomFixtureCoverEntity);
assert.doesNotMatch(detailsCardText, new RegExp(rawCoverEntityId.replace(".", "\\.")), "a raw entity_id in the logbook server response's own name field never renders verbatim; a resolved or generic label is used instead");
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
// HD-209 bug #1 regression: Lovelace's real lifecycle calls setConfig() (synchronous render, no hass/connection
// yet) and only assigns `hass` afterwards. This must not get the photo permanently stuck on the placeholder --
// it must resolve once a real connection with media_source/resolve_media arrives, and must retry on reconnect
// rather than being mistaken for "already resolved" from the pre-hass render.
await open("normal", 1440);
const beforeHassState = await page.evaluate(() => {
  const fixture = window.roomFixture;
  const okRoom = fixture.config.rooms.find((candidate) => candidate.key === "photo_upload_ok");
  const detail = document.createElement("home-dashboard-room-detail");
  // Real Lovelace ordering: setConfig() first, with no hass/connection assigned at all yet.
  detail.setConfig({ type: "custom:home-dashboard-room-detail", room: okRoom });
  document.body.replaceChildren(detail);
  window.roomFixture.photoDetail = detail;
  const photo = detail.shadowRoot?.querySelector(".room-photo");
  return { mounted: Boolean(photo), ariaHidden: photo?.getAttribute("aria-hidden") ?? null, role: photo?.getAttribute("role") ?? null };
});
assert.equal(beforeHassState.mounted, true, "setConfig before hass mounts the room-photo element without crashing");
assert.equal(beforeHassState.ariaHidden, "true", "setConfig before hass shows the placeholder (aria-hidden) since there is no connection to resolve against yet");
assert.equal(beforeHassState.role, null, "setConfig before hass has not resolved anything yet, so no role=img");
await page.evaluate(() => { window.roomFixture.photoDetail.hass = window.roomFixture.hass; });
await page.waitForFunction(() => window.roomFixture.photoDetail.shadowRoot.querySelector(".room-photo")?.getAttribute("role") === "img");
const resolvedPhoto = await page.evaluate(() => {
  const photo = window.roomFixture.photoDetail.shadowRoot.querySelector(".room-photo");
  return { backgroundImage: photo.style.backgroundImage, role: photo.getAttribute("role"), ariaLabel: photo.getAttribute("aria-label"), ariaHidden: photo.getAttribute("aria-hidden") };
});
assert.match(resolvedPhoto.backgroundImage, /fixture_room_photo_ok\.jpg/, "a real media_source/resolve_media response ends up painted onto the room-photo background, after setConfig ran with no connection at all");
assert.equal(resolvedPhoto.role, "img", "a resolved photo gets role=img");
assert.match(resolvedPhoto.ariaLabel, /Fotokamer/, "a resolved photo gets a room-specific aria-label");
assert.equal(resolvedPhoto.ariaHidden, null, "a resolved photo removes aria-hidden (HD-209 bug #2 fix stays fixed)");

// HD-209 fallback + retry-on-reconnect: a media_content_id that never resolves must fall back to the placeholder
// (there is no entity_picture configured on this fixture's image_entity either) without crashing, and a later
// reconnect (`hass` reassigned again) must still attempt a fresh resolution rather than being permanently stuck
// on the first rejected attempt -- this is exactly the bug #1 regression this test exists to catch.
const unusablePhotoBefore = await page.evaluate(async () => {
  const fixture = window.roomFixture;
  const unusableRoom = fixture.config.rooms.find((candidate) => candidate.key === "photo_upload_unusable");
  const detail = document.createElement("home-dashboard-room-detail");
  detail.setConfig({ type: "custom:home-dashboard-room-detail", room: unusableRoom });
  document.body.replaceChildren(detail);
  window.roomFixture.unusableDetail = detail;
  const counter = { count: 0 };
  const originalSendMessagePromise = fixture.hass.connection.sendMessagePromise;
  const countingConnection = { ...fixture.hass.connection, sendMessagePromise: (message) => { counter.count++; return originalSendMessagePromise(message); } };
  window.roomFixture.unusableCounter = counter;
  window.roomFixture.unusableConnection = countingConnection;
  detail.hass = { ...fixture.hass, connection: countingConnection };
  // Let the rejected media_source/resolve_media promise settle before reading the DOM.
  await new Promise((resolve) => setTimeout(resolve, 50));
  const photo = detail.shadowRoot.querySelector(".room-photo");
  return { ariaHidden: photo.getAttribute("aria-hidden"), role: photo.getAttribute("role"), resolveCount: counter.count };
});
assert.equal(unusablePhotoBefore.ariaHidden, "true", "a never-resolving media_content_id falls back to the placeholder instead of crashing");
assert.equal(unusablePhotoBefore.role, null, "a never-resolving media_content_id never gets role=img");
// HD-205: the same `hass` assignment that attempts the photo resolve also attempts this room's logbook
// fetch (`roomEntities()` -- the logbook allowlist -- includes `image_entity`, the only entity this
// fixture room maps), so two WS calls go out per assignment now, not one.
assert.equal(unusablePhotoBefore.resolveCount, 2, "the first connection assignment attempts exactly one media_source/resolve_media and one logbook/get_events call");
assert.deepEqual(errors, []);
const unusablePhotoAfterReconnect = await page.evaluate(async () => {
  const fixture = window.roomFixture;
  const detail = fixture.unusableDetail;
  // Simulate a reconnect: `hass` is reassigned again (same counting connection), as Lovelace does after HA
  // restarts. A fixed bug #1 must attempt a fresh resolve here, not treat the first rejection as "already tried".
  detail.hass = { ...fixture.hass, connection: fixture.unusableConnection };
  await new Promise((resolve) => setTimeout(resolve, 50));
  const photo = detail.shadowRoot.querySelector(".room-photo");
  return { ariaHidden: photo.getAttribute("aria-hidden"), role: photo.getAttribute("role"), resolveCount: fixture.unusableCounter.count };
});
assert.equal(unusablePhotoAfterReconnect.ariaHidden, "true", "after reconnect, the still-unresolvable photo remains on the placeholder rather than crashing");
assert.equal(unusablePhotoAfterReconnect.role, null, "after reconnect, a still-failing resolution still shows no role=img");
assert.equal(unusablePhotoAfterReconnect.resolveCount, 4, "a reconnect (hass reassigned again) attempts a fresh resolve and a fresh logbook fetch instead of being permanently stuck on the first rejection (HD-209 bug #1 regression; HD-205 extends the same guarantee to its own WS calls)");
assert.deepEqual(errors, []);

assert.deepEqual(errors, []);
console.log(`Room-detail browser checks passed: normal/dark/warning/missing/unavailable at desktop/tablet/mobile; touch, dialog lifecycle, fallback, opt-in, service rejection, brightness slider, Home lighting switches and the setConfig-before-hass room-photo resolve/fallback/reconnect lifecycle. 100 unrelated updates: ${performance.milliseconds.toFixed(1)} ms, DOM retained.`);
await browser.close();
