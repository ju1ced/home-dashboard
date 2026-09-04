import type { DiagnosticsConfig, KiaSpecialistConfig } from "../config/types";

type LovelaceCardConfig = Record<string, unknown>;

interface HassState {
  state: string;
  last_updated?: string;
  attributes?: Record<string, unknown>;
}

interface HassLike {
  states?: Record<string, HassState | undefined>;
  formatEntityState?: (state: HassState) => string;
}

interface KiaSummaryCardConfig {
  type: "custom:home-dashboard-kia-summary";
  kia: KiaSpecialistConfig;
  stale_after_minutes: number;
  navigation_path: string;
  theme_mode?: "system" | "light" | "dark";
}

export interface KiaPresentation {
  title: string;
  status: string;
  battery: string;
  range: string;
  charging: string;
  freshness: string;
  tone: "normal" | "active" | "warning" | "unavailable";
  mappingIncomplete: boolean;
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cardEntities(kia: KiaSpecialistConfig): Record<string, string> {
  const raw = kia.card_config.entities;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).filter(([, value]) => typeof value === "string" && value.trim()).map(([key, value]) => [key, value as string]));
}

function stateFor(hass: HassLike | undefined, entity: string | undefined): HassState | undefined {
  return entity ? hass?.states?.[entity] : undefined;
}

function unavailable(state: HassState | undefined): boolean {
  return !state || ["unknown", "unavailable"].includes(state.state.toLowerCase());
}

function stateValue(hass: HassLike | undefined, entity: string | undefined): string {
  const state = stateFor(hass, entity);
  if (!state || ["unknown", "unavailable"].includes(state.state.toLowerCase())) return "Niet beschikbaar";
  if (typeof hass?.formatEntityState === "function") {
    try {
      return hass.formatEntityState(state);
    } catch {
      // Een formatterfout mag de read-only Kia-ingang niet blokkeren.
    }
  }
  const unit = typeof state.attributes?.unit_of_measurement === "string" ? state.attributes.unit_of_measurement : "";
  return `${state.state}${unit ? ` ${unit}` : ""}`;
}

function minutesAgo(value: string | undefined, now: Date): number | undefined {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return undefined;
  return Math.max(0, Math.floor((now.getTime() - timestamp) / 60000));
}

function freshnessText(minutes: number | undefined): string {
  if (minutes === undefined) return "Dataversheid niet beschikbaar";
  if (minutes < 2) return "Zojuist bijgewerkt";
  if (minutes < 60) return `${minutes} min geleden bijgewerkt`;
  const hours = Math.floor(minutes / 60);
  return `${hours} u geleden bijgewerkt`;
}

function charging(state: HassState | undefined): boolean {
  return Boolean(state && ["on", "charging", "active", "opladen"].includes(state.state.toLowerCase()));
}

function unlocked(state: HassState | undefined): boolean {
  return Boolean(state && ["unlocked", "open", "on", "ontgrendeld"].includes(state.state.toLowerCase()));
}

