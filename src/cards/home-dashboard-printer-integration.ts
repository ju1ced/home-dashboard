import type { DiagnosticsConfig, PrinterSpecialistConfig } from "../config/types";
import { applyDashboardPalette, type DashboardPalette } from "../theme/palettes";
import { escapeHtml, extractEntityMap, type HassLike, type HassState, isUnavailableState, stateFor, stateValue, summaryCardMarkup, summaryCardStyles } from "./specialist-summary-card";
import { noAction, readonlyTile } from "./home-dashboard-energy-domain-cards";

type LovelaceCardConfig = Record<string, unknown>;

interface PrinterSummaryCardConfig {
  type: "custom:home-dashboard-printer-summary";
  printer: PrinterSpecialistConfig;
  stale_after_minutes: number;
  navigation_path: string;
  theme_mode?: "system" | "light" | "dark";
  palette?: DashboardPalette;
}

export interface PrinterPresentation {
  title: string;
  status: string;
  progress: string;
  timeRemaining: string;
  nozzleTemperature: string;
  bedTemperature: string;
  tone: "normal" | "warning" | "error" | "unavailable";
  mappingIncomplete: boolean;
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

function printerEntities(printer: PrinterSpecialistConfig): Record<string, string> {
  return extractEntityMap(printer.card_config);
}

function jobFailed(state: HassState | undefined): boolean {
  return Boolean(state && ["on", "true"].includes(state.state.toLowerCase()));
}

/**
 * `job_failed` is de expliciete foutsignaal-entiteit die de printerintegratie
 * blootstelt; op de vrije-tekst `status`-waarde zelf wordt bewust niet
 * fuzzy-gematcht, dat is te taalgevoelig om betrouwbaar te zijn.
 */
export function getPrinterPresentation(hass: HassLike | undefined, printer: PrinterSpecialistConfig): PrinterPresentation {
  const entities = printerEntities(printer);
  const statusEntity = entities.status;
  const progressEntity = entities.progress;
  const timeRemainingEntity = entities.time_remaining;
  const nozzleEntity = entities.nozzle_temperature;
  const bedEntity = entities.bed_temperature;
  const mappingIncomplete = !statusEntity || !progressEntity || !timeRemainingEntity || !nozzleEntity || !bedEntity;

  const statusState = stateFor(hass, statusEntity);
  const failedState = stateFor(hass, entities.job_failed);
  const valuesUnavailable = [statusEntity, progressEntity, nozzleEntity, bedEntity].some((entity) => isUnavailableState(stateFor(hass, entity)));

  const title = typeof printer.card_config.title === "string" && printer.card_config.title.trim() ? printer.card_config.title : "3D-printer";

  let status = "Printerstatus niet beschikbaar";
  let tone: PrinterPresentation["tone"] = "unavailable";
  if (mappingIncomplete) {
    status = "Printerstatus onvolledig";
    tone = "warning";
  } else if (jobFailed(failedState)) {
    status = "Printfout";
    tone = "error";
  } else if (valuesUnavailable) {
    status = "Printerstatus niet beschikbaar";
    tone = "unavailable";
  } else if (statusState) {
    status = statusState.state;
    tone = "normal";
  }

  const readableValues = valuesUnavailable ? undefined : hass;
  return {
    title,
    status,
    progress: stateValue(readableValues, progressEntity),
    timeRemaining: stateValue(readableValues, timeRemainingEntity),
    nozzleTemperature: stateValue(readableValues, nozzleEntity),
    bedTemperature: stateValue(readableValues, bedEntity),
    tone,
    mappingIncomplete
  };
}

export class HomeDashboardPrinterSummary extends HTMLElementBase {
  private config?: PrinterSummaryCardConfig;
  private hassValue?: HassLike;

  public setConfig(config: PrinterSummaryCardConfig): void {
    if (!config?.printer) throw new Error("Printerconfiguratie ontbreekt");
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
      ariaLabel: "Open printerdetails",
      eyebrow: "Werkplaats",
      icon: "mdi:printer-3d-nozzle",
      titleFallback: "3D-printer",
      statusFallback: "Printerstatus niet beschikbaar",
      metrics: [
        { label: "Voortgang", field: "progress", fallback: "Niet beschikbaar" },
        { label: "Nozzle", field: "nozzleTemperature", fallback: "Niet beschikbaar" },
        { label: "Bed", field: "bedTemperature", fallback: "Niet beschikbaar" }
      ],
      footerField: "timeRemaining",
      footerFallback: "Niet beschikbaar"
    });
    this.updateValues();
  }

  private updateValues(): void {
    if (!this.config || !this.shadowRoot) return;
    const presentation = getPrinterPresentation(this.hassValue, this.config.printer);
    for (const key of ["title", "status", "progress", "nozzleTemperature", "bedTemperature", "timeRemaining"] as const) {
      const element = this.shadowRoot.querySelector<HTMLElement>(`[data-field="${key}"]`);
      if (element) element.textContent = presentation[key];
    }
    const status = this.shadowRoot.querySelector<HTMLElement>("[data-field=status]");
    status?.classList.remove("warning", "error", "unavailable");
    if (presentation.tone !== "normal") status?.classList.add(presentation.tone);
    this.setAttribute("aria-label", `${presentation.title}: ${presentation.status}. Resterende tijd: ${presentation.timeRemaining}.`);
  }
}

