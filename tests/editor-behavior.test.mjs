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
  }

  get innerHTML() {
    return this._innerHTML;
  }

  querySelectorAll(selector) {
    if (selector === "[data-section-nav]" || selector === "input,select,button,ha-selector") return this.navigation;
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

const {
  HomeDashboardStrategyEditor,
  createDefaultConfig
} = await import("../dist/home-dashboard.js?editor-behavior");

test("dashboard- en view-strategy zijn beide geregistreerd", () => {
  assert.ok(registry.has("ll-strategy-dashboard-home-dashboard"));
  assert.ok(registry.has("ll-strategy-view-home-dashboard-view"));
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
