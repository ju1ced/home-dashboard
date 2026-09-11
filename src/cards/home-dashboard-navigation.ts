import type { DashboardPalette, ViewPath } from "../config/types";
import { applyDashboardPalette } from "../theme/palettes";
import { attachKiosk, dashboardShell } from "./dashboard-shell";

interface NavigationConfig {
  type: "custom:home-dashboard-navigation";
  active?: ViewPath | "room" | "specialist-kia";
  palette?: DashboardPalette;
  theme_mode?: "system" | "light" | "dark";
  navigation_mode?: "native" | "integrated" | "kiosk";
}

interface CustomCardMetadata { type: string; name: string; description: string; preview?: boolean }
interface NavigationHass { user?: { is_admin?: boolean }; localize?: (key: string) => string }

declare global { interface Window { customCards?: CustomCardMetadata[] } }

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;
const links: ReadonlyArray<readonly [ViewPath, string, string]> = [
  ["home", "Home", "mdi:home-outline"],
  ["rooms", "Kamers", "mdi:floor-plan"],
  ["energy", "Energie", "mdi:lightning-bolt-outline"],
  ["domains", "Domeinen", "mdi:view-grid-outline"],
  ["more", "Meer", "mdi:dots-horizontal-circle-outline"]
];

export class HomeDashboardNavigation extends HTMLElementBase {
  private config?: NavigationConfig;
  private releaseKiosk: (() => void) | undefined;
  private currentHass?: NavigationHass;
  private showHeader = false;

  public set hass(hass: NavigationHass) {
    const changed = Boolean(this.currentHass?.user?.is_admin) !== Boolean(hass.user?.is_admin);
    this.currentHass = hass;
    if (changed) this.render();
  }

  public connectedCallback(): void {
    this.syncKiosk();
  }

  public disconnectedCallback(): void {
    this.releaseKiosk?.();
    this.releaseKiosk = undefined;
  }

  private syncKiosk(): void {
    this.releaseKiosk?.();
    this.releaseKiosk = this.isConnected && !this.showHeader && this.config?.navigation_mode === "kiosk" ? attachKiosk(this) : undefined;
  }

  public constructor() {
    super();
    if (this.attachShadow) this.attachShadow({ mode: "open" });
  }

  public setConfig(config: NavigationConfig): void {
    if (this.config?.navigation_mode !== config.navigation_mode) this.showHeader = false;
    this.config = config;
    applyDashboardPalette(this, config.palette, config.theme_mode);
    this.render();
    this.syncKiosk();
  }

  private openConfiguration(): void {
    if (!this.currentHass?.user?.is_admin) return;
    const root = dashboardShell(this)?.shadowRoot;
    const key = "ui.panel.lovelace.menu.configure_ui";
    const label = this.currentHass.localize?.(key);
    const button = label ? [...(root?.querySelectorAll<HTMLElement & { label?: string }>(".header ha-icon-button") ?? [])].find((candidate) => candidate.label?.trim() === label) : undefined;
    if (button && !button.hasAttribute("disabled")) {
      button.click();
      return;
    }
    const item = [...(root?.querySelectorAll<HTMLElement & { value?: string }>(".header ha-dropdown-item") ?? [])].find((candidate) => candidate.value === key);
    if (item && !item.hasAttribute("disabled")) {
      // Use HA's own menu handler and strategy editor, never a private method
      // or a second configuration-saving API.
      item.closest("ha-dropdown")?.dispatchEvent(new CustomEvent("wa-select", { detail: { item }, bubbles: true, composed: true }));
      return;
    }
    this.showHeader = true;
    this.syncKiosk();
    this.render();
    const status = this.shadowRoot?.querySelector<HTMLElement>("[role=status]");
    if (status) status.textContent = "Open Dashboard bewerken via het Home Assistant-menu. Dashboardbeheer is ook hieronder bereikbaar.";
  }

