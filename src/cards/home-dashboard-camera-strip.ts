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
    strip?.scrollBy({ left: direction * strip.clientWidth, behavior: "smooth" });
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
      :host{display:block;min-width:0}ha-card{display:block;max-width:720px;margin:0 auto;padding:10px;background:var(--ha-card-background,var(--card-background-color));overflow:hidden}
      .toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 2px 8px}.label{color:var(--secondary-text-color);font-size:.9rem}
      .controls{display:flex;gap:6px}.controls button{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:999px;background:var(--secondary-background-color);color:var(--primary-text-color);cursor:pointer}
      .controls button:disabled{opacity:.35;cursor:default}.content{display:grid;grid-template-columns:minmax(0,520px) 150px;justify-content:center;align-items:start;gap:10px}.content.no-privacy{grid-template-columns:minmax(0,520px)}
      .strip{display:flex;overflow-x:auto;overscroll-behavior-inline:contain;scroll-snap-type:inline mandatory;scrollbar-width:none;outline:none;border-radius:12px}.strip::-webkit-scrollbar{display:none}
      .strip:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.item{flex:0 0 100%;min-width:0;scroll-snap-align:start;scroll-snap-stop:always}.item>*{display:block;width:100%}
      .privacy-rail{display:grid;gap:6px;align-content:start}.privacy-title{font-size:.76rem;font-weight:600;color:var(--secondary-text-color);padding:2px 4px}.privacy-chip{display:grid;grid-template-columns:22px minmax(0,1fr);align-items:center;gap:6px;min-height:34px;padding:5px 8px;border-radius:10px;background:var(--secondary-background-color)}
      .privacy-chip ha-icon{width:19px;height:19px;color:var(--state-icon-color,var(--secondary-text-color))}.privacy-chip.active ha-icon{color:var(--warning-color,#f0a000)}.privacy-copy{display:grid;min-width:0}.privacy-copy strong,.privacy-copy span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.privacy-copy strong{font-size:.74rem}.privacy-copy span{font-size:.68rem;color:var(--secondary-text-color)}
      .empty{min-height:180px;display:grid;place-items:center;padding:18px;border-radius:12px;background:var(--secondary-background-color);color:var(--secondary-text-color);text-align:center}
      @media(max-width:700px){ha-card{max-width:520px;padding-inline:8px}.content{grid-template-columns:minmax(0,1fr)}.privacy-rail{display:flex;overflow-x:auto}.privacy-title{display:none}.privacy-chip{flex:0 0 128px}}
    `;
    const card = document.createElement("ha-card");
    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";
    const label = document.createElement("span");
    label.className = "label";
    const cameraStates = this._config.cameras.map((camera) => {
      const cameraState = this._hass?.states?.[camera.camera_entity]?.state;
      const privacyState = camera.privacy_entity ? this._hass?.states?.[camera.privacy_entity]?.state : undefined;
      return { camera, cameraState, privacyState, presentation: getCameraPresentation(cameraState, privacyState, camera.fallback) };
    });
    const visibleCameras = cameraStates.filter(({ presentation }) => presentation === "camera");
    const privacyCameras = cameraStates.filter(({ camera }) => Boolean(camera.privacy_entity));
    label.textContent = `${visibleCameras.length} van ${this._config.cameras.length} camera${this._config.cameras.length === 1 ? "" : "'s"} zichtbaar`;
    const controls = document.createElement("div");
    controls.className = "controls";
    for (const [direction, icon, text] of [[-1, "mdi:chevron-left", "Vorige camera"], [1, "mdi:chevron-right", "Volgende camera"]] as const) {
      const button = document.createElement("button");
      button.type = "button";
      button.disabled = visibleCameras.length <= 1;
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

    for (const { camera } of visibleCameras) {
      const item = document.createElement("article");
      item.className = "item";
      item.setAttribute("role", "listitem");
      if (helpers) {
        const picture = helpers.createCardElement({
          type: "picture-entity", entity: camera.camera_entity, name: camera.name, camera_view: "auto",
          show_name: true, show_state: false, tap_action: noAction(), hold_action: noAction(), double_tap_action: noAction()
        });
        picture.hass = this._hass;
        this.childCards.push(picture);
        item.append(picture);
      }
      strip.append(item);
    }

    if (!strip.childElementCount) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "Geen camerabeeld beschikbaar.";
      strip.append(empty);
    }
    const content = document.createElement("div");
    content.className = `content${privacyCameras.length === 0 ? " no-privacy" : ""}`;
    content.append(strip);
    if (privacyCameras.length > 0) {
      const privacyRail = document.createElement("aside");
      privacyRail.className = "privacy-rail";
      privacyRail.setAttribute("aria-label", "Privacystatus per camera");
      const privacyTitle = document.createElement("div");
      privacyTitle.className = "privacy-title";
      privacyTitle.textContent = "Privacy";
      privacyRail.append(privacyTitle);
      for (const { camera, privacyState, presentation } of privacyCameras) {
        const chip = document.createElement("div");
        chip.className = `privacy-chip${presentation === "privacy" ? " active" : ""}`;
        chip.setAttribute("role", "status");
        const icon = document.createElement("ha-icon") as HTMLElement & { icon?: string };
        icon.icon = presentation === "privacy" ? "mdi:eye-off-outline" : "mdi:eye-outline";
        const copy = document.createElement("span");
        copy.className = "privacy-copy";
        const name = document.createElement("strong");
        name.textContent = camera.name;
        const state = document.createElement("span");
        state.textContent = presentation === "privacy" ? "Privacy aan" : privacyState === "off" ? "Privacy uit" : "Status onbekend";
        copy.append(name, state);
        chip.append(icon, copy);
        privacyRail.append(chip);
      }
      content.append(privacyRail);
    }
    card.append(toolbar, content);
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
