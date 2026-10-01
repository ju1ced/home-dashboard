import assert from "node:assert/strict";
import test from "node:test";

class FakeElement extends EventTarget {
  constructor(root, attributes = {}) {
    super();
    this.root = root;
    this.dataset = attributes.dataset ?? {};
    this.id = attributes.id ?? "";
    this.open = attributes.open ?? false;
    this.ariaSelected = attributes.ariaSelected;
  }

  focus() {
    this.root.activeElement = this;
  }

  emit(type, properties = {}) {
    const event = new Event(type, { cancelable: true });
    for (const [key, value] of Object.entries(properties)) Object.defineProperty(event, key, { value });
    this.dispatchEvent(event);
  }
}

class FakeShadowRoot {
  constructor() {
    this.activeElement = null;
    this.navigation = [];
    this.sectionLinks = [];
    this.items = [];
    this.selectors = [];
    this._innerHTML = "";
  }

  set innerHTML(value) {
    this._innerHTML = value;
    this.navigation = Array.from(value.matchAll(/<button\b([^>]*)data-section-nav="([^"]+)"([^>]*)>/g), (match) => {
      const attributes = `${match[1]}${match[3]}`;
      return new FakeElement(this, {
        id: attributes.match(/\bid="([^"]+)"/)?.[1] ?? "",
        ariaSelected: attributes.match(/\baria-selected="([^"]+)"/)?.[1] ?? "false",
        dataset: { sectionNav: match[2] }
      });
    });
    this.sectionLinks = Array.from(value.matchAll(/<button\b([^>]*)data-go-section="([^"]+)"([^>]*)>/g), (match) => new FakeElement(this, {
      dataset: { goSection: match[2] }
    }));
    this.items = Array.from(value.matchAll(/<details\b([^>]*)data-item-token="([^"]+)"([^>]*)>/g), (match) => {
      const attributes = `${match[1]}${match[3]}`;
      return new FakeElement(this, {
        open: /(?:^|\s)open(?:\s|$)/.test(attributes),
        dataset: { itemToken: match[2] }
      });
    });
    this.selectors = Array.from(value.matchAll(/<ha-selector\b([^>]*)><\/ha-selector>/g), (match) => {
      const attributes = match[1];
      const decode = (input = "") => input.replaceAll("&quot;", '"').replaceAll("&#039;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
      return new FakeElement(this, {
        dataset: {
          path: attributes.match(/\bdata-path="([^"]*)"/)?.[1] ?? "",
          value: decode(attributes.match(/\bdata-value="([^"]*)"/)?.[1] ?? "null")
        }
      });
    });
  }

  get innerHTML() {
    return this._innerHTML;
  }

  querySelectorAll(selector) {
    if (selector === "[data-section-nav]" || selector === "input,select,button,ha-selector") return this.navigation;
    if (selector === "[data-path]") return this.selectors;
    if (selector === "ha-selector") return this.selectors;
    if (selector === "[data-go-section]") return this.sectionLinks;
    if (selector === "details[data-item-token]") return this.items;
    return [];
  }

  querySelector(selector) {
    if (selector === "[data-section-nav][aria-selected=true]") return this.navigation.find((element) => element.ariaSelected === "true") ?? null;
    return null;
  }
}

class FakeHTMLElement extends EventTarget {
  constructor() {
    super();
    this.shadowRoot = null;
  }

  attachShadow() {
    this.shadowRoot = new FakeShadowRoot();
    return this.shadowRoot;
  }
}

const registry = new Map();
globalThis.HTMLElement = FakeHTMLElement;
globalThis.HTMLInputElement = class extends FakeElement {};
globalThis.HTMLSelectElement = class extends FakeElement {};
globalThis.customElements = {
  define(name, constructor) { registry.set(name, constructor); },
  get(name) { return registry.get(name); }
};
globalThis.document = { createElement: () => new FakeHTMLElement() };
globalThis.window = { customStrategies: [] };

const { createDefaultConfig, HomeDashboardStrategy } = await import("../dist/home-dashboard.js?editor-behavior");
// De editor is sinds HD-210 een los, lazy geladen bundle (dist/home-dashboard-editor.js),
// geladen via dezelfde weg als de echte Home Assistant-configflow:
// HomeDashboardStrategy.getConfigElement() (dynamic import + registratie als
// side effect), in plaats van het editorbundle rechtstreeks te importeren.
// Dit dekt de echte import.meta.url/?v=-resolutie binnen dist/home-dashboard.js.
await HomeDashboardStrategy.getConfigElement();
const HomeDashboardStrategyEditor = registry.get("home-dashboard-strategy-editor");

test("dashboard- en view-strategy zijn beide geregistreerd", () => {
  assert.ok(registry.has("ll-strategy-dashboard-home-dashboard"));
  assert.ok(registry.has("ll-strategy-view-home-dashboard-view"));
  assert.ok(registry.has("home-dashboard-camera-strip"));
  assert.ok(registry.has("home-dashboard-home-overview"));
  assert.ok(registry.has("home-dashboard-room-overview"));
  assert.ok(registry.has("home-dashboard-room-detail"));
});