  private render(): void {
    if (!this.shadowRoot || !this.config) return;
    const style = document.createElement("style");
    style.textContent = `:host{display:block;min-width:0;--hd-hero:var(--primary-color,#087fb9)}*{box-sizing:border-box}nav{display:flex;align-items:center;gap:8px;min-height:66px;padding:10px 14px;border-radius:18px;background:var(--hd-hero);box-shadow:0 1px 2px rgb(20 35 28/.06),0 7px 24px rgb(20 35 28/.035);overflow-x:auto;scrollbar-width:none}nav::-webkit-scrollbar{display:none}a{display:flex;flex:0 0 auto;align-items:center;gap:8px;min-height:44px;padding:8px 13px;border:1px solid rgb(255 255 255/.28);border-radius:12px;background:rgb(255 255 255/.10);color:#fff;text-decoration:none;font-size:.84rem;font-weight:750}a:hover,a:focus-visible{background:rgb(255 255 255/.20);border-color:rgb(255 255 255/.58);outline:0}a[aria-current=page]{background:#fff;border-color:#fff;color:var(--hd-hero);box-shadow:0 3px 12px rgb(0 0 0/.13)}ha-icon{width:20px;height:20px}@media(max-width:560px){nav{border-radius:15px;padding:8px}a{min-width:44px;justify-content:center;padding:8px}a span{display:none}a[aria-current=page] span{display:inline}}`;
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Dashboardnavigatie");
    const active = this.config.active === "room" ? "rooms" : this.config.active === "specialist-kia" ? "domains" : this.config.active;
    for (const [path, label, iconName] of links) {
      const link = document.createElement("a");
      link.href = path;
      if (new URLSearchParams(location.search).has("disable_km")) link.href = `${path}?disable_km`;
      link.setAttribute("aria-label", label);
      if (active === path) link.setAttribute("aria-current", "page");
      const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
      icon.icon = iconName;
      const text = document.createElement("span");
      text.textContent = label;
      link.append(icon, text);
      nav.append(link);
    }
    const controls = document.createElement("style");
    controls.textContent = `button{display:flex;flex:0 0 44px;align-items:center;justify-content:center;width:44px;height:44px;padding:8px;border:1px solid rgb(255 255 255/.4);border-radius:12px;background:rgb(255 255 255/.1);color:#fff;cursor:pointer}button:hover{background:rgb(255 255 255/.2)}a:focus-visible,button:focus-visible{outline:2px solid white;outline-offset:-4px}nav{height:66px;flex-wrap:nowrap}nav a{white-space:nowrap}[role=status]:empty{display:none}[role=status]{padding:8px;color:var(--primary-text-color)}.manage{display:block;color:var(--primary-text-color);padding:8px}`;
    controls.textContent += `@media(max-width:560px){nav{gap:4px}nav a{flex:0 0 44px;width:44px;flex-direction:column;gap:2px;padding:4px}nav a span,nav a[aria-current=page] span{display:block;font-size:9px;line-height:12px}}`;
    const addButton = (label: string, iconName: string, action: () => void): void => {
      const button = document.createElement("button");
      button.type = "button";
      button.title = label;
      button.setAttribute("aria-label", label);
      const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
      icon.icon = iconName;
      button.append(icon);
      button.addEventListener("click", action);
      nav.append(button);
    };
    if (this.currentHass?.user?.is_admin) addButton("Dashboard instellen", "mdi:cog-outline", () => this.openConfiguration());
    if (this.config.navigation_mode === "kiosk") addButton(this.showHeader ? "Kiosk hervatten" : "Home Assistant-balk tonen", this.showHeader ? "mdi:fullscreen" : "mdi:fullscreen-exit", () => {
      this.showHeader = !this.showHeader;
      this.syncKiosk();
      this.render();
      this.shadowRoot?.querySelector<HTMLButtonElement>("nav button:last-child")?.focus();
    });
    const status = document.createElement("div");
    status.setAttribute("role", "status");
    this.shadowRoot.replaceChildren(style, controls, nav, status);
    if (this.showHeader && this.currentHass?.user?.is_admin) {
      const manage = document.createElement("a");
      manage.className = "manage";
      manage.href = "/config/lovelace/dashboards";
      manage.textContent = "Dashboardbeheer openen";
      this.shadowRoot.append(manage);
    }
  }
}

export function registerHomeDashboardNavigation(): void {
  if (typeof customElements === "undefined" || typeof window === "undefined") return;
  const tag = "home-dashboard-navigation";
  if (!customElements.get(tag)) customElements.define(tag, HomeDashboardNavigation);
  window.customCards ??= [];
  if (!window.customCards.some((card) => card.type === tag)) window.customCards.push({ type: tag, name: "Home Dashboard Navigation", description: "Interne dashboardnavigatie voor geïntegreerde en kioskweergave.", preview: true });
}
