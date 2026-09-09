import type { DashboardPalette, ViewPath } from "../config/types";
import { applyDashboardPalette } from "../theme/palettes";

interface NavigationConfig {
  type: "custom:home-dashboard-navigation";
  active?: ViewPath | "room" | "specialist-kia";
  palette?: DashboardPalette;
  theme_mode?: "system" | "light" | "dark";
}

interface CustomCardMetadata { type: string; name: string; description: string; preview?: boolean }

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

  public constructor() {
    super();
    if (this.attachShadow) this.attachShadow({ mode: "open" });
  }

  public setConfig(config: NavigationConfig): void {
    this.config = config;
    applyDashboardPalette(this, config.palette, config.theme_mode);
    this.render();
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
      if (active === path) link.setAttribute("aria-current", "page");
      const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
      icon.icon = iconName;
      const text = document.createElement("span");
      text.textContent = label;
      link.append(icon, text);
      nav.append(link);
    }
    this.shadowRoot.replaceChildren(style, nav);
  }
}

export function registerHomeDashboardNavigation(): void {
  if (typeof customElements === "undefined" || typeof window === "undefined") return;
  const tag = "home-dashboard-navigation";
  if (!customElements.get(tag)) customElements.define(tag, HomeDashboardNavigation);
  window.customCards ??= [];
  if (!window.customCards.some((card) => card.type === tag)) window.customCards.push({ type: tag, name: "Home Dashboard Navigation", description: "Interne dashboardnavigatie voor geïntegreerde en kioskweergave.", preview: true });
}
