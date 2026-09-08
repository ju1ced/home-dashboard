import type { RoomConfig } from "../config/types";

type State = { state?: string; attributes?: Record<string, unknown> };
type Hass = { states?: Record<string, State>; callService?: (domain: string, service: string, data: Record<string, unknown>) => Promise<unknown> };
type Kind = "light" | "cover" | "awning" | "media" | "climate";
type Command = "toggle" | "open" | "stop" | "close";
type Plan = { entity: string; domain: string; service: string; confirmation: boolean };
type OrderedControl = { key: string; entity: string; kind: Kind; button: HTMLButtonElement; strip?: HTMLElement; notice: HTMLElement };
const kinds: Kind[] = ["light", "media", "cover", "awning", "climate"];
const labels: Record<Kind, string> = { light: "Lichten", cover: "Rolluiken", awning: "Luifel", media: "Radio", climate: "Airco / verwarming" };
const icons: Record<Kind, string> = { light: "mdi:lightbulb-outline", cover: "mdi:window-shutter", awning: "mdi:awning-outline", media: "mdi:radio", climate: "mdi:thermostat" };

export function favoriteRooms(rooms: readonly RoomConfig[]): RoomConfig[] {
  return rooms.filter(room => room.home_favorite === true).slice(0, 4);
}

function target(room: RoomConfig, kind: Kind): string { return kind === "climate" ? room.hvac.entity : room[`control_${kind}_entity`] ?? ""; }
export function roomControlSources(room: RoomConfig, kind: Kind): string[] {
  const explicit = target(room, kind);
  if (explicit) return [explicit];
  return [...new Set(kind === "light" ? room.light_entities : kind === "media" ? room.media_entities : kind === "cover" ? room.cover_entities.filter(entity => entity !== room.control_awning_entity) : [])];
}
function known(state?: State): boolean { return Boolean(state?.state && !["unknown", "unavailable"].includes(state.state)); }
function shortName(room: RoomConfig, state: State | undefined, kind: Kind): string {
  let name = String(state?.attributes?.friendly_name ?? labels[kind]).trim();
  const words = name.split(/\s+/); const half = words.length / 2;
  if (Number.isInteger(half) && words.slice(0, half).join(" ").toLowerCase() === words.slice(half).join(" ").toLowerCase()) name = words.slice(0, half).join(" ");
  const roomName = room.name.trim().toLowerCase(); const lower = name.toLowerCase();
  if (roomName && lower.startsWith(`${roomName} `)) name = name.slice(room.name.trim().length).trim();
  else if (roomName && lower.endsWith(` ${roomName}`)) name = name.slice(0, -(room.name.trim().length + 1)).trim();
  if (name) name = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  return name || labels[kind];
}
function kindForEntity(room: RoomConfig, hass: Hass | undefined, entity: string): Kind | undefined {
  const domain = entity.split(".")[0];
  if (domain === "light") return "light";
  if (domain === "media_player") return "media";
  if (domain === "climate") return "climate";
  if (domain === "cover") return entity === room.control_awning_entity || hass?.states?.[entity]?.attributes?.device_class === "awning" ? "awning" : "cover";
  return undefined;
}
function roomQuickControlEntities(room: RoomConfig): string[] | undefined {
  return room.control_entities === undefined ? undefined : [...new Set(room.control_entities.filter(Boolean))];
}
function isActive(kind: Kind, state?: State): boolean {
  return kind === "light" ? state?.state === "on" : kind === "media" ? state?.state === "playing" : kind === "climate" ? !["off", "idle", "unknown", "unavailable", undefined].includes(state?.state) || ["heating", "cooling"].includes(String(state?.attributes?.hvac_action)) : ["open", "opening", "closing"].includes(state?.state ?? "");
}

/** An explicit single target and a fixed service allowlist; no area/device expansion. */
export function planRoomControl(room: RoomConfig, hass: Hass | undefined, kind: Kind, command: Command = "toggle"): Plan | undefined {
  return planEntityControl(room, hass, target(room, kind), kind, command);
}