export function getKiaPresentation(hass: HassLike | undefined, kia: KiaSpecialistConfig, staleAfterMinutes: number, now = new Date()): KiaPresentation {
  const entities = cardEntities(kia);
  const batteryEntity = entities.battery_level;
  const rangeEntity = entities.battery_range;
  const chargingEntity = entities.charging_state;
  const updatedEntity = entities.last_updated;
  const lockEntity = entities.door_lock;
  const mappingIncomplete = !batteryEntity || !rangeEntity || !chargingEntity || !updatedEntity;
  const updatedState = stateFor(hass, updatedEntity);
  const freshnessMinutes = minutesAgo(updatedState?.state, now);
  const valuesUnavailable = [batteryEntity, rangeEntity, chargingEntity, updatedEntity].some((entity) => unavailable(stateFor(hass, entity)));
  const stale = freshnessMinutes === undefined || freshnessMinutes >= staleAfterMinutes;
  const isCharging = charging(stateFor(hass, chargingEntity));
  const securityWarning = unlocked(stateFor(hass, lockEntity));
  const title = typeof kia.card_config.title === "string" && kia.card_config.title.trim() ? kia.card_config.title : "Kia";

  let status = "Voertuig klaar";
  let tone: KiaPresentation["tone"] = "normal";
  if (mappingIncomplete) {
    status = "Voertuigstatus onvolledig";
    tone = "warning";
  } else if (valuesUnavailable) {
    status = "Voertuigstatus niet beschikbaar";
    tone = "unavailable";
  } else if (stale) {
    status = "Voertuigstatus verouderd";
    tone = "warning";
  } else if (securityWarning) {
    status = "Voertuig niet vergrendeld";
    tone = "warning";
  } else if (isCharging) {
    status = "Auto laadt";
    tone = "active";
  }

  const readableValues = stale || valuesUnavailable ? undefined : hass;
  return {
    title,
    status,
    battery: stateValue(readableValues, batteryEntity),
    range: stateValue(readableValues, rangeEntity),
    charging: stateValue(readableValues, chargingEntity),
    freshness: freshnessText(freshnessMinutes),
    tone,
    mappingIncomplete
  };
}

export class HomeDashboardKiaSummary extends HTMLElementBase {
  private config?: KiaSummaryCardConfig;
  private hassValue?: HassLike;

  public setConfig(config: KiaSummaryCardConfig): void {
    if (!config?.kia) throw new Error("Kia-configuratie ontbreekt");
    this.config = config;
    this.render();
  }

  public set hass(value: HassLike) {
    this.hassValue = value;
    if (!this.shadowRoot) this.render();
    else this.updateValues();
  }

  public getCardSize(): number {
    return 2;
  }

  public getGridOptions(): Record<string, unknown> {
    return { columns: "full", rows: "auto", min_rows: 2 };
  }

  public connectedCallback(): void {
    if (!this.shadowRoot) this.render();
  }

  private render(): void {
    if (!this.config) return;
    const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    root.innerHTML = `<style>
      :host{display:block}a{display:block;color:inherit;text-decoration:none}a:focus-visible{outline:3px solid var(--primary-color);outline-offset:3px;border-radius:24px}ha-card{overflow:hidden;border:1px solid var(--divider-color);border-radius:22px}.main{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;border-bottom:1px solid var(--divider-color)}.eyebrow{margin:0 0 4px;color:var(--primary-color);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}h2{margin:0;font-size:22px}.status{margin:4px 0 0;color:var(--secondary-text-color);font-size:14px;font-weight:650}.status.active,.footer strong{color:var(--primary-color)}.status.warning{color:var(--warning-color)}.status.unavailable{color:var(--disabled-text-color)}.main ha-icon{width:38px;height:38px;color:var(--primary-color)}.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.metric{min-width:0;padding:14px 18px;border-right:1px solid var(--divider-color)}.metric:last-child{border-right:0}.label{display:block;color:var(--secondary-text-color);font-size:12px;font-weight:600}.value{display:block;overflow:hidden;margin-top:3px;font-size:17px;font-variant-numeric:tabular-nums;text-overflow:ellipsis;white-space:nowrap}.footer{display:flex;justify-content:space-between;gap:12px;padding:11px 18px;border-top:1px solid var(--divider-color);color:var(--secondary-text-color);font-size:12px}@media(max-width:620px){.main{padding:16px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.metric{padding:13px 16px}.metric:nth-child(2){border-right:0}.metric:last-child{grid-column:1/-1;border-top:1px solid var(--divider-color)}}
    </style><a href="${escapeHtml(this.config.navigation_path)}" aria-label="Open Kia-details"><ha-card><div class="main"><div><p class="eyebrow">Mobiliteit</p><h2 data-field="title">Kia</h2><p class="status" data-field="status">Voertuigstatus niet beschikbaar</p></div><ha-icon icon="mdi:car-electric"></ha-icon></div><div class="metrics"><div class="metric"><span class="label">Accu</span><strong class="value" data-field="battery">Niet beschikbaar</strong></div><div class="metric"><span class="label">Bereik</span><strong class="value" data-field="range">Niet beschikbaar</strong></div><div class="metric"><span class="label">Laden</span><strong class="value" data-field="charging">Niet beschikbaar</strong></div></div><div class="footer"><span data-field="freshness">Dataversheid niet beschikbaar</span><strong>Open details</strong></div></ha-card></a>`;
    this.updateValues();
  }

