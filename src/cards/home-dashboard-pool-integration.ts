import type { DiagnosticsConfig, PoolSpecialistConfig } from "../config/types";
import { applyDashboardPalette, type DashboardPalette } from "../theme/palettes";
import { escapeHtml, extractEntityMap, type HassLike, type HassState, isUnavailableState, stateFor, stateValue, summaryCardMarkup, summaryCardStyles } from "./specialist-summary-card";
import { readonlyTile } from "./home-dashboard-energy-domain-cards";

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

/**
 * `has_error` en `salt_system_fault` zijn de expliciete foutsignaal-
 * entiteiten die deze zwembadintegratie blootstelt; op de vrije-tekst
 * `status`-waarde zelf wordt bewust niet fuzzy-gematcht.
 */
export function getPoolPresentation(hass: HassLike | undefined, pool: PoolSpecialistConfig): PoolPresentation {
  const entities = poolEntities(pool);
  const statusEntity = entities.status;
  const waterEntity = entities.water_temperature;
  const targetEntity = entities.target_temperature;
  const ambientEntity = entities.ambient_temperature;
  const heaterPowerEntity = entities.heater_power;
  const mappingIncomplete = !statusEntity || !waterEntity || !targetEntity || !ambientEntity || !heaterPowerEntity;

  const statusState = stateFor(hass, statusEntity);
  const errorState = stateFor(hass, entities.has_error);
  const saltFaultState = stateFor(hass, entities.salt_system_fault);
  const valuesUnavailable = [statusEntity, waterEntity, targetEntity, ambientEntity].some((entity) => isUnavailableState(stateFor(hass, entity)));

  const title = typeof pool.card_config.title === "string" && pool.card_config.title.trim() ? pool.card_config.title : "Zwembad";

  let status = "Zwembadstatus niet beschikbaar";
  let tone: PoolPresentation["tone"] = "unavailable";
  if (mappingIncomplete) {
    status = "Zwembadstatus onvolledig";
    tone = "warning";
  } else if (isOn(errorState)) {
    status = "Warmtepompfout";
    tone = "error";
  } else if (isOn(saltFaultState)) {
    status = "Zoutsysteemfout";
    tone = "error";
  } else if (valuesUnavailable) {
    status = "Zwembadstatus niet beschikbaar";
    tone = "unavailable";
  } else if (!isOn(stateFor(hass, heaterPowerEntity))) {
    status = "Warmtepomp uit";
    tone = "normal";
  } else if (statusState) {
    status = statusState.state;
    tone = "normal";
  }

  const heaterPowerState = stateFor(hass, heaterPowerEntity);
  const heaterPowerText = isUnavailableState(heaterPowerState) ? "Niet beschikbaar" : isOn(heaterPowerState) ? "Warmtepomp aan" : "Warmtepomp uit";

  const readableValues = valuesUnavailable ? undefined : hass;
  return {
    title,
    status,
    waterTemperature: stateValue(readableValues, waterEntity),
    targetTemperature: stateValue(readableValues, targetEntity),
    ambientTemperature: stateValue(readableValues, ambientEntity),
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
    for (const key of ["title", "status", "waterTemperature", "targetTemperature", "ambientTemperature", "heaterPowerText"] as const) {
      const element = this.shadowRoot.querySelector<HTMLElement>(`[data-field="${key}"]`);
      if (element) element.textContent = presentation[key];
    }
    const status = this.shadowRoot.querySelector<HTMLElement>("[data-field=status]");
    status?.classList.remove("warning", "error", "unavailable");
    if (presentation.tone !== "normal") status?.classList.add(presentation.tone);
    this.setAttribute("aria-label", `${presentation.title}: ${presentation.status}.`);
  }
}

function resourceAvailable(cardType: string): boolean {
  if (typeof customElements === "undefined") return false;
  const tag = cardType.replace(/^custom:/, "");
  return Boolean(customElements.get(tag));
}

function hasPoolSummaryMapping(pool: PoolSpecialistConfig): boolean {
  const entities = poolEntities(pool);
  return Boolean(entities.status && entities.water_temperature && entities.target_temperature && entities.ambient_temperature && entities.heater_power);
}

/**
 * Net als de printerspecialist is er geen onafhankelijk geteste HACS-kaart
 * voor deze op maat gebouwde zwembadintegratie (ESPHome-warmtepompproxy +
 * Shelly-zoutsysteem). De volledige detailweergave wordt daarom native met
 * bestaande tile-kaarttypes opgebouwd in plaats van doorgegeven aan een
 * externe kaart. Het strategy-genereren zelf heeft geen hass beschikbaar;
 * de tiles krijgen hun status rechtstreeks van de live hass-context.
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
      content: "Vul in de geavanceerde zwembad-cardconfiguratie minstens `status`, `water_temperature`, `target_temperature`, `ambient_temperature` en `heater_power` in.",
      grid_options: { columns: "full", rows: "auto" }
    });
  }
  const sections: LovelaceCardConfig[] = [{ type: "grid", column_span: maxColumns, cards: summaryCards }];

  const entities = poolEntities(pool);
  const heatpumpCards: LovelaceCardConfig[] = [];
  if (entities.compressor) heatpumpCards.push(readonlyTile(entities.compressor, "Compressor"));
  if (entities.circulate_pump) heatpumpCards.push(readonlyTile(entities.circulate_pump, "Circulatiepomp"));
  if (entities.coil_temperature) heatpumpCards.push(readonlyTile(entities.coil_temperature, "Coiltemperatuur"));
  if (entities.exhaust_temperature) heatpumpCards.push(readonlyTile(entities.exhaust_temperature, "Uitlaattemperatuur"));
  if (entities.error_description) heatpumpCards.push(readonlyTile(entities.error_description, "Foutomschrijving"));
  if (heatpumpCards.length > 0) {
    sections.push({ type: "grid", column_span: maxColumns, cards: [{ type: "heading", heading: "Warmtepomp", icon: "mdi:heat-pump-outline", grid_options: { columns: "full", rows: "auto" } }, ...heatpumpCards] });
  }

  const systemCards: LovelaceCardConfig[] = [];
  if (entities.filter_pump_state) systemCards.push(readonlyTile(entities.filter_pump_state, "Filterpomp"));
  if (entities.salt_system_fault) systemCards.push(readonlyTile(entities.salt_system_fault, "Zoutsysteem"));
  if (entities.proxy_online) systemCards.push(readonlyTile(entities.proxy_online, "Warmtepompverbinding"));
  if (systemCards.length > 0) {
    sections.push({ type: "grid", column_span: maxColumns, cards: [{ type: "heading", heading: "Systemen", icon: "mdi:pump", grid_options: { columns: "full", rows: "auto" } }, ...systemCards] });
  }

  return sections;
}

export function registerHomeDashboardPoolIntegration(): void {
  if (typeof customElements === "undefined") return;
  const tag = "home-dashboard-pool-summary";
  if (!customElements.get(tag)) customElements.define(tag, HomeDashboardPoolSummary);
}
