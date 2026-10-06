import type { HomeDashboardConfigV1 } from "../../config/types";
import { escapeHtml, getEditorItemToken, renderSelector } from "../shared";

/**
 * A flat collection like persons/cameras: all CRUD (add/remove/field edits) goes through the
 * generic `[data-collection]`/`[data-add]`/`[data-remove]` wiring in the main editor shell, so this
 * section only needs to own its rendering, not a bespoke event binder.
 */
export function renderActions(config: HomeDashboardConfigV1, expandedItems: Set<string>): string {
  return config.actions.map((action, index) => `<details class="item" data-item-token="${escapeHtml(getEditorItemToken("actions", action, index))}" ${expandedItems.has(getEditorItemToken("actions", action, index)) ? "open" : ""}>
    <summary>${escapeHtml(action.label || action.key || `Actie ${index + 1}`)}</summary><div class="item-body">
    <div class="item-toolbar"><button type="button" aria-label="Verwijder actie ${escapeHtml(action.label || action.key || index + 1)}" data-remove="actions" data-index="${index}">Verwijder</button></div>
    <label>Logische sleutel<input data-collection="actions" data-index="${index}" data-field="key" value="${escapeHtml(action.key)}"></label>
    <label>Label<input data-collection="actions" data-index="${index}" data-field="label" value="${escapeHtml(action.label)}"></label>
    <label>Home Assistant-acties${renderSelector("actions", index, "sequence", action.sequence, { action: {} })}</label>
    <label>Risico<select data-collection="actions" data-index="${index}" data-field="risk">${["safe", "privacy", "costly", "destructive"].map((value) => `<option ${action.risk === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    <label>Bevestigingstekst<input data-collection="actions" data-index="${index}" data-field="confirmation_text" value="${escapeHtml(action.confirmation_text)}"></label>
    <label class="check"><input type="checkbox" data-collection="actions" data-index="${index}" data-field="hold_required" ${action.hold_required ? "checked" : ""}> Hold-to-confirm</label>
    <label>Resultaatcontrole${renderSelector("actions", index, "verification_entity", action.verification_entity, { entity: {} })}</label>
  </div></details>`).join("");
}