  private updateValues(): void {
    if (!this.config || !this.shadowRoot) return;
    const presentation = getKiaPresentation(this.hassValue, this.config.kia, this.config.stale_after_minutes);
    for (const key of ["title", "status", "battery", "range", "charging", "freshness"] as const) {
      const element = this.shadowRoot.querySelector<HTMLElement>(`[data-field="${key}"]`);
      if (element) element.textContent = presentation[key];
    }
    const status = this.shadowRoot.querySelector<HTMLElement>("[data-field=status]");
    status?.classList.remove("active", "warning", "unavailable");
    if (presentation.tone !== "normal") status?.classList.add(presentation.tone);
    this.setAttribute("aria-label", `${presentation.title}: ${presentation.status}. ${presentation.freshness}.`);
  }
}

function resourceAvailable(cardType: string): boolean {
  if (typeof customElements === "undefined") return false;
  const tag = cardType.replace(/^custom:/, "");
  return Boolean(customElements.get(tag));
}

function hasKiaSummaryMapping(kia: KiaSpecialistConfig): boolean {
  const entities = cardEntities(kia);
  return Boolean(entities.battery_level && entities.battery_range && entities.charging_state && entities.last_updated);
}

function kiaCardConfig(kia: KiaSpecialistConfig): LovelaceCardConfig {
  const { type: _ignoredType, ...upstream } = kia.card_config;
  return { ...upstream, type: kia.card_type, grid_options: { columns: "full", rows: "auto" } };
}

export function buildKiaDetailSections(kia: KiaSpecialistConfig | undefined, diagnostics: DiagnosticsConfig | undefined, maxColumns: number, themeMode: "system" | "light" | "dark" = "system"): LovelaceCardConfig[] {
  if (!kia?.enabled) return [{ type: "grid", column_span: maxColumns, cards: [{ type: "markdown", title: "Kia", content: "De Kia-integratie is niet ingeschakeld via **Dashboard bewerken → Specialisten**." }] }];
  const cards: LovelaceCardConfig[] = [{
    type: "custom:home-dashboard-kia-summary",
    kia,
    stale_after_minutes: diagnostics?.stale_after_minutes ?? 30,
    navigation_path: "specialist-kia",
    theme_mode: themeMode,
    grid_options: { columns: "full", rows: "auto" }
  }];
  if (!resourceAvailable(kia.card_type)) {
    cards.push({
      type: "markdown",
      title: "Kia-card niet gevonden",
      content: `Installeer of update **${kia.card_type}** via HACS en herlaad daarna de browser. Verwachte minimale versie: **${kia.minimum_version || "nog niet vastgelegd"}**. De rest van dit dashboard blijft read-only beschikbaar.`,
      grid_options: { columns: "full", rows: "auto" }
    });
  } else {
    if (!hasKiaSummaryMapping(kia)) {
      cards.push({
        type: "markdown",
        title: "Voertuigstatus onvolledig",
        content: "Vul in de geavanceerde Kia-cardconfiguratie minstens `battery_level`, `battery_range`, `charging_state` en `last_updated` in. De Kia-card toont daarna haar eigen mappingdiagnose.",
        grid_options: { columns: "full", rows: "auto" }
      });
    }
    cards.push(kiaCardConfig(kia));
  }
  return [{ type: "grid", column_span: maxColumns, cards }];
}

export function registerHomeDashboardKiaIntegration(): void {
  if (typeof customElements === "undefined") return;
  const tag = "home-dashboard-kia-summary";
  if (!customElements.get(tag)) customElements.define(tag, HomeDashboardKiaSummary);
}
