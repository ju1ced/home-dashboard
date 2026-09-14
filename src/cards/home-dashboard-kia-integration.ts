import type { DiagnosticsConfig, KiaSpecialistConfig } from "../config/types";
import { applyDashboardPalette, type DashboardPalette } from "../theme/palettes";
import { escapeHtml, extractEntityMap, type HassLike, type HassState, isUnavailableState, stateFor, stateValue, summaryCardMarkup, summaryCardStyles } from "./specialist-summary-card";

type LovelaceCardConfig = Record<string, unknown>;

interface KiaSummaryCardConfig {
  type: "custom:home-dashboard-kia-summary";
  kia: KiaSpecialistConfig;
  stale_after_minutes: number;
  navigation_path: string;
  theme_mode?: "system" | "light" | "dark";
  palette?: DashboardPalette;
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

function cardEntities(kia: KiaSpecialistConfig): Record<string, string> {
  return extractEntityMap(kia.card_config);
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
  const valuesUnavailable = [batteryEntity, rangeEntity, chargingEntity, updatedEntity].some((entity) => isUnavailableState(stateFor(hass, entity)));
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
    applyDashboardPalette(this, config.palette, config.theme_mode);
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
    root.innerHTML = summaryCardMarkup({
      styles: summaryCardStyles(),
      navigationPath: escapeHtml(this.config.navigation_path),
      ariaLabel: "Open Kia-details",
      eyebrow: "Mobiliteit",
      icon: "mdi:car-electric",
      titleFallback: "Kia",
      statusFallback: "Voertuigstatus niet beschikbaar",
      metrics: [
        { label: "Accu", field: "battery", fallback: "Niet beschikbaar" },
        { label: "Bereik", field: "range", fallback: "Niet beschikbaar" },
        { label: "Laden", field: "charging", fallback: "Niet beschikbaar" }
      ],
      footerField: "freshness",
      footerFallback: "Dataversheid niet beschikbaar"
    });
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

export function buildKiaDetailSections(kia: KiaSpecialistConfig | undefined, diagnostics: DiagnosticsConfig | undefined, maxColumns: number, themeMode: "system" | "light" | "dark" = "system", palette?: DashboardPalette): LovelaceCardConfig[] {
  if (!kia?.enabled) return [{ type: "grid", column_span: maxColumns, cards: [{ type: "markdown", title: "Kia", content: "De Kia-integratie is niet ingeschakeld via **Dashboard bewerken → Specialisten**." }] }];
  const cards: LovelaceCardConfig[] = [{
    type: "custom:home-dashboard-kia-summary",
    kia,
    stale_after_minutes: diagnostics?.stale_after_minutes ?? 30,
    navigation_path: "specialist-kia",
    theme_mode: themeMode,
    palette,
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
