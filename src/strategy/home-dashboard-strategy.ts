import { migrateConfig } from "../config/migrate";
import { validateConfig } from "../config/validate";
import { validateConfigSchema } from "../config/schema-validator";

interface StrategyMetadata {
  type: string;
  strategyType: "dashboard";
  name: string;
  description: string;
  documentationURL: string;
}

declare global {
  interface Window {
    customStrategies?: StrategyMetadata[];
  }
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

function preview(title: string, status: string): Record<string, unknown> {
  return {
    title,
    views: [{
      title: "Home",
      path: "home",
      type: "sections",
      max_columns: 1,
      sections: [{
        type: "grid",
        cards: [{
          type: "markdown",
          title: "Home Dashboard configuratiepreview",
          content: `${status}\n\nDeze prerelease voert geen acties of Home Assistant-writes uit.`
        }]
      }]
    }]
  };
}

export class HomeDashboardStrategy extends HTMLElementBase {
  public static readonly configRequired = true;

  public static getCreateSuggestions(): { title: string; icon: string } {
    return { title: "Home Dashboard", icon: "mdi:home-assistant" };
  }

  public static getConfigElement(): HTMLElement {
    return document.createElement("home-dashboard-strategy-editor");
  }

  public static async generate(input: unknown): Promise<Record<string, unknown>> {
    let config;
    try {
      config = migrateConfig(input).config;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return preview("Home Dashboard", `Open de dashboardinstellingen: de configuratie is geblokkeerd (${message}).`);
    }
    const errors = [...validateConfigSchema(config), ...validateConfig(config)].filter((candidate) => candidate.severity === "error");
    const status = errors.length === 0
      ? "De configuratie is geldig. De vijf volledige views volgen in v0.3.0-alpha.1."
      : `Open de dashboardinstellingen: ${errors.length} configuratiefout(en) blokkeren de opbouw.`;
    return preview(config.general.title, status);
  }
}

export function registerHomeDashboardStrategy(): void {
  if (typeof customElements === "undefined" || typeof window === "undefined") return;
  const tag = "ll-strategy-dashboard-home-dashboard";
  if (!customElements.get(tag)) customElements.define(tag, HomeDashboardStrategy);
  window.customStrategies ??= [];
  if (!window.customStrategies.some((strategy) => strategy.type === "home-dashboard" && strategy.strategyType === "dashboard")) {
    window.customStrategies.push({
      type: "home-dashboard",
      strategyType: "dashboard",
      name: "Home Dashboard",
      description: "Een privacyveilig centraal dashboard met volledige grafische configuratie.",
      documentationURL: "https://github.com/ju1ced/home-dashboard"
    });
  }
}
