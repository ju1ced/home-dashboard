import type { HomeDashboardConfigV1 } from "../../config/types";
import { escapeHtml } from "../shared";

export function renderSpecialists(config: HomeDashboardConfigV1): string {
  return Object.entries(config.specialists).map(([key, specialist]) => {
    const tag = specialist.card_type.replace(/^custom:/, "");
    const available = typeof customElements !== "undefined" && Boolean(customElements.get(tag));
    const resourceStatus = !specialist.enabled
      ? "Uitgeschakeld."
      : available
        ? "Resource is geladen."
        : "Resource niet gevonden. Installeer of update deze kaart via HACS en herlaad de browser.";
    return `<article class="item">
    <strong>${escapeHtml(key)}</strong><code>${escapeHtml(specialist.card_type)}</code>
    <p class="${specialist.enabled && !available ? "warning" : ""}">${escapeHtml(resourceStatus)}</p>
    <label class="check"><input type="checkbox" data-specialist="${key}" data-field="enabled" ${specialist.enabled ? "checked" : ""}> Inschakelen</label>
    <label>Geteste minimumversie<input data-specialist="${key}" data-field="minimum_version" value="${escapeHtml(specialist.minimum_version)}"></label>
    <label>Logische mappingsleutels<input data-specialist="${key}" data-field="mapping_keys" value="${escapeHtml(specialist.mapping_keys.join(", "))}"></label>
    ${key === "kia" ? `<label>Geavanceerde Kia-cardconfiguratie<small>Deze private configuratie wordt ongewijzigd aan de zelfstandige Kia-card doorgegeven. Gebruik daarin onder meer <code>entities</code>; geen echte mappings in Git opslaan.</small><textarea rows="9" data-specialist="kia" data-field="card_config">${escapeHtml(JSON.stringify(config.specialists.kia.card_config, null, 2))}</textarea></label>` : ""}
    ${key === "printer" ? `<label>Geavanceerde printer-cardconfiguratie<small>Bevat onder meer <code>entities</code> met logische sleutels als <code>status</code>, <code>progress</code>, <code>nozzle_temperature</code>; geen echte mappings in Git opslaan.</small><textarea rows="9" data-specialist="printer" data-field="card_config">${escapeHtml(JSON.stringify(config.specialists.printer.card_config, null, 2))}</textarea></label>` : ""}
    ${key === "pool" ? `<label>Geavanceerde zwembad-cardconfiguratie<small>Bevat onder meer <code>entities</code> met logische sleutels als <code>status</code>, <code>water_temperature</code>, <code>heater_power</code>; geen echte mappings in Git opslaan.</small><textarea rows="9" data-specialist="pool" data-field="card_config">${escapeHtml(JSON.stringify(config.specialists.pool.card_config, null, 2))}</textarea></label>` : ""}
  </article>`;
  }).join("");
}

/**
 * Specialists has its own event shape (enabled/minimum_version/mapping_keys/card_config), distinct
 * from the generic `[data-collection]` CRUD used by the flat-collection sections -- there is no
 * add/remove/reorder here, just per-specialist field edits, including a JSON-textarea field that can
 * reject an edit (invalid JSON) without discarding the previously valid in-memory config.
 */
export function bindSpecialistEvents(root: ParentNode, config: HomeDashboardConfigV1, handlers: { commit: () => void; blockWithMessage: (message: string) => void }): void {
  root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-specialist]").forEach((element) => element.addEventListener("change", () => {
    const specialist = config.specialists[element.dataset.specialist as keyof typeof config.specialists];
    const field = element.dataset.field as "enabled" | "minimum_version" | "mapping_keys" | "card_config";
    if (!specialist || !field) return;
    if (field === "enabled") {
      if (!(element instanceof HTMLInputElement)) return;
      specialist.enabled = element.checked;
    }
    else if (field === "mapping_keys") specialist.mapping_keys = element.value.split(",").map((value) => value.trim()).filter(Boolean);
    else if (field === "card_config") {
      if (!("card_config" in specialist)) return;
      try {
        const parsed = JSON.parse(element.value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("geen object");
        specialist.card_config = parsed as Record<string, unknown>;
      } catch {
        handlers.blockWithMessage("De geavanceerde cardconfiguratie moet geldige JSON-objecttekst zijn; de eerdere geldige configuratie blijft behouden.");
        return;
      }
    }
    else specialist.minimum_version = element.value;
    handlers.commit();
  }));
}
