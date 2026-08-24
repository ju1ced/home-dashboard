import type { CameraConfig } from "../config/types";

type LovelaceCardElement = HTMLElement & { hass: HomeAssistantLike | undefined; setConfig?: (config: Record<string, unknown>) => void };
type CardHelpers = { createCardElement: (config: Record<string, unknown>) => LovelaceCardElement };
type HomeAssistantLike = { states?: Record<string, { state?: string }> };

interface CameraStripConfig {
  type: "custom:home-dashboard-camera-strip";
  cameras: CameraConfig[];
}

interface CustomCardMetadata {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
}

declare global {
  interface Window {
    loadCardHelpers?: () => Promise<CardHelpers>;
    customCards?: CustomCardMetadata[];
  }
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

function noAction(): Record<string, unknown> {
  return { action: "none" };
}

function cameraStateClass(hass: HomeAssistantLike | undefined, camera: CameraConfig): string {
  const cameraState = hass?.states?.[camera.camera_entity]?.state ?? "missing";
  const privacyState = camera.privacy_entity ? hass?.states?.[camera.privacy_entity]?.state ?? "missing" : "none";
  return `${camera.key}:${cameraState}:${privacyState}`;
}

function isUnavailable(state: string | undefined): boolean {
  return !state || state === "unavailable" || state === "unknown";
}

function isPrivacyActive(state: string | undefined): boolean {
  return state === "on" || state === "active" || state === "true";
}

export function getCameraPresentation(
  cameraState: string | undefined,
  privacyState: string | undefined,
  fallback: CameraConfig["fallback"]
): "camera" | "privacy" | "hidden" {
  if (isPrivacyActive(privacyState)) return "privacy";
  if (fallback === "hidden" && isUnavailable(cameraState)) return "hidden";
  return "camera";
}

export class HomeDashboardCameraStrip extends HTMLElementBase {
  private _config?: CameraStripConfig;
  private _hass?: HomeAssistantLike;
  private childCards: LovelaceCardElement[] = [];
  private renderToken = 0;
  private stateSignature = "";

  public constructor() {
    super();
    this.attachShadow?.({ mode: "open" });
  }

  public setConfig(config: CameraStripConfig): void {
    if (!Array.isArray(config.cameras)) throw new Error("Camera's ontbreken.");
    this._config = { ...config, cameras: config.cameras.filter((camera) => camera.camera_entity) };
    this.stateSignature = "";
    void this.renderStrip();
  }

  public set hass(value: HomeAssistantLike) {
    this._hass = value;
    const nextSignature = (this._config?.cameras ?? []).map((camera) => cameraStateClass(value, camera)).join("|");
    if (nextSignature !== this.stateSignature) {
      this.stateSignature = nextSignature;
      void this.renderStrip();
      return;
    }
    this.childCards.forEach((card) => { card.hass = value; });
  }

  public connectedCallback(): void {
    void this.renderStrip();
  }

  public getCardSize(): number {
    return 4;
  }

  public getGridOptions(): Record<string, unknown> {
    return { columns: "full", rows: "auto", min_columns: 6 };
  }

  private scrollStrip(direction: -1 | 1): void {
    const strip = this.shadowRoot?.querySelector<HTMLElement>(".strip");
    strip?.scrollBy({ left: direction * Math.max(280, strip.clientWidth * 0.8), behavior: "smooth" });
  }

  private async renderStrip(): Promise<void> {
    if (!this.shadowRoot || !this._config) return;
    const token = ++this.renderToken;
    const helpers = typeof window !== "undefined" && window.loadCardHelpers
      ? await window.loadCardHelpers().catch(() => undefined)
      : undefined;
    if (token !== this.renderToken) return;

    this.childCards = [];
    const style = document.createElement("style");
    style.textContent = `
      :host{display:block;min-width:0}ha-card{display:block;padding:10px;background:var(--ha-card-background,var(--card-background-color));overflow:hidden}
      .toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 2px 8px}.label{color:var(--secondary-text-color);font-size:.9rem}
      .controls{display:flex;gap:6px}.controls button{display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:999px;background:var(--secondary-background-color);color:var(--primary-text-color);cursor:pointer}
      .strip{display:flex;gap:12px;overflow-x:auto;overscroll-behavior-inline:contain;scroll-snap-type:inline mandatory;scrollbar-width:thin;padding:2px 2px 8px;outline:none}
      .strip:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px;border-radius:10px}.item{flex:0 0 min(340px,86vw);min-width:0;display:grid;align-content:start;gap:8px;scroll-snap-align:start}
      .privacy{min-height:210px;display:grid;place-items:center;align-content:center;gap:10px;border-radius:12px;background:var(--secondary-background-color);color:var(--primary-text-color);text-align:center}.privacy ha-icon{width:44px;height:44px;color:var(--primary-color)}
      .privacy strong{font-size:1.05rem}.privacy span{color:var(--secondary-text-color)}.empty{padding:18px;color:var(--secondary-text-color)}
      @media(max-width:600px){ha-card{padding-inline:8px}.item{flex-basis:min(320px,88vw)}}
    `;
    const card = document.createElement("ha-card");
    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = `${this._config.cameras.length} camera${this._config.cameras.length === 1 ? "" : "'s"}`;
    const controls = document.createElement("div");
    controls.className = "controls";
    for (const [direction, icon, text] of [[-1, "mdi:chevron-left", "Vorige camera"], [1, "mdi:chevron-right", "Volgende camera"]] as const) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", text);
      const haIcon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
      haIcon.icon = icon;
      button.append(haIcon);
      button.addEventListener("click", () => this.scrollStrip(direction));
      controls.append(button);
    }
    toolbar.append(label, controls);

    const strip = document.createElement("div");
    strip.className = "strip";
    strip.tabIndex = 0;
    strip.setAttribute("role", "list");
    strip.setAttribute("aria-label", "Camerabeelden en privacystatus");
    strip.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        this.scrollStrip(event.key === "ArrowLeft" ? -1 : 1);
      } else if (event.key === "Home") strip.scrollTo({ left: 0, behavior: "smooth" });
      else if (event.key === "End") strip.scrollTo({ left: strip.scrollWidth, behavior: "smooth" });
    });

    for (const camera of this._config.cameras) {
      const cameraState = this._hass?.states?.[camera.camera_entity]?.state;
      const privacyState = camera.privacy_entity ? this._hass?.states?.[camera.privacy_entity]?.state : undefined;
      const presentation = getCameraPresentation(cameraState, privacyState, camera.fallback);
      if (presentation === "hidden") continue;

      const item = document.createElement("article");
      item.className = "item";
      item.setAttribute("role", "listitem");
      if (presentation === "privacy") {
        const placeholder = document.createElement("div");
        placeholder.className = "privacy";
        const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
        icon.icon = "mdi:eye-off-outline";
        const title = document.createElement("strong");
        title.textContent = camera.name;
        const status = document.createElement("span");
        status.textContent = "Privacy actief";
        placeholder.append(icon, title, status);
        item.append(placeholder);
      } else if (helpers) {
        const picture = helpers.createCardElement({
          type: "picture-entity", entity: camera.camera_entity, name: camera.name, camera_view: "auto",
          show_name: true, show_state: false, tap_action: noAction(), hold_action: noAction(), double_tap_action: noAction()
        });
        picture.hass = this._hass;
        this.childCards.push(picture);
        item.append(picture);
      }
      if (camera.privacy_entity && helpers) {
        const privacy = helpers.createCardElement({
          type: "tile", entity: camera.privacy_entity, name: `${camera.name} · privacy`,
          tap_action: noAction(), hold_action: noAction(), double_tap_action: noAction(),
          icon_tap_action: noAction(), icon_hold_action: noAction(), icon_double_tap_action: noAction()
        });
        privacy.hass = this._hass;
        this.childCards.push(privacy);
        item.append(privacy);
      }
      strip.append(item);
    }

    if (!strip.childElementCount) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "Geen camerabeeld beschikbaar.";
      strip.append(empty);
    }
    card.append(toolbar, strip);
    this.shadowRoot.replaceChildren(style, card);
  }
}

export function registerHomeDashboardCameraStrip(): void {
  if (typeof customElements === "undefined" || typeof window === "undefined") return;
  const tag = "home-dashboard-camera-strip";
  if (!customElements.get(tag)) customElements.define(tag, HomeDashboardCameraStrip);
  window.customCards ??= [];
  if (!window.customCards.some((card) => card.type === "home-dashboard-camera-strip")) {
    window.customCards.push({
      type: "home-dashboard-camera-strip",
      name: "Home Dashboard Camera Strip",
      description: "Horizontaal bereikbare read-only camera- en privacystrook.",
      preview: true
    });
  }
}
