import type { DiagnosticsConfig, PoolSpecialistConfig } from "../config/types";
import { applyDashboardPalette, type DashboardPalette } from "../theme/palettes";
import { escapeHtml, extractEntityMap, type HassLike, type HassState, isUnavailableState, stateFor, stateValue, summaryCardMarkup, summaryCardStyles } from "./specialist-summary-card";

type LovelaceCardConfig = Record<string, unknown>;

interface PoolSummaryCardConfig {
  type: "custom:home-dashboard-pool-summary";
  pool: PoolSpecialistConfig;
  stale_after_minutes: number;
  navigation_path: string;
  theme_mode?: "system" | "light" | "dark";
  palette?: DashboardPalette;
}

export interface PoolPresentation {
  title: string;
  status: string;
  waterTemperature: string;
  targetTemperature: string;
  ambientTemperature: string;
  heaterPowerText: string;
  tone: "normal" | "warning" | "error" | "unavailable";
  mappingIncomplete: boolean;
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

function poolEntities(pool: PoolSpecialistConfig): Record<string, string> {
  return extractEntityMap(pool.card_config);
}

function isOn(state: HassState | undefined): boolean {
  return Boolean(state && ["on", "true"].includes(state.state.toLowerCase()));
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function numberState(state: HassState | undefined): number | undefined {
  const value = Number(state?.state);
  return Number.isFinite(value) ? value : undefined;
}

/**
 * Vrije statustekst wordt alleen op beschikbaarheid gecontroleerd. De centrale
 * samenvatting volgt de publiek geteste bronprecedence, maar kopieert geen
 * tijdvenster- of merkspecifieke automatiseringslogica uit de zelfstandige card.
 */
export function getPoolPresentation(hass: HassLike | undefined, pool: PoolSpecialistConfig): PoolPresentation {
  const entities = poolEntities(pool);
  const statusEntity = entities.status;
  const waterEntity = entities.water_temperature;
  const targetEntity = entities.target_temperature;
  const ambientEntity = entities.ambient_temperature;
  const heaterPowerEntity = entities.heater_power;
  const mappingIncomplete = !waterEntity || !targetEntity || !ambientEntity || !heaterPowerEntity;

  const errorState = stateFor(hass, entities.has_error);
  const saltSystem = record(pool.card_config.salt_system);
  const saltSwitchEntity = typeof saltSystem.switch === "string" ? saltSystem.switch : "";
  const saltPowerEntity = typeof saltSystem.power === "string" ? saltSystem.power : "";
  const saltThreshold = typeof saltSystem.fault_below_watts === "number" ? saltSystem.fault_below_watts : 15;
  const saltPower = numberState(stateFor(hass, saltPowerEntity));
  const saltFault = Boolean(saltSwitchEntity && saltPowerEntity && isOn(stateFor(hass, saltSwitchEntity)) && saltPower !== undefined && saltPower < saltThreshold);
  const requiredEntities = [waterEntity, targetEntity, ambientEntity, heaterPowerEntity, ...(statusEntity ? [statusEntity] : [])];
  const valuesUnavailable = requiredEntities.some((entity) => isUnavailableState(stateFor(hass, entity)));

  const title = typeof pool.card_config.title === "string" && pool.card_config.title.trim() ? pool.card_config.title : "Zwembad";

  let status = "Zwembadstatus niet beschikbaar";
  let tone: PoolPresentation["tone"] = "unavailable";
  if (mappingIncomplete) {
    status = "Zwembadstatus onvolledig";
    tone = "warning";
  } else if (valuesUnavailable) {
    status = "Zwembadstatus niet beschikbaar";
    tone = "unavailable";
  } else if (isOn(errorState)) {
    status = "Warmtepompfout";
    tone = "error";
  } else if (saltFault) {
    status = "Zoutsysteemfout";
    tone = "error";
  } else if ([heaterPowerEntity, entities.compressor, entities.circulate_pump, entities.filter_pump_state, saltSwitchEntity].some((entity) => isOn(stateFor(hass, entity)))) {
    status = "Installatie actief";
    tone = "normal";
  } else {
    status = "In orde";
    tone = "normal";
  }

  const heaterPowerState = stateFor(hass, heaterPowerEntity);
  const heaterPowerText = isUnavailableState(heaterPowerState) ? "Niet beschikbaar" : isOn(heaterPowerState) ? "Warmtepomp aan" : "Warmtepomp uit";

  return {
    title,
    status,
    waterTemperature: stateValue(hass, waterEntity),
    targetTemperature: stateValue(hass, targetEntity),
    ambientTemperature: stateValue(hass, ambientEntity),
    heaterPowerText,
    tone,
    mappingIncomplete
  };
}

export class HomeDashboardPoolSummary extends HTMLElementBase {
  private config?: PoolSummaryCardConfig;
  private hassValue?: HassLike;

  public setConfig(config: PoolSummaryCardConfig): void {
    if (!config?.pool) throw new Error("Zwembadconfiguratie ontbreekt");
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
      styles: summaryCardStyles(".status.error{color:var(--error-color,#db4437)}"),
      navigationPath: escapeHtml(this.config.navigation_path),
      ariaLabel: "Open zwembaddetails",
      eyebrow: "Buiten",
      icon: "mdi:pool",
      titleFallback: "Zwembad",
      statusFallback: "Zwembadstatus niet beschikbaar",
      metrics: [
        { label: "Water", field: "waterTemperature", fallback: "Niet beschikbaar" },
        { label: "Doel", field: "targetTemperature", fallback: "Niet beschikbaar" },
        { label: "Buiten", field: "ambientTemperature", fallback: "Niet beschikbaar" }
      ],
      footerField: "heaterPowerText",
      footerFallback: "Niet beschikbaar"
    });
    this.updateValues();
  }

