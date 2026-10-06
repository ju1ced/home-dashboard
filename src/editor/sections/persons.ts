import type { HomeDashboardConfigV1 } from "../../config/types";
import { escapeHtml, getEditorItemToken, renderSelector } from "../shared";

/**
 * A flat collection: all CRUD goes through the generic `[data-collection]`/`[data-add]`/
 * `[data-remove]` wiring in the main editor shell, so this section only needs rendering.
 */
export function renderPersons(config: HomeDashboardConfigV1, expandedItems: Set<string>): string {
  return config.persons.map((personConfig, index) => `<details class="item" data-item-token="${escapeHtml(getEditorItemToken("persons", personConfig, index))}" ${expandedItems.has(getEditorItemToken("persons", personConfig, index)) ? "open" : ""}>
    <summary>${escapeHtml(personConfig.label || personConfig.key || `Persoon ${index + 1}`)}</summary><div class="item-body">
    <div class="item-toolbar"><button type="button" aria-label="Verwijder persoon ${escapeHtml(personConfig.label || personConfig.key || index + 1)}" data-remove="persons" data-index="${index}">Verwijder</button></div>
    <label>Logische sleutel<input data-collection="persons" data-index="${index}" data-field="key" value="${escapeHtml(personConfig.key)}"></label>
    <label>Label<input data-collection="persons" data-index="${index}" data-field="label" value="${escapeHtml(personConfig.label)}"></label>
    <label>Person-entiteit${renderSelector("persons", index, "entity", personConfig.entity, { entity: { domain: "person" } })}</label>
    <label>Freshness (minuten)<input type="number" data-collection="persons" data-index="${index}" data-field="freshness_minutes" value="${personConfig.freshness_minutes}"></label>
    <label class="check"><input type="checkbox" data-collection="persons" data-index="${index}" data-field="show_location" ${personConfig.show_location ? "checked" : ""}> Toon thuis/zone/andere locatie</label>
    <label>Toegestane zones${renderSelector("persons", index, "zone_entities", personConfig.zone_entities, { entity: { domain: "zone", multiple: true } })}</label>
    <label>Batterijbronnen${renderSelector("persons", index, "battery_entities", personConfig.battery_entities, { entity: { multiple: true } })}</label>
  </div></details>`).join("");
}
