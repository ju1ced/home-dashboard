import type { HomeDashboardConfigV1 } from "../../config/types";
import { escapeHtml, getEditorItemToken, renderSelector } from "../shared";

export function renderSecurityGuidance(): string {
  return `<aside class="guidance"><strong>Privacybediening is optioneel</strong><p>Laat Privacyactie op Geen om alleen de status te tonen. Wil je bedienen, maak dan onder Acties een actie met expliciete target en resultaatcontrole. Risicoklasse en bevestiging stel je bij de actie zelf in.</p><button type="button" data-go-section="actions">Ga naar Acties →</button></aside>`;
}

/**
 * A flat collection: all CRUD goes through the generic `[data-collection]`/`[data-add]`/
 * `[data-remove]` wiring in the main editor shell, so this section only needs rendering.
 */
export function renderCameras(config: HomeDashboardConfigV1, expandedItems: Set<string>): string {
  const actionOptions = [`<option value="">Geen</option>`, ...config.actions.map((action) => `<option value="${escapeHtml(action.key)}">${escapeHtml(action.label || action.key)} · risico: ${escapeHtml(action.risk)}</option>`)].join("");
  return config.security.cameras.map((cameraConfig, index) => `<details class="item" data-item-token="${escapeHtml(getEditorItemToken("security.cameras", cameraConfig, index))}" ${expandedItems.has(getEditorItemToken("security.cameras", cameraConfig, index)) ? "open" : ""}>
    <summary>${escapeHtml(cameraConfig.name || cameraConfig.key || `Camera ${index + 1}`)}</summary><div class="item-body">
    <div class="item-toolbar"><button type="button" aria-label="Verwijder camera ${escapeHtml(cameraConfig.name || cameraConfig.key || index + 1)}" data-remove="security.cameras" data-index="${index}">Verwijder</button></div>
    <label>Logische sleutel<input data-collection="security.cameras" data-index="${index}" data-field="key" value="${escapeHtml(cameraConfig.key)}"></label>
    <label>Naam<input data-collection="security.cameras" data-index="${index}" data-field="name" value="${escapeHtml(cameraConfig.name)}"></label>
    <label>Camera${renderSelector("security.cameras", index, "camera_entity", cameraConfig.camera_entity, { entity: { domain: "camera" } })}</label>
    <label>Privacyinstelling${renderSelector("security.cameras", index, "privacy_entity", cameraConfig.privacy_entity, { entity: { domain: ["switch", "input_boolean", "binary_sensor"] } })}</label>
    <label>Privacyactie <small>Optioneel. Laat op Geen voor alleen status; maak een bedieningsactie eerst onder Acties.</small><select data-collection="security.cameras" data-index="${index}" data-field="privacy_action_key">${actionOptions.replace(`value="${escapeHtml(cameraConfig.privacy_action_key)}"`, `value="${escapeHtml(cameraConfig.privacy_action_key)}" selected`)}</select></label>
    <label>Fallback<select data-collection="security.cameras" data-index="${index}" data-field="fallback">${["placeholder", "last_image", "hidden"].map((value) => `<option ${cameraConfig.fallback === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    <label class="check"><input type="checkbox" data-collection="security.cameras" data-index="${index}" data-field="confirm_privacy_disable" ${cameraConfig.confirm_privacy_disable ? "checked" : ""}> Extra bevestiging bij privacy uitschakelen <small>Optioneel en onafhankelijk van de risicoklasse van de gekozen actie.</small></label>
  </div></details>`).join("");
}