  private updateValues(): void {
    if (!this.config || !this.shadowRoot) return;
    const presentation = getPoolPresentation(this.hassValue, this.config.pool);
    // HD-213: before-write checks on the rendered output, not the input entities -- getPoolPresentation()
    // depends on a dynamic, config-driven entity set (salt system, compressor, pumps) that's awkward to
    // enumerate separately and keep in sync; comparing what's about to be written is simpler and can't
    // drift out of date the way a hand-rolled relevant-entity list could.
    for (const key of ["title", "status", "waterTemperature", "targetTemperature", "ambientTemperature", "heaterPowerText"] as const) {
      const element = this.shadowRoot.querySelector<HTMLElement>(`[data-field="${key}"]`);
      if (element && element.textContent !== presentation[key]) element.textContent = presentation[key];
    }
    const status = this.shadowRoot.querySelector<HTMLElement>("[data-field=status]");
    if (status) {
      const toneClass = presentation.tone !== "normal" ? presentation.tone : "";
      for (const tone of ["warning", "error", "unavailable"] as const) {
        if (status.classList.contains(tone) !== (tone === toneClass)) status.classList.toggle(tone, tone === toneClass);
      }
    }
    const ariaLabel = `${presentation.title}: ${presentation.status}.`;
    if (this.getAttribute("aria-label") !== ariaLabel) this.setAttribute("aria-label", ariaLabel);
  }
}

function resourceAvailable(cardType: string): boolean {
  if (typeof customElements === "undefined") return false;
  const tag = cardType.replace(/^custom:/, "");
  return Boolean(customElements.get(tag));
}

function hasPoolSummaryMapping(pool: PoolSpecialistConfig): boolean {
  const entities = poolEntities(pool);
  return Boolean(entities.water_temperature && entities.target_temperature && entities.ambient_temperature && entities.heater_power);
}

/**
 * Net als de printerspecialist is er geen onafhankelijk geteste HACS-kaart
 * voor deze op maat gebouwde zwembadintegratie (ESPHome-warmtepompproxy +
 * Shelly-zoutsysteem). In plaats van zelf een volledige detailweergave met
 * losse tile-kaarten per entiteit op te bouwen (dat brak de specialist-/
 * integratiegrens en paste niet binnen het bundelbudget), levert deze PR
 * bewust alleen de samenvattingskaart, de route en het integratiecontract.
 * Een uitgebreidere detailpagina is toekomstig werk voor een eigen kaart.
 */
export function buildPoolDetailSections(pool: PoolSpecialistConfig | undefined, diagnostics: DiagnosticsConfig | undefined, maxColumns: number, themeMode: "system" | "light" | "dark" = "system", palette?: DashboardPalette): LovelaceCardConfig[] {
  if (!pool?.enabled) return [{ type: "grid", column_span: maxColumns, cards: [{ type: "markdown", title: "Zwembad", content: "De zwembadintegratie is niet ingeschakeld via **Dashboard bewerken → Kia, robot, tuin en zwembad**." }] }];
  const summaryCards: LovelaceCardConfig[] = [{
    type: "custom:home-dashboard-pool-summary",
    pool,
    stale_after_minutes: diagnostics?.stale_after_minutes ?? 30,
    navigation_path: "specialist-pool",
    theme_mode: themeMode,
    palette,
    grid_options: { columns: "full", rows: "auto" }
  }];
  if (!resourceAvailable(pool.card_type)) {
    summaryCards.push({
      type: "markdown",
      title: "Zwembadsamenvatting niet gevonden",
      content: `De ingebouwde samenvattingskaart **${pool.card_type}** kon niet geladen worden. Herlaad de browser; een aparte HACS-installatie is niet nodig.`,
      grid_options: { columns: "full", rows: "auto" }
    });
    return [{ type: "grid", column_span: maxColumns, cards: summaryCards }];
  }
  if (!hasPoolSummaryMapping(pool)) {
    summaryCards.push({
      type: "markdown",
      title: "Zwembadstatus onvolledig",
      content: "Vul in de geavanceerde zwembad-cardconfiguratie minstens `water_temperature`, `target_temperature`, `ambient_temperature` en `heater_power` in. `status` is optioneel.",
      grid_options: { columns: "full", rows: "auto" }
    });
  }
  return [{ type: "grid", column_span: maxColumns, cards: summaryCards }];
}

export function registerHomeDashboardPoolIntegration(): void {
  if (typeof customElements === "undefined") return;
  const tag = "home-dashboard-pool-summary";
  if (!customElements.get(tag)) customElements.define(tag, HomeDashboardPoolSummary);
}