function planEntityControl(room: RoomConfig, hass: Hass | undefined, entity: string, kind: Kind, command: Command = "toggle"): Plan | undefined {
  if (!room.controls_enabled || !kinds.includes(kind)) return undefined;
  const state = hass?.states?.[entity];
  if (!entity || !known(state)) return undefined;
  const domain = kind === "media" ? "media_player" : kind === "awning" ? "cover" : kind;
  if (entity.split(".")[0] !== domain) return undefined;
  const features = Number(state?.attributes?.supported_features ?? 0);
  let service = "";
  if (kind === "light" && command === "toggle" && ["on", "off"].includes(state!.state!)) service = state!.state === "on" ? "turn_off" : "turn_on";
  if (kind === "media" && command === "toggle") {
    if (state!.state === "playing" && (features & 1)) service = "media_pause";
    // Resume only an existing paused programme; do not choose a station implicitly.
    if (state!.state === "paused" && (features & 16384)) service = "media_play";
  }
  if (kind === "cover" || kind === "awning") {
    const deviceClass = state?.attributes?.device_class;
    if (["garage", "gate", "door"].includes(String(deviceClass))) return undefined;
    if (command === "open" && (features & 1)) service = "open_cover";
    if (command === "close" && (features & 2)) service = "close_cover";
    if (command === "stop" && (features & 8)) service = "stop_cover";
  }
  return service ? { entity, domain, service, confirmation: kind === "awning" && command !== "stop" } : undefined;
}

export async function executeRoomControl(room: RoomConfig, hass: Hass, kind: Kind, command: Command, confirmed = false): Promise<void> {
  const plan = planRoomControl(room, hass, kind, command);
  if (!plan || !hass.callService || (plan.confirmation && !confirmed)) throw new Error("Bediening niet toegestaan.");
  // HA enforces the current user's entity permissions and integration conditions.
  await hass.callService(plan.domain, plan.service, { entity_id: plan.entity });
}

function icon(name: string): HTMLElement {
  const element = document.createElement("ha-icon") as HTMLElement & { icon: string };
  element.icon = name; element.setAttribute("aria-hidden", "true"); return element;
}
function stateLabel(state?: State): string {
  if (!state) return "Niet gevonden";
  const text: Record<string, string> = { on: "Aan", off: "Uit", open: "Open", closed: "Gesloten", opening: "Opent", closing: "Sluit", playing: "Speelt", paused: "Gepauzeerd", idle: "Kies een bron", heat: "Verwarmen", cool: "Koelen", heat_cool: "Auto", auto: "Auto", dry: "Ontvochtigen", fan_only: "Ventileren", unavailable: "Niet beschikbaar", unknown: "Onbekend" };
  return text[state.state ?? "unknown"] ?? state.state ?? "Onbekend";
}
const Base = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

export class HomeDashboardRoomControls extends Base {
  private config?: { room: RoomConfig; show_controls?: boolean; expanded?: boolean };
  private currentHass?: Hass;
  private buttons = new Map<Kind, HTMLButtonElement>();
  private strips = new Map<Kind, HTMLElement>();
  private pending = new Set<string>();
  private orderedControls: OrderedControl[] = [];
  private meta?: HTMLElement;
  private signature = "";
  private generation = 0;
  private expanded = false;

