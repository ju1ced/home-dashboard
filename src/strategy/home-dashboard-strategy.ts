import { migrateConfig } from "../config/migrate";
import { validateConfig } from "../config/validate";
import { validateConfigSchema } from "../config/schema-validator";
import type { HomeDashboardConfigV1, ViewPath } from "../config/types";
import type { HomeDashboardViewConfig } from "./home-dashboard-view-strategy";
import { roomPath } from "../cards/home-dashboard-room-cards";

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
  public static readonly registryDependencies: string[] = [];

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
    if (errors.length > 0) return preview(config.general.title, `Open de dashboardinstellingen: ${errors.length} configuratiefout(en) blokkeren de opbouw.`);
    const orderedPaths = [config.general.start_view, ...config.layout.view_order.filter((path) => path !== config.general.start_view)];
    return {
      title: config.general.title,
      views: [
        ...orderedPaths.map((path) => createView(path, config)),
        ...config.rooms.map((room) => createRoomView(room, config))
      ]
    };
  }
}

const viewMetadata: Record<ViewPath, { title: string; icon: string }> = {
  home: { title: "Home", icon: "mdi:home" },
  rooms: { title: "Kamers", icon: "mdi:floor-plan" },
  energy: { title: "Energie", icon: "mdi:lightning-bolt" },
  domains: { title: "Domeinen", icon: "mdi:view-grid-outline" },
  more: { title: "Meer", icon: "mdi:dots-horizontal-circle-outline" }
};

function createViewStrategy(path: ViewPath, config: HomeDashboardConfigV1): HomeDashboardViewConfig {
  const base: HomeDashboardViewConfig = { type: "custom:home-dashboard-view", view: path, density: config.general.density };
  if (path === "home") return { ...base, today: config.today, show_weather: config.layout.show_weather, persons: config.layout.show_persons ? config.persons : [], security: config.layout.show_security ? config.security : { ...config.security, enabled: false }, rooms: config.rooms, specialists: config.specialists, diagnostics: config.diagnostics, energy: config.energy };
  if (path === "rooms" || path === "domains") return { ...base, rooms: config.rooms };
  if (path === "energy") return { ...base, energy: config.energy };
  return { ...base, specialists: config.specialists, counts: { rooms: config.rooms.length, persons: config.persons.length, cameras: config.security.cameras.length } };
}

function createView(path: ViewPath, config: HomeDashboardConfigV1): Record<string, unknown> {
  return {
    title: viewMetadata[path].title,
    path,
    icon: viewMetadata[path].icon,
    show_icon_and_title: true,
    subview: false,
    strategy: createViewStrategy(path, config)
  };
}

function createRoomView(room: HomeDashboardConfigV1["rooms"][number], config: HomeDashboardConfigV1): Record<string, unknown> {
  return {
    title: room.name,
    path: roomPath(room),
    icon: room.icon || "mdi:sofa-outline",
    subview: true,
    back_path: "rooms",
    strategy: {
      type: "custom:home-dashboard-view",
      view: "room",
      density: config.general.density,
      room
    } satisfies HomeDashboardViewConfig
  };
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