test("editorbundle registreert het editor-element afzonderlijk", () => {
  assert.ok(registry.has("home-dashboard-strategy-editor"));
  assert.equal(registry.get("home-dashboard-strategy-editor"), HomeDashboardStrategyEditor);
});

function room(key) {
  return {
    key, name: key, icon: "mdi:sofa", floor_id: "", area_id: "living_area", device_ids: [], capabilities: [], quick_actions: [],
    light_entities: [], cover_entities: [], media_entities: [], safety_entities: [], camera_entities: [], power_entities: [], history_entities: [],
    hvac: { entity: "", comfort_entities: [], history_entities: [], modes: [], presets: [], fan_modes: [], swing_modes: [] }
  };
}

function findTab(editor, section) {
  return editor.shadowRoot.navigation.find((element) => element.dataset.sectionNav === section);
}

test("open room blijft open na HA-roundtrip, keywijziging en reorder", () => {
  const config = createDefaultConfig();
  config.rooms.push(room("living_room"), room("kitchen"));
  const editor = new HomeDashboardStrategyEditor();
  editor.connectedCallback();
  editor.setConfig(config);

  findTab(editor, "rooms").emit("click");
  const living = editor.shadowRoot.items.find((item) => item.dataset.itemToken === "rooms:living_room");
  living.open = true;
  living.emit("toggle");

  editor.setConfig(JSON.parse(JSON.stringify(editor._config)));
  assert.equal(editor.shadowRoot.items.find((item) => item.dataset.itemToken === "rooms:living_room").open, true);

  editor.updateCollection("rooms", 0, "key", "living_room_renamed");
  assert.equal(editor.shadowRoot.items.find((item) => item.dataset.itemToken === "rooms:living_room_renamed").open, true);

  editor.moveItem(editor._config.rooms, 0, "down");
  assert.equal(editor.shadowRoot.items.find((item) => item.dataset.itemToken === "rooms:living_room_renamed").open, true);
});

test("quick-actionvolgorde wijzigt lokaal en wordt pas op toepassen opgeslagen", () => {
  const config = createDefaultConfig();
  const configuredRoom = room("office");
  const first = ["light", "example_first"].join(".");
  const second = ["cover", "example_second"].join(".");
  const third = ["light", "example_third"].join(".");
  configuredRoom.control_entities = [first, second, third];
  config.rooms.push(configuredRoom);
  const editor = new HomeDashboardStrategyEditor();
  editor.connectedCallback();
  editor.setConfig(config);
  let changes = 0;
  editor.addEventListener("config-changed", () => { changes += 1; });

  editor.moveRoomControlDraft(0, 0, "down");
  assert.deepEqual(editor._config.rooms[0].control_entities, [second, first, third]);
  assert.equal(changes, 0);
  editor.commit();
  assert.equal(changes, 1);
});

test("tab-keypress verplaatst selectie en focus na de microtask", async () => {
  const editor = new HomeDashboardStrategyEditor();
  editor.connectedCallback();
  editor.setConfig(createDefaultConfig());

  const persons = findTab(editor, "persons");
  persons.focus();
  persons.emit("click");
  findTab(editor, "persons").emit("keydown", { key: "ArrowRight" });
  await Promise.resolve();
  assert.equal(findTab(editor, "security").ariaSelected, "true");
  assert.equal(editor.shadowRoot.activeElement.dataset.sectionNav, "security");

  findTab(editor, "security").emit("keydown", { key: "End" });
  await Promise.resolve();
  assert.equal(editor.shadowRoot.activeElement.dataset.sectionNav, "diagnostics");

  findTab(editor, "diagnostics").emit("keydown", { key: "Home" });
  await Promise.resolve();
  assert.equal(editor.shadowRoot.activeElement.dataset.sectionNav, "general");
});

test("Security laat zes camera's toe en verwijst rechtstreeks naar Acties", async () => {
  const editor = new HomeDashboardStrategyEditor();
  editor.connectedCallback();
  editor.setConfig(createDefaultConfig());

  for (let index = 0; index < 6; index += 1) editor.addItem("security.cameras");
  assert.equal(editor._config.security.cameras.length, 6);

  findTab(editor, "security").emit("click");
  const link = editor.shadowRoot.sectionLinks.find((element) => element.dataset.goSection === "actions");
  assert.ok(link);
  link.emit("click");
  await Promise.resolve();
  assert.equal(findTab(editor, "actions").ariaSelected, "true");
  assert.equal(editor.shadowRoot.activeElement.dataset.sectionNav, "actions");
});