function resourceAvailable(cardType: string): boolean {
  if (typeof customElements === "undefined") return false;
  const tag = cardType.replace(/^custom:/, "");
  return Boolean(customElements.get(tag));
}

function hasPrinterSummaryMapping(printer: PrinterSpecialistConfig): boolean {
  const entities = printerEntities(printer);
  return Boolean(entities.status && entities.progress && entities.time_remaining && entities.nozzle_temperature && entities.bed_temperature);
}

/**
 * Anders dan Kia is er geen onafhankelijk geteste HACS-kaart voor deze
 * printerintegratie. De volledige detailweergave wordt daarom native met
 * bestaande sectie-, tile- en picture-entity-kaarttypes opgebouwd in plaats
 * van doorgegeven aan een externe kaart. Zoals elders in dit dashboard krijgen
 * deze kaarttypes hun status rechtstreeks van de live hass-context van Home
 * Assistant; het strategy-genereren zelf heeft geen hass beschikbaar.
 */
export function buildPrinterDetailSections(printer: PrinterSpecialistConfig | undefined, diagnostics: DiagnosticsConfig | undefined, maxColumns: number, themeMode: "system" | "light" | "dark" = "system", palette?: DashboardPalette): LovelaceCardConfig[] {
  if (!printer?.enabled) return [{ type: "grid", column_span: maxColumns, cards: [{ type: "markdown", title: "3D-printer", content: "De printerintegratie is niet ingeschakeld via **Dashboard bewerken → Kia, 3D-printer, robot, tuin en zwembad**." }] }];
  const summaryCards: LovelaceCardConfig[] = [{
    type: "custom:home-dashboard-printer-summary",
    printer,
    stale_after_minutes: diagnostics?.stale_after_minutes ?? 30,
    navigation_path: "specialist-printer",
    theme_mode: themeMode,
    palette,
    grid_options: { columns: "full", rows: "auto" }
  }];
  if (!resourceAvailable(printer.card_type)) {
    summaryCards.push({
      type: "markdown",
      title: "Printersamenvatting niet gevonden",
      content: `De ingebouwde samenvattingskaart **${printer.card_type}** kon niet geladen worden. Herlaad de browser; een aparte HACS-installatie is niet nodig.`,
      grid_options: { columns: "full", rows: "auto" }
    });
    return [{ type: "grid", column_span: maxColumns, cards: summaryCards }];
  }
  if (!hasPrinterSummaryMapping(printer)) {
    summaryCards.push({
      type: "markdown",
      title: "Printerstatus onvolledig",
      content: "Vul in de geavanceerde printer-cardconfiguratie minstens `status`, `progress`, `time_remaining`, `nozzle_temperature` en `bed_temperature` in.",
      grid_options: { columns: "full", rows: "auto" }
    });
  }
  const sections: LovelaceCardConfig[] = [{ type: "grid", column_span: maxColumns, cards: summaryCards }];

  const entities = printerEntities(printer);
  const detailCards: LovelaceCardConfig[] = [];
  if (entities.nozzle_target) detailCards.push(readonlyTile(entities.nozzle_target, "Nozzledoeltemperatuur"));
  if (entities.bed_target) detailCards.push(readonlyTile(entities.bed_target, "Beddoeltemperatuur"));
  if (entities.last_error) detailCards.push(readonlyTile(entities.last_error, "Laatste fout"));
  if (detailCards.length > 0) {
    sections.push({ type: "grid", column_span: maxColumns, cards: [{ type: "heading", heading: "Printdetails", icon: "mdi:printer-3d-nozzle-outline", grid_options: { columns: "full", rows: "auto" } }, ...detailCards] });
  }

  if (entities.camera_entity) {
    sections.push({
      type: "grid",
      column_span: maxColumns,
      cards: [{
        type: "picture-entity",
        entity: entities.camera_entity,
        camera_view: "auto",
        show_name: true,
        show_state: false,
        tap_action: noAction(),
        hold_action: noAction(),
        double_tap_action: noAction(),
        grid_options: { columns: "full", rows: "auto" }
      }]
    });
  }

  return sections;
}

export function registerHomeDashboardPrinterIntegration(): void {
  if (typeof customElements === "undefined") return;
  const tag = "home-dashboard-printer-summary";
  if (!customElements.get(tag)) customElements.define(tag, HomeDashboardPrinterSummary);
}
