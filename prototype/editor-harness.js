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

const { createDefaultConfig } = await import("/dist/home-dashboard.js");
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