test("alarmselector bewaart de gekozen entiteit en verstuurt geldige configuratie", () => {
  const config = createDefaultConfig();
  config.security.enabled = true;
  config.security.cameras.push({
    key: "camera_primary", name: "Camera", camera_entity: "camera_primary", privacy_entity: "privacy_primary",
    privacy_action_key: "privacy_toggle", fallback: "placeholder", confirm_privacy_disable: true
  });
  config.actions.push({
    key: "privacy_toggle", label: "Privacy", sequence: [{ action: "switch.toggle", target: { entity_id: "privacy_primary" } }],
    risk: "safe", confirmation_text: "", hold_required: false, verification_entity: "privacy_primary"
  });

  const editor = new HomeDashboardStrategyEditor();
  editor.connectedCallback();
  editor.setConfig(config);
  findTab(editor, "security").emit("click");

  let saved;
  editor.addEventListener("config-changed", (event) => { saved = event.detail.config; });
  const alarmSelector = editor.shadowRoot.selectors.find((element) => element.dataset.path === "security.alarm_entity");
  assert.ok(alarmSelector);
  alarmSelector.emit("value-changed", { detail: { value: "alarm_primary" } });
  alarmSelector.emit("change");

  assert.equal(editor._config.security.alarm_entity, "alarm_primary");
  assert.equal(saved.security.alarm_entity, "alarm_primary");
  assert.equal(editor.shadowRoot.selectors.find((element) => element.dataset.path === "security.alarm_entity").value, "alarm_primary");
});

test("Vandaag-selectors behouden hun keuze na de echte value-changed plus change-volgorde", () => {
  const editor = new HomeDashboardStrategyEditor();
  editor.connectedCallback();
  editor.setConfig(createDefaultConfig());
  findTab(editor, "today").emit("click");

  let saved;
  editor.addEventListener("config-changed", (event) => { saved = event.detail.config; });
  const selector = editor.shadowRoot.selectors.find((element) => element.dataset.path === "today.battery_soc_entity");
  assert.ok(selector);
  assert.equal(selector.required, false);

  selector.emit("value-changed", { detail: { value: "battery_soc_primary" } });
  selector.emit("change");

  assert.equal(editor._config.today.battery_soc_entity, "battery_soc_primary");
  assert.equal(saved.today.battery_soc_entity, "battery_soc_primary");
  assert.equal(editor.shadowRoot.selectors.find((element) => element.dataset.path === "today.battery_soc_entity").value, "battery_soc_primary");
});

test("kamereditor beheert geneste Control Deck-items zonder JSON-handwerk", () => {
  const config = createDefaultConfig();
  config.rooms.push(room("kitchen"));
  const editor = new HomeDashboardStrategyEditor();
  editor.connectedCallback();
  editor.setConfig(config);

  editor.addRoomNestedItem(0, "light_groups");
  editor.addRoomNestedItem(0, "cover_controls");
  editor.addRoomNestedItem(0, "smart_plugs");
  assert.equal(editor._config.rooms[0].light_groups.length, 1);
  assert.equal(editor._config.rooms[0].cover_controls.length, 1);
  assert.equal(editor._config.rooms[0].smart_plugs.length, 1);

  editor.updateRoomNestedItem(0, "light_groups", 0, "name", "Werkblad");
  editor.updateRoomNestedItem(0, "smart_plugs", 0, "protected", true);
  assert.equal(editor._config.rooms[0].light_groups[0].name, "Werkblad");
  assert.equal(editor._config.rooms[0].smart_plugs[0].protected, true);

  editor.removeRoomNestedItem(0, "cover_controls", 0);
  assert.equal(editor._config.rooms[0].cover_controls.length, 0);
});

test("HD-209: kamereditor rendert een media-uploadselector naast image_entity en schrijft het objectwaarde terug", () => {
  const config = createDefaultConfig();
  config.rooms.push(room("living_room"));
  const editor = new HomeDashboardStrategyEditor();
  editor.connectedCallback();
  editor.setConfig(config);
  findTab(editor, "rooms").emit("click");

  const html = editor.shadowRoot.innerHTML;
  assert.match(html, /data-field="image_upload"/);
  assert.match(html, /data-selector="[^"]*media[^"]*image_upload[^"]*true/);
  assert.match(html, /data-field="image_entity"/);

  const upload = { media_content_id: "media-source://media_source/local/example_room_photo.jpg", media_content_type: "image/jpeg" };
  let saved;
  editor.addEventListener("config-changed", (event) => { saved = event.detail.config; });
  editor.updateCollection("rooms", 0, "image_upload", upload);
  assert.deepEqual(editor._config.rooms[0].image_upload, upload);
  assert.deepEqual(saved.rooms[0].image_upload, upload);

  // image_entity blijft onaangetast door de nieuwe uploadselector.
  editor.updateCollection("rooms", 0, "image_entity", "image.living_room_photo");
  assert.equal(editor._config.rooms[0].image_entity, "image.living_room_photo");
  assert.deepEqual(editor._config.rooms[0].image_upload, upload);
});
