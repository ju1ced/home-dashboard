class HaSelectorFixture extends HTMLElement {
  set hass(value) { this._hass = value; }
  set selector(value) { this._selector = value; this.render(); }
  set value(value) { this._value = value; this.render(); }
  render() {
    const multiple = Array.isArray(this._value);
    const input = document.createElement("input");
    input.value = multiple ? this._value.join(", ") : String(this._value ?? "");
    input.placeholder = this._selector ? Object.keys(this._selector)[0] : "selector";
    input.style.cssText = "width:100%;padding:10px;border:1px solid var(--divider-color);border-radius:8px;background:var(--secondary-background-color);color:inherit";
    input.addEventListener("change", () => {
      const value = multiple ? input.value.split(",").map((item) => item.trim()).filter(Boolean) : input.value;
      this.dispatchEvent(new CustomEvent("value-changed", { bubbles: true, detail: { value } }));
    });
    this.replaceChildren(input);
  }
}

customElements.define("ha-selector", HaSelectorFixture);
// HD-234: a minimal stand-in for Home Assistant's globally registered ha-icon (not available
// outside a real HA frontend), just enough so the nav rail's section icons are visible in the
// sandboxed prototype instead of silently collapsing to nothing.
class HaIconFixture extends HTMLElement {
  static get observedAttributes() { return ["icon"]; }
  // Real ha-icon is a LitElement whose `icon` property reflects to/from the HTML attribute, so
  // `<ha-icon icon="mdi:...">` works as plain markup there -- this fixture mirrors that via
  // attributeChangedCallback instead of only a JS property setter.
  attributeChangedCallback(name, _old, value) { if (name === "icon") this.icon = value; }
  set icon(value) { this.style.cssText = "display:inline-flex;align-items:center;justify-content:center;width:1em;height:1em"; this.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`; this.title = value ?? ""; }
}
customElements.define("ha-icon", HaIconFixture);

const { createDefaultConfig, HomeDashboardStrategy } = await import("/dist/home-dashboard.js");
// HD-210: ga via dezelfde lazy-load als de echte Home Assistant-configflow
// (HomeDashboardStrategy.getConfigElement() -> dynamic import van
// dist/home-dashboard-editor.js). Dit dekt de echte import.meta.url/?v=
// resolutie over HTTP, in plaats van het editorbundle rechtstreeks te laden.
await HomeDashboardStrategy.getConfigElement();
const editor = document.querySelector("home-dashboard-strategy-editor");
const strategyRegistered = window.customStrategies?.some((entry) => entry.type === "home-dashboard" && entry.strategyType === "dashboard");
document.querySelector("#events").textContent = strategyRegistered
  ? "Fictief editorharnas — Community strategy en editor zijn geregistreerd; geen verbinding met Home Assistant."
  : "Registratiefout in het fictieve editorharnas.";
const config = createDefaultConfig();
config.persons.push({ key: "resident_primary", entity: "person_primary", label: "Bewoner", show_location: true, zone_entities: ["zone_work"], freshness_minutes: 30, battery_entities: ["phone_battery"] });
config.actions.push({ key: "living_lights", label: "Lichten woonkamer", sequence: [{ action: "light.toggle", target: { entity_id: ["living_light_state"] } }], risk: "safe", confirmation_text: "", hold_required: false, verification_entity: "living_light_state" });
config.rooms.push({
  key: "living_room", name: "Woonkamer", icon: "mdi:sofa", floor_id: "ground_floor", area_id: "living_area", device_ids: [],
  capabilities: ["lights", "climate", "media"], quick_actions: ["living_lights"], light_entities: ["living_lights"], cover_entities: [],
  media_entities: ["living_media"], safety_entities: [], camera_entities: [], power_entities: [], history_entities: ["living_air_quality"],
  hvac: { entity: "living_hvac", comfort_entities: ["living_temperature"], history_entities: ["living_temperature"], modes: ["heat", "cool"], presets: ["eco"], fan_modes: ["auto"], swing_modes: [] }
});
editor.hass = { states: {} };
editor.setConfig(new URLSearchParams(window.location.search).get("fixture") === "future"
  ? { type: "custom:home-dashboard", schema_version: 99 }
  : config);
editor.addEventListener("config-changed", (event) => {
  document.querySelector("#events").textContent = `Geldige wijziging ontvangen voor schema ${event.detail.config.schema_version}.`;
});
