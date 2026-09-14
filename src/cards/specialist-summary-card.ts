/**
 * Gedeelde opmaak voor de kleine specialistsamenvattingskaarten (Kia, zwembad, ...)
 * op Home en Domeinen. Elke specialist blijft eigenaar van zijn eigen
 * presentatielogica; alleen de herhaalde kaartvorm zit hier gebundeld, wat
 * ook de dashboardbundel binnen het vastgelegde groottebudget houdt.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function extractEntityMap(cardConfig: Record<string, unknown>): Record<string, string> {
  const raw = cardConfig.entities;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).filter(([, value]) => typeof value === "string" && value.trim()).map(([key, value]) => [key, value as string]));
}

export interface HassState {
  state: string;
  attributes?: Record<string, unknown>;
}

export interface HassLike {
  states?: Record<string, HassState | undefined>;
  formatEntityState?: (state: HassState) => string;
}

export function stateFor(hass: HassLike | undefined, entity: string | undefined): HassState | undefined {
  return entity ? hass?.states?.[entity] : undefined;
}

export function isUnavailableState(state: HassState | undefined): boolean {
  return !state || ["unknown", "unavailable"].includes(state.state.toLowerCase());
}

export function stateValue(hass: HassLike | undefined, entity: string | undefined): string {
  const state = stateFor(hass, entity);
  if (isUnavailableState(state)) return "Niet beschikbaar";
  if (typeof hass?.formatEntityState === "function") {
    try {
      return hass.formatEntityState(state as HassState);
    } catch {
      // Een formatterfout mag een read-only ingang niet blokkeren.
    }
  }
  const unit = typeof state?.attributes?.unit_of_measurement === "string" ? state.attributes.unit_of_measurement : "";
  return `${state?.state}${unit ? ` ${unit}` : ""}`;
}

export interface SummaryMetricSpec {
  label: string;
  field: string;
  fallback: string;
}

export interface SummaryMarkupOptions {
  styles: string;
  navigationPath: string;
  ariaLabel: string;
  eyebrow: string;
  icon: string;
  titleFallback: string;
  statusFallback: string;
  metrics: readonly SummaryMetricSpec[];
  footerField: string;
  footerFallback: string;
}

export function summaryCardStyles(extraStatusTones = ""): string {
  return `:host{display:block}a{display:block;color:inherit;text-decoration:none}a:focus-visible{outline:3px solid var(--primary-color);outline-offset:3px;border-radius:24px}ha-card{overflow:hidden;border:1px solid var(--divider-color);border-radius:22px}.main{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;border-bottom:1px solid var(--divider-color)}.eyebrow{margin:0 0 4px;color:var(--primary-color);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}h2{margin:0;font-size:22px}.status{margin:4px 0 0;color:var(--secondary-text-color);font-size:14px;font-weight:650}.status.active,.footer strong{color:var(--primary-color)}.status.warning{color:var(--warning-color)}.status.unavailable{color:var(--disabled-text-color)}${extraStatusTones}.main ha-icon{width:38px;height:38px;color:var(--primary-color)}.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.metric{min-width:0;padding:14px 18px;border-right:1px solid var(--divider-color)}.metric:last-child{border-right:0}.label{display:block;color:var(--secondary-text-color);font-size:12px;font-weight:600}.value{display:block;overflow:hidden;margin-top:3px;font-size:17px;font-variant-numeric:tabular-nums;text-overflow:ellipsis;white-space:nowrap}.footer{display:flex;justify-content:space-between;gap:12px;padding:11px 18px;border-top:1px solid var(--divider-color);color:var(--secondary-text-color);font-size:12px}@media(max-width:620px){.main{padding:16px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.metric{padding:13px 16px}.metric:nth-child(2){border-right:0}.metric:last-child{grid-column:1/-1;border-top:1px solid var(--divider-color)}}`;
}

export function summaryCardMarkup(options: SummaryMarkupOptions): string {
  const metricsHtml = options.metrics.map((metric) => `<div class="metric"><span class="label">${metric.label}</span><strong class="value" data-field="${metric.field}">${metric.fallback}</strong></div>`).join("");
  return `<style>${options.styles}</style><a href="${options.navigationPath}" aria-label="${options.ariaLabel}"><ha-card><div class="main"><div><p class="eyebrow">${options.eyebrow}</p><h2 data-field="title">${options.titleFallback}</h2><p class="status" data-field="status">${options.statusFallback}</p></div><ha-icon icon="${options.icon}"></ha-icon></div><div class="metrics">${metricsHtml}</div><div class="footer"><span data-field="${options.footerField}">${options.footerFallback}</span><strong>Open details</strong></div></ha-card></a>`;
}