  constructor() { super(); this.attachShadow?.({ mode: "open" }); }
  public get isExpanded(): boolean { return this.expanded; }
  public get roomKey(): string | undefined { return this.config?.room.key; }
  public setConfig(config: { room: RoomConfig; show_controls?: boolean; expanded?: boolean }): void {
    if (this.config?.room.key !== config.room.key) this.expanded = false;
    if (config.expanded !== undefined) this.expanded = config.expanded;
    this.config = config; this.generation++; this.pending.clear(); this.signature = ""; this.render();
  }
  public set hass(value: Hass) {
    const firstHass = !this.currentHass;
    this.currentHass = value;
    const room = this.config?.room;
    if (firstHass && room?.control_entities !== undefined) { this.render(); return; }
    const entities = room ? [...(room.control_entities ?? []), ...kinds.flatMap(kind => roomControlSources(room, kind)), ...room.hvac.comfort_entities, ...room.safety_entities] : [];
    const signature = JSON.stringify(entities.map(entity => value.states?.[entity]));
    if (signature !== this.signature) { this.signature = signature; this.update(); }
  }
  public connectedCallback(): void { if (!this.shadowRoot?.childElementCount) this.render(); }
  private moreInfo(entity: string): void {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
  }
  private async perform(kind: Kind, entity: string, key: string, notice: HTMLElement, command: Command): Promise<void> {
    const room = this.config?.room;
    if (!room || !this.currentHass || (this.pending.has(key) && command !== "stop") || this.pending.has(`${key}:stop`)) return;
    const plan = planEntityControl(room, this.currentHass, entity, kind, command);
    if (!plan) return;
    const name = String(this.currentHass.states?.[plan.entity]?.attributes?.friendly_name ?? labels[kind]);
    if (plan.confirmation && !window.confirm(`${room.name} · ${name}: luifel ${command === "open" ? "uitschuiven" : "inschuiven"}?`)) return;
    const pendingKey = command === "stop" ? `${key}:stop` : key;
    this.pending.add(pendingKey); this.update();
    notice.textContent = "Verzoek versturen…";
    const generation = this.generation;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        this.currentHass.callService!(plan.domain, plan.service, { entity_id: plan.entity }),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("timeout")), 10000); })
      ]);
      if (generation === this.generation) notice.textContent = "Verzoek ontvangen. Controleer de actuele status.";
    } catch {
      // Do not expose backend error payloads or identifiers in the UI/logs.
      if (generation === this.generation) notice.textContent = "Niet bevestigd. Controleer status en rechten via Details voordat je opnieuw probeert.";
    } finally {
      if (timer) clearTimeout(timer);
      if (generation === this.generation) { this.pending.delete(pendingKey); this.update(); }
    }
  }
  private toggleStrip(strip: HTMLElement, button: HTMLButtonElement): void {
    const willOpen = strip.hidden;
    this.shadowRoot?.querySelectorAll<HTMLElement>(".strip").forEach(candidate => { candidate.hidden = true; });
    this.shadowRoot?.querySelectorAll<HTMLButtonElement>(".control[aria-expanded]").forEach(candidate => candidate.setAttribute("aria-expanded", "false"));
    strip.hidden = !willOpen;
    button.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) this.update();
  }
  private update(): void {
    const room = this.config?.room;
    if (!room) return;
    if (this.meta) {
      const safety = room.safety_entities.some(entity => ["on", "open", "problem", "unsafe", "unlocked"].includes(this.currentHass?.states?.[entity]?.state ?? ""));
      const context = room.hvac.comfort_entities.map(entity => this.currentHass?.states?.[entity]).filter(known).slice(0, 2)
        .map(state => `${state!.state} ${state!.attributes?.unit_of_measurement ?? ""}`.trim());
      this.meta.textContent = safety ? "Aandacht nodig · Open kamerdetails" : context.join(" · ") || "Kamerstatus en bediening";
      this.meta.classList.toggle("warning", safety);
    }
    this.buttons.forEach((button, kind) => {
      const sources = roomControlSources(room, kind);
      const entity = target(room, kind) || sources[0] || ""; const state = this.currentHass?.states?.[entity];
      const states = sources.map(source => this.currentHass?.states?.[source]);
      const activeCount = states.filter(source => isActive(kind, source)).length;
      const missingCount = states.filter(source => !known(source)).length;
      const summary = sources.length > 1 ? [`${sources.length} apparaten`, activeCount ? `${activeCount} ${kind === "light" ? "aan" : kind === "media" ? "speelt" : "in beweging"}` : "", missingCount ? `${missingCount} onbekend` : ""].filter(Boolean).join(" · ") : "";
      const label = button.querySelector("small");
      if (label) label.textContent = summary || (kind === "climate" && known(state) ? [stateLabel(state), typeof state?.attributes?.temperature === "number" ? `Doel ${state.attributes.temperature}°` : ""].filter(Boolean).join(" · ") : kind === "awning" && state?.state === "closed" ? "In" : kind === "awning" && state?.state === "open" ? "Uit" : stateLabel(state));
      const stripLabel = this.strips.get(kind)?.querySelector(".strip-label");
      if (stripLabel) stripLabel.textContent = `${room.name} · ${state?.attributes?.friendly_name ?? labels[kind]}`;
      button.classList.toggle("active", activeCount > 0);
      button.disabled = this.pending.has(kind);
      const detailOnly = kind === "climate" || !target(room, kind) || !room.controls_enabled || !this.currentHass?.callService || !known(state) || (kind === "light" || kind === "media") && !planRoomControl(room, this.currentHass, kind);
      const name = String(state?.attributes?.friendly_name ?? labels[kind]);
      button.title = `${room.name} · ${name}`;
      button.setAttribute("aria-label", `${room.name} · ${labels[kind]} · ${summary || `${name}: ${stateLabel(state)}`}. ${sources.length > 1 ? "Toon apparaten" : detailOnly ? "Open details" : kind === "light" ? state?.state === "on" ? "Uitschakelen" : "Inschakelen" : kind === "media" ? state?.state === "playing" ? "Pauzeren" : "Hervatten" : "Toon bediening"}`);
      this.strips.get(kind)?.querySelectorAll<HTMLButtonElement>("button[data-source]").forEach(control => {
        const source = this.currentHass?.states?.[control.dataset.source ?? ""];
        control.textContent = `${source?.attributes?.friendly_name ?? labels[kind]} · ${stateLabel(source)}`;
      });
      this.strips.get(kind)?.querySelectorAll<HTMLButtonElement>("button[data-command]").forEach(control => {
        control.disabled = (control.dataset.command === "stop" ? this.pending.has(`${kind}:stop`) : this.pending.has(kind)) || !this.currentHass?.callService || !planRoomControl(room, this.currentHass, kind, control.dataset.command as Command);
      });
    });
    this.orderedControls.forEach(control => {
      const state = this.currentHass?.states?.[control.entity];
      const name = shortName(room, state, control.kind);
      control.button.querySelector("strong")!.textContent = name;
      control.button.querySelector("small")!.textContent = control.kind === "awning" && state?.state === "closed" ? "In" : control.kind === "awning" && state?.state === "open" ? "Uit" : control.kind === "climate" && known(state) ? [stateLabel(state), typeof state?.attributes?.temperature === "number" ? `Doel ${state.attributes.temperature}°` : ""].filter(Boolean).join(" · ") : stateLabel(state);
      control.button.classList.toggle("active", isActive(control.kind, state));
      control.button.setAttribute("aria-pressed", String(isActive(control.kind, state)));
      control.button.disabled = this.pending.has(control.key);
      const detailOnly = control.kind === "climate" || !this.config?.room.controls_enabled || !this.currentHass?.callService || !known(state) || (control.kind === "light" || control.kind === "media") && !planEntityControl(room, this.currentHass, control.entity, control.kind);
      control.button.setAttribute("aria-label", `${room.name} · ${name}: ${stateLabel(state)}. ${detailOnly ? "Open details" : control.kind === "light" ? state?.state === "on" ? "Uitschakelen" : "Inschakelen" : control.kind === "media" ? state?.state === "playing" ? "Pauzeren" : "Hervatten" : "Toon bediening"}`);
      control.strip?.querySelectorAll<HTMLButtonElement>("button[data-command]").forEach(button => {
        const command = button.dataset.command as Command;
        button.disabled = (command === "stop" ? this.pending.has(`${control.key}:stop`) : this.pending.has(control.key)) || !this.currentHass?.callService || !planEntityControl(room, this.currentHass, control.entity, control.kind, command);
      });
    });
  }
  private render(): void {
    if (!this.shadowRoot || !this.config) return;
    this.buttons.clear(); this.strips.clear(); this.orderedControls = [];
    const room = this.config.room;
    const style = document.createElement("style");
    style.textContent = `
      :host{display:block;min-width:0;color:var(--hd-text,var(--primary-text-color,#17212b))}*{box-sizing:border-box}
      article{height:100%;padding:14px;border:1px solid var(--hd-border,var(--divider-color,#dce2e8));border-radius:18px;background:var(--hd-surface,var(--ha-card-background,var(--card-background-color,#fff)));box-shadow:var(--hd-shadow,0 2px 5px #00000009)}
      .room-toggle{display:flex;width:100%;border:0;background:transparent;font:inherit;text-align:left;cursor:pointer}.room-toggle{gap:12px;align-items:center;color:inherit;min-height:54px;padding:2px}.room-toggle>ha-icon:first-child{width:38px;height:38px;padding:8px;border-radius:12px;background:color-mix(in srgb,var(--primary-color,#0784c1) 11%,transparent);color:var(--primary-color,#0784c1)}.copy{display:grid;gap:4px;flex:1;min-width:0}strong{font-size:14px}small{font-size:12px;color:var(--hd-muted,var(--secondary-text-color,#596777));overflow-wrap:anywhere}.warning{color:var(--error-color,#c53b32)}
      [hidden]{display:none!important}.panel{margin-top:10px;padding-top:12px;border-top:1px solid var(--hd-border,var(--divider-color,#dce2e8))}.room-toggle[aria-expanded="true"]>.expand-icon{transform:rotate(180deg)}.expand-icon{transition:transform .16s ease}.full-room{display:inline-flex;align-items:center;width:max-content;min-height:44px;margin-top:8px;padding:8px 4px;color:var(--primary-color,#0784c1);font-size:12px;font-weight:650;text-decoration:none}.controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px}.control{--control-accent:var(--primary-color,#0784c1);display:flex;align-items:center;gap:9px;min-height:62px;text-align:left;padding:9px;border:1px solid var(--hd-border,var(--divider-color,#dce2e8));border-radius:14px;background:var(--hd-surface-raised,var(--secondary-background-color,#f5f7f9));color:inherit;cursor:pointer}.control.kind-light{--control-accent:var(--state-light-active-color,#b66b00)}.control.kind-climate{--control-accent:var(--state-climate-heat-color,#c95832)}.control.kind-media{--control-accent:var(--state-media-player-active-color,#7155a8)}.control.kind-cover,.control.kind-awning{--control-accent:var(--state-cover-active-color,#087da8)}.control span{display:grid;gap:3px;min-width:0}.control strong{font-size:12px}.control small{line-height:1.25}.control:hover{border-color:var(--control-accent)}.control>ha-icon{width:31px;height:31px;padding:5px;border-radius:9px;background:color-mix(in srgb,var(--control-accent) 13%,transparent);color:var(--control-accent)}.control.active{background:color-mix(in srgb,var(--control-accent) 22%,var(--hd-surface,var(--card-background-color,#fff)));border:2px solid var(--control-accent);box-shadow:inset 4px 0 var(--control-accent)}.control.active small{font-weight:750;color:var(--hd-text,var(--primary-text-color,#17212b))}.control.active>ha-icon{background:var(--control-accent);color:#fff}ha-icon{width:23px;height:23px;flex-shrink:0}
      button{font:inherit}button:disabled{opacity:.5;cursor:default}button:focus-visible,a:focus-visible{outline:2px solid var(--primary-color,#0088cc);outline-offset:2px}.strip{margin-top:10px;padding:11px;border:1px solid color-mix(in srgb,var(--primary-color,#0088cc) 25%,var(--hd-border,var(--divider-color,#dce2e8)));border-radius:14px;background:color-mix(in srgb,var(--primary-color,#0088cc) 5%,var(--hd-surface,var(--card-background-color,#fff)))}.strip-label{font-size:12px;display:block;margin-bottom:8px}.commands{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px}.commands button{min-height:44px;min-width:0;padding:8px 10px;border:1px solid var(--hd-border,var(--divider-color,#dce2e8));border-radius:10px;background:var(--hd-surface,var(--card-background-color,#fff));color:inherit;cursor:pointer;font-size:12px}.commands button:hover{border-color:var(--primary-color,#0088cc)}.notice{display:block;font-size:12px;line-height:1.4;margin-top:6px}.notice:empty{display:none}@media(max-width:450px){article{padding:12px}.controls{grid-template-columns:repeat(2,minmax(0,1fr))}.commands{grid-template-columns:1fr}}
    `;
    const article = document.createElement("article");
    const link = document.createElement("button"); link.type = "button"; link.className = "room-toggle";
    link.setAttribute("aria-label", `Bediening ${room.name}`);
    link.setAttribute("aria-expanded", String(this.expanded)); link.setAttribute("aria-controls", "room-panel");
    const panel = document.createElement("div"); panel.id = "room-panel"; panel.className = "panel"; panel.hidden = !this.expanded;
    link.addEventListener("click", () => { this.expanded = !this.expanded; panel.hidden = !this.expanded; link.setAttribute("aria-expanded", String(this.expanded)); });
    panel.addEventListener("keydown", event => { if (event.key === "Escape") { event.stopPropagation(); this.expanded = false; panel.hidden = true; link.setAttribute("aria-expanded", "false"); link.focus(); } });
    const copy = document.createElement("span"); copy.className = "copy";
    const title = document.createElement("strong"); title.textContent = room.name;
    this.meta = document.createElement("small"); copy.append(title, this.meta);
    const chevron = icon("mdi:chevron-down"); chevron.className = "expand-icon";
    link.append(icon(room.icon || "mdi:sofa-outline"), copy, chevron); article.append(link);
    const controls = document.createElement("div"); controls.className = "controls";
    const orderedEntities = roomQuickControlEntities(room);
    if (this.config.show_controls !== false && orderedEntities !== undefined) orderedEntities.forEach((entity, index) => {
      const kind = kindForEntity(room, this.currentHass, entity);
      if (!kind) return;
      const key = `${index}:${entity}`;
      const button = document.createElement("button"); button.type = "button"; button.className = `control kind-${kind}`;
      const text = document.createElement("span"); text.append(document.createElement("strong"), document.createElement("small"));
      button.append(icon(String(this.currentHass?.states?.[entity]?.attributes?.icon ?? icons[kind])), text); controls.append(button);
      const strip = document.createElement("div"); strip.className = "strip"; strip.hidden = true; strip.id = `control-${index}`;
      const notice = document.createElement("span"); notice.className = "notice"; notice.setAttribute("role", "status");
      const control: OrderedControl = { key, entity, kind, button, notice };
      if (kind === "cover" || kind === "awning") {
        const controlName = shortName(room, this.currentHass?.states?.[entity], kind);
        control.strip = strip;
        button.setAttribute("aria-expanded", "false"); button.setAttribute("aria-controls", strip.id);
        const label = document.createElement("strong"); label.className = "strip-label";
        label.textContent = `${room.name} · ${controlName}`; strip.append(label);
        const commands = document.createElement("div"); commands.className = "commands";
        for (const [command, commandLabel] of [["open",kind === "awning" ? "Uit" : "Open"],["stop","Stop"],["close",kind === "awning" ? "In" : "Dicht"]] as const) {
          const commandButton = document.createElement("button"); commandButton.type = "button"; commandButton.textContent = commandLabel; commandButton.dataset.command = command;
          commandButton.setAttribute("aria-label", `${room.name} · ${controlName} ${commandLabel}`);
          commandButton.addEventListener("click", () => { void this.perform(kind, entity, key, notice, command); }); commands.append(commandButton);
        }
        const details = document.createElement("button"); details.type = "button"; details.textContent = "Details";
        details.addEventListener("click", () => this.moreInfo(entity)); commands.append(details); strip.append(commands);
      }
      button.addEventListener("click", () => {
        const state = this.currentHass?.states?.[entity];
        if (kind === "climate" || !room.controls_enabled || !this.currentHass?.callService || !known(state)) { this.moreInfo(entity); return; }
        if (kind === "cover" || kind === "awning") { this.toggleStrip(strip, button); return; }
        if (planEntityControl(room, this.currentHass, entity, kind)) void this.perform(kind, entity, key, notice, "toggle");
        else this.moreInfo(entity);
      });
      this.orderedControls.push(control); panel.append(strip, notice);
    });
    else if (this.config.show_controls !== false) kinds.filter(kind => roomControlSources(room, kind).length).forEach(kind => {
      const button = document.createElement("button"); button.type = "button"; button.className = `control kind-${kind}`;
      const text = document.createElement("span"); const title = document.createElement("strong"); title.textContent = labels[kind];
      text.append(title, document.createElement("small")); button.append(icon(icons[kind]), text);
      this.buttons.set(kind, button); controls.append(button);
      const strip = document.createElement("div"); strip.className = "strip"; strip.hidden = true; strip.id = `controls-${kind}`;
      const sources = roomControlSources(room, kind);
      if (sources.length > 1) {
        button.setAttribute("aria-expanded", "false"); button.setAttribute("aria-controls", strip.id);
        const label = document.createElement("strong"); label.className = "strip-label";
        label.textContent = `${room.name} · ${labels[kind]}`; strip.append(label);
        const commands = document.createElement("div"); commands.className = "commands";
        sources.forEach(entity => { const control = document.createElement("button"); control.type = "button"; control.dataset.source = entity;
          control.addEventListener("click", () => this.moreInfo(entity)); commands.append(control); });
        strip.append(commands); this.strips.set(kind, strip);
      } else if ((kind === "cover" || kind === "awning") && target(room, kind)) {
        button.setAttribute("aria-expanded", "false"); button.setAttribute("aria-controls", strip.id);
        const label = document.createElement("strong"); label.className = "strip-label";
        label.textContent = `${room.name} · ${labels[kind]}`; strip.append(label);
        const commands = document.createElement("div"); commands.className = "commands";
        for (const [command, label] of [["open",kind === "awning" ? "Uit" : "Open"],["stop","Stop"],["close",kind === "awning" ? "In" : "Dicht"]] as const) {
          const control = document.createElement("button"); control.type = "button"; control.textContent = label; control.dataset.command = command;
          control.setAttribute("aria-label", `${room.name} · ${labels[kind]} ${label}`);
          control.addEventListener("click", () => { void this.perform(kind, target(room, kind), kind, notice, command); }); commands.append(control);
        }
        const details = document.createElement("button"); details.type = "button"; details.textContent = "Details";
        details.addEventListener("click", () => this.moreInfo(target(room, kind))); commands.append(details); strip.append(commands);
        this.strips.set(kind, strip);
      }
      button.addEventListener("click", () => {
        if (sources.length > 1) { this.toggleStrip(strip, button); return; }
        if (kind === "climate" || !target(room, kind)) { this.moreInfo(sources[0]!); return; }
        const state = this.currentHass?.states?.[target(room, kind)];
        if (!room.controls_enabled || !this.currentHass?.callService || !known(state)) { this.moreInfo(target(room, kind)); return; }
        if (kind === "cover" || kind === "awning") {
          this.toggleStrip(strip, button);
        } else if (planRoomControl(room, this.currentHass, kind)) { void this.perform(kind, target(room, kind), kind, notice, "toggle"); }
        else this.moreInfo(target(room, kind));
      });
      const notice = document.createElement("span"); notice.className = "notice"; notice.setAttribute("role", "status");
      panel.append(strip, notice);
    });
    panel.prepend(controls);
    if (!controls.childElementCount) { const empty = document.createElement("small"); empty.textContent = "Nog geen functies ingesteld voor deze kamer."; panel.append(empty); }
    const fullRoom = document.createElement("a"); fullRoom.className = "full-room"; fullRoom.href = `room-${room.key.replaceAll("_", "-")}`; fullRoom.textContent = "Volledige kamer"; fullRoom.setAttribute("aria-label", `Volledige kamer ${room.name}`); panel.append(fullRoom);
    article.append(panel);
    this.shadowRoot.replaceChildren(style, article); this.update();
  }
}

export function registerRoomControls(): void {
  if (typeof customElements !== "undefined" && !customElements.get("home-dashboard-room-controls")) customElements.define("home-dashboard-room-controls", HomeDashboardRoomControls);
}
