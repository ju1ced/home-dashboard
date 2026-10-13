import { HomeDashboardRoomControls, planEntityControl } from "./home-dashboard-room-controls";
import type { RoomConfig } from "../config/types";
import { applyDashboardPalette, type DashboardPalette, type ThemeMode } from "../theme/palettes";

type StateLike = { state?: string; attributes?: Record<string, unknown>; last_updated?: string };
type HomeAssistantLike = {
  states?: Record<string, StateLike>;
  callService?: (domain: string, service: string, data: Record<string, unknown>) => Promise<unknown>;
  floors?: Array<{ floor_id?: string; id?: string; name?: string }> | Record<string, { name?: string }>;
  connection?: { sendMessagePromise?: (message: Record<string, unknown>) => Promise<unknown> };
};
type LovelaceCardElement = HTMLElement & { hass?: HomeAssistantLike; setConfig?: (config: Record<string, unknown>) => void };
type CardHelpers = { createCardElement: (config: Record<string, unknown>) => LovelaceCardElement };

interface RoomOverviewConfig {
  type: "custom:home-dashboard-room-overview";
  rooms: RoomConfig[];
  show_controls?: boolean;
  palette?: DashboardPalette;
  theme_mode?: ThemeMode;
}

interface RoomDetailConfig {
  type: "custom:home-dashboard-room-detail";
  room: RoomConfig;
  palette?: DashboardPalette;
  theme_mode?: ThemeMode;
}

interface CustomCardMetadata {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
}

type DeviceRole = "light" | "cover" | "climate" | "media" | "comfort" | "safety" | "camera" | "power";
type DevicePresentation = { entity: string; icon: string; label: string; value: string; tone: "normal" | "active" | "warning" | "unavailable" };
type DetailKind = "light" | "cover" | "media" | "climate" | "plug";
type DetailCommand = "toggle" | "open" | "stop" | "close" | "set_temperature" | "set_brightness";
type RoomCapabilityStage = "lighting" | "covers" | "comfort" | "plugs" | "energy";
type DetailPlan = { entity: string; domain: string; service: string; data: Record<string, unknown> };
export type LightGroupState = "off" | "on" | "partial" | "unknown" | "unavailable";

declare global {
  interface Window {
    customCards?: CustomCardMetadata[];
  }
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;
const roomStyles = `:host{display:block;min-width:0;--room-surface:var(--ha-card-background,var(--card-background-color));--stat-color-0:#087fb9;--stat-color-1:#467783;--stat-color-2:#a96800;--stat-color-3:#6d6084;--stat-color-4:#af5540}.hero{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px;border-radius:22px;background:var(--hd-hero,var(--primary-color,#245c4d));color:var(--hd-hero-text,#fff)}.hero-copy{display:grid;gap:4px}.eyebrow{font-size:.74rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.8}.hero h1,.hero h2{margin:0;font-size:1.7rem}.hero p{margin:0;opacity:.78}@media(max-width:600px){.hero{padding:18px}.hero h1,.hero h2{font-size:1.55rem}}`;

export function roomPath(room: Pick<RoomConfig, "key">): string {
  return `room-${room.key.replaceAll("_", "-")}`;
}

export function resolveLightGroupState(states: Record<string, StateLike>, entities: readonly string[]): LightGroupState {
  if (entities.length === 0) return "unknown";
  const values = entities.map((entity) => states[entity]?.state);
  if (values.some((value) => value === "unavailable")) return "unavailable";
  if (values.some((value) => !value || value === "unknown")) return "unknown";
  if (values.every((value) => value === "on")) return "on";
  if (values.every((value) => value === "off")) return "off";
  return "partial";
}

function roomEntities(room: RoomConfig): string[] {
  return [...new Set([
    ...(room.control_entities ?? []),
    room.control_light_entity ?? "", room.control_cover_entity ?? "", room.control_awning_entity ?? "", room.control_media_entity ?? "",
    ...room.light_entities,
    ...(room.light_switch_entities ?? []),
    ...(room.light_groups ?? []).flatMap((group) => [group.control_entity, ...group.member_entities]),
    ...room.cover_entities,
    ...(room.cover_controls ?? []).map((cover) => cover.entity),
    room.hvac.entity,
    ...room.hvac.comfort_entities,
    ...room.media_entities,
    ...room.safety_entities,
    ...room.camera_entities,
    ...room.power_entities,
    room.image_entity ?? "",
    room.temperature_history_entity ?? "",
    ...(room.smart_plugs ?? []).flatMap((plug) => [plug.switch_entity, plug.power_entity, plug.energy_entity, plug.voltage_entity, plug.energy_day_entity ?? "", plug.energy_month_entity ?? "", plug.energy_year_entity ?? ""]),
    room.room_energy?.power_entity ?? "", room.room_energy?.day_entity ?? "", room.room_energy?.month_entity ?? "", room.room_energy?.year_entity ?? "",
    ...room.history_entities,
    ...room.hvac.history_entities
  ].filter(Boolean))];
}

function stateSignature(hass: HomeAssistantLike | undefined, room: RoomConfig): string {
  return roomEntities(room).map((entity) => {
    const current = hass?.states?.[entity];
    const attributes = current?.attributes;
    return [
      entity,
      current?.state ?? "missing",
      attributes?.current_temperature ?? "",
      attributes?.temperature ?? "",
      attributes?.unit_of_measurement ?? "",
      attributes?.preset_mode ?? "",
      attributes?.fan_mode ?? "",
      attributes?.swing_mode ?? "",
      attributes?.brightness ?? "", attributes?.current_position ?? "",
      attributes?.media_title ?? "", attributes?.source ?? "",
      attributes?.friendly_name ?? "", attributes?.icon ?? "", attributes?.entity_picture ?? "",
      attributes?.supported_features ?? "", attributes?.device_class ?? ""
    ].join(":");
  }).join("|");
}

function numberAttribute(state: StateLike | undefined, key: string): number | undefined {
  const value = state?.attributes?.[key];
  return typeof value === "number" ? value : undefined;
}

function stateText(state: StateLike | undefined): string {
  if (!state) return "Niet gevonden";
  const value = state?.state;
  if (!value || value === "unknown") return "Onbekend";
  if (value === "unavailable") return "Niet beschikbaar";
  const translations: Record<string, string> = {
    on: "Aan", off: "Uit", open: "Open", closed: "Gesloten", opening: "Opent", closing: "Sluit",
    heat: "Verwarmen", cool: "Koelen", auto: "Automatisch", idle: "Stand-by", playing: "Speelt", paused: "Gepauzeerd", home: "Thuis"
  };
  const unit = typeof state.attributes?.unit_of_measurement === "string" ? state.attributes.unit_of_measurement : "";
  return `${translations[value] ?? value}${unit ? ` ${unit}` : ""}`;
}

function friendlyName(state: StateLike | undefined, fallback: string): string {
  return typeof state?.attributes?.friendly_name === "string" ? state.attributes.friendly_name : fallback;
}

function formatDateTime(date: Date): string {
  return `${date.toLocaleDateString("nl-BE")} ${date.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })}`;
}


function energyKwh(state: StateLike | undefined): number | undefined {
  const value = Number(state?.state);
  const unit = state?.attributes?.unit_of_measurement;
  if (!Number.isFinite(value) || typeof unit !== "string") return undefined;
  if (unit === "Wh") return value / 1000;
  if (unit === "kWh") return value;
  if (unit === "MWh") return value * 1000;
  return undefined;
}


function actionable(state: StateLike | undefined): boolean {
  return Boolean(state?.state && !["unknown", "unavailable"].includes(state.state));
}

/** HD-205: true only for a genuine temperature or humidity sensor, never a bare "%" (which would also
 * match battery/humidifier-target sensors with no device_class). */
function isTemperatureOrHumiditySensor(state: StateLike | undefined): boolean {
  const deviceClass = state?.attributes?.device_class;
  if (deviceClass === "temperature" || deviceClass === "humidity") return true;
  const unit = state?.attributes?.unit_of_measurement;
  return unit === "°C" || unit === "°F";
}

/** HD-205/D-058 point 4: the Historie line graph is temperature/humidity only. `room.history_entities`
 * is a generic "Overige historie" bucket in the editor (not climate-scoped), so it is filtered at
 * runtime by device_class/unit; `hvac.history_entities` is editor-labelled "Klimaathistorie" but not
 * schema-enforced, so it gets the same defensive filter. `temperature_history_entity` is always
 * included unfiltered: it is named for exactly this purpose, and an unavailable state loses its
 * device_class/unit attributes entirely -- filtering it out would make a dead sensor silently
 * disappear instead of showing "niet beschikbaar". */
export function temperatureHumidityEntities(hass: HomeAssistantLike | undefined, room: RoomConfig): string[] {
  const generic = [...room.history_entities, ...room.hvac.history_entities].filter((entity) => isTemperatureOrHumiditySensor(hass?.states?.[entity]));
  return [...new Set([room.temperature_history_entity, ...generic].filter((value): value is string => Boolean(value)))];
}

export type LogbookEntryLike = { when: number; entity_id?: string; name?: string; domain?: string };

/** HD-205/D-058 points 1+2: never a house-wide call -- only entities already explicitly mapped in
 * `allowedEntities` (the room's own `roomEntities()`) are eligible, domains that are never a legitimate
 * room device (automation/script/scene) are dropped defensively even though they should already be
 * excluded by the allowlist, and the result is newest-first and hard-capped at 50. Free-text `message`
 * is deliberately never surfaced by the caller -- only the resolved name/state -- so no automation-internal
 * detail can leak into the room's event list. */
export function filterRoomLogbookEvents(entries: readonly LogbookEntryLike[], allowedEntities: readonly string[], limit = 50): LogbookEntryLike[] {
  const allowed = new Set(allowedEntities);
  return entries
    .filter((entry) => entry.entity_id && allowed.has(entry.entity_id) && !["automation", "script", "scene"].includes(entry.domain ?? ""))
    .slice()
    .sort((a, b) => b.when - a.when)
    .slice(0, limit);
}

export type StatisticsPeriod = "day" | "month" | "year";
// HD-220: month/year each fetch one extra leading bucket beyond what's actually displayed (13 months/6
// years instead of 12/5), purely as a delta baseline for deltaSeries() -- the oldest combined column is
// dropped before rendering when more than one is available (see energyStatisticsChart()). "day" is not
// span-based at all -- see statisticsWindowStart() -- so it has no entry here.
const STATISTICS_PERIOD_SPAN: Record<Exclude<StatisticsPeriod, "day">, number> = { month: 396 * 86_400_000, year: 6 * 365 * 86_400_000 };

/** The statistics window's start time for the active period. HD-221: "day" is calendar-week-aligned to the
 * most recent local Monday (the owner's own request: "Verbruik per dag" drifted day-to-day with a rolling
 * lookback, e.g. showing Tuesday-to-Tuesday instead of a real week) rather than a fixed N-day lookback from
 * "now" -- one extra leading day (the Sunday before) is included as deltaSeries()'s baseline bucket, same
 * role STATISTICS_PERIOD_SPAN's extra bucket plays for month/year. Non-"day" periods are unchanged. */
export function statisticsWindowStart(period: StatisticsPeriod, now: Date): Date {
  if (period !== "day") return new Date(now.getTime() - STATISTICS_PERIOD_SPAN[period]);
  const daysSinceMonday = (now.getDay() + 6) % 7; // getDay(): 0=Sun..6=Sat
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
  monday.setDate(monday.getDate() - 1);
  return monday;
}

export type StatisticBucket = { start: number; value: number | undefined };

/** Extracts one statistic_id's bucketed series from a `recorder/statistics_during_period` response.
 * `undefined` (not an empty array) means the key is entirely absent from the response -- the HA-documented
 * signal that this source has no long-term statistics at all (see D-205 verification notes); an empty
 * array means it does have long-term statistics but none fall in this window. Callers must keep those two
 * cases visually distinct and never substitute a fabricated zero for either.
 *
 * Note: `value` here is `sum` as HA's recorder stores it -- a running CUMULATIVE total since the entity was
 * first tracked, not a per-bucket amount (confirmed live, HD-220: a 7-day chart built directly from this
 * showed a ~565 kWh scale for a room that uses ~1-2 kWh/day). Callers that need "how much in this bucket"
 * must run this through `deltaSeries()`; this function itself stays a faithful, untransformed read of what
 * the response actually contains, matching its existing tested contract. */
export function extractStatisticSeries(response: unknown, statisticId: string): StatisticBucket[] | undefined {
  const rows = (response as Record<string, Array<{ start: number; sum?: number | null; state?: number | null }>> | null | undefined)?.[statisticId];
  if (!rows) return undefined;
  return rows.map((row) => ({ start: row.start, value: row.sum ?? row.state ?? undefined }));
}

/** Converts a cumulative-sum series (as `extractStatisticSeries` returns it) into a per-bucket delta series:
 * `value[i] = value[i] - value[i-1]`. The first bucket has no prior reference and becomes `undefined` --
 * never a fabricated delta -- which is why callers fetch one extra leading bucket (see
 * `STATISTICS_PERIOD_SPAN`) and drop it after this conversion instead of displaying a guaranteed-empty
 * first column. A bucket is `undefined` whenever either it or its predecessor lacks a value, so a gap in
 * the underlying data never produces a fabricated or silently-wrong delta on either side of the gap.
 *
 * HD-221: a series with only ONE bucket in HA's entire recorded history (common for "year" in a project
 * under a year old -- live-confirmed: exactly one yearly bucket existed) is returned UNCHANGED instead of
 * nulled out. There is no earlier reading anywhere to subtract, so that bucket's own sum already IS the
 * complete total since the source started reporting -- treating it as a throwaway baseline would discard
 * the only real data point a caller has. */
export function deltaSeries(series: StatisticBucket[] | undefined): StatisticBucket[] | undefined {
  if (!series) return undefined;
  if (series.length <= 1) return series;
  return series.map((bucket, index) => {
    if (index === 0) return { start: bucket.start, value: undefined };
    const previous = series[index - 1]!.value;
    return { start: bucket.start, value: bucket.value !== undefined && previous !== undefined ? bucket.value - previous : undefined };
  });
}

/** Derives a bucket's label from its own real `start` timestamp -- never a hardcoded day-/month-name list,
 * so a label always matches the data it sits under (HD-219: the design study it replaces fabricated this
 * with a fixed ["Do","Vr",...] array, independent of what period the mock data actually represented). */
export function statisticsBucketLabel(period: StatisticsPeriod, startMs: number): string {
  const date = new Date(startMs);
  if (period === "day") return date.toLocaleDateString("nl-BE", { weekday: "short" });
  if (period === "month") return date.toLocaleDateString("nl-BE", { month: "short" });
  return date.toLocaleDateString("nl-BE", { year: "numeric" });
}

export type CombinedStatisticColumn = { start: number; values: Array<number | undefined> };

/** Aligns several sources' bucketed series by their real bucket `start` (the union of every source's own
 * starts, sorted ascending) -- never by array index, so a source missing one bucket that another source
 * has shows as `undefined` for that bucket instead of silently shifting into the wrong column. `missing[i]`
 * is true only when source `i` has no long-term statistics at all (mirrors `extractStatisticSeries`'s own
 * undefined-vs-empty distinction), never when it merely lacks one bucket. */
export function combineStatisticBuckets(series: ReadonlyArray<StatisticBucket[] | undefined>): { columns: CombinedStatisticColumn[]; missing: boolean[] } {
  const missing = series.map((entry) => entry === undefined);
  const starts = [...new Set(series.flatMap((entry) => (entry ?? []).map((bucket) => bucket.start)))].sort((a, b) => a - b);
  const columns = starts.map((start) => ({
    start,
    values: series.map((entry) => entry?.find((bucket) => bucket.start === start)?.value),
  }));
  return { columns, missing };
}

/** HD-222: "Verbruik per dag" must always show the full calendar week (Monday through Sunday), not just the
 * days that have already happened -- the owner saw only "ma"/"di" on a Tuesday and asked for the whole
 * week. `combineStatisticBuckets()` only ever produces a column for a timestamp some source actually
 * reported, and HA's recorder never has a bucket for a day that hasn't started yet, so without this step
 * the chart would visibly grow day by day instead of showing a stable 7-day shape. Pads to exactly 7
 * columns, one per day starting at `mondayMs`; a day with no real column at all (typically a not-yet-lived
 * future day, but also a genuine gap before any source started reporting) gets an explicit, fully-empty
 * column -- every value `undefined`, rendered via the same "missing" marker as any other absent bucket,
 * never a fabricated zero. An existing real column for that calendar day is kept as-is, untouched. */
export function padToCalendarWeek(columns: CombinedStatisticColumn[], sourceCount: number, mondayMs: number): CombinedStatisticColumn[] {
  const byDay = new Map<string, CombinedStatisticColumn>();
  for (const column of columns) {
    const date = new Date(column.start);
    byDay.set(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`, column);
  }
  return Array.from({ length: 7 }, (_, dayIndex) => {
    const dayDate = new Date(mondayMs);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    const key = `${dayDate.getFullYear()}-${dayDate.getMonth()}-${dayDate.getDate()}`;
    return byDay.get(key) ?? { start: dayDate.getTime(), values: new Array<number | undefined>(sourceCount).fill(undefined) };
  });
}

export type RankedEnergySource = { name: string; value: number; share: number };

/** Ranks entries descending by value; `share` is each entry's fraction (0..1) of the SUM of the ranked
 * entries themselves -- never a fabricated whole-room/whole-home total (same "niet optellen tot een
 * woningtotaal" caveat as the Apparaatvergelijking comparison section). `share` is 0, never NaN, when the
 * total is 0. */
export function rankEnergySources(entries: ReadonlyArray<{ name: string; value: number }>): RankedEnergySource[] {
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  return [...entries]
    .sort((a, b) => b.value - a.value)
    .map((entry) => ({ name: entry.name, value: entry.value, share: total > 0 ? entry.value / total : 0 }));
}

function entityIcon(entity: string, state?: StateLike): string {
  const configuredIcon = state?.attributes?.icon;
  if (typeof configuredIcon === "string" && configuredIcon) return configuredIcon;
  const domain = entity.split(".")[0] ?? "";
  const icons: Record<string, string> = {
    light: "mdi:lightbulb-outline", cover: "mdi:window-shutter", climate: "mdi:thermostat", media_player: "mdi:speaker",
    camera: "mdi:cctv", binary_sensor: "mdi:shield-check-outline", sensor: "mdi:gauge", switch: "mdi:toggle-switch-outline"
  };
  return icons[domain] ?? "mdi:devices";
}

function roleFallback(role: DeviceRole, index = 0): string {
  const labels: Record<DeviceRole, string> = {
    light: "Verlichting", cover: "Cover", climate: "Klimaat", media: "Media", comfort: "Comfortsensor",
    safety: "Veiligheid", camera: "Camera", power: "Energie"
  };
  return index > 0 ? `${labels[role]} ${index + 1}` : labels[role];
}

function percentAttribute(state: StateLike | undefined, key: string): number | undefined {
  const value = numberAttribute(state, key);
  if (value === undefined) return undefined;
  return Math.round(key === "brightness" ? (value / 255) * 100 : value);
}

function deviceValue(state: StateLike | undefined, role: DeviceRole): string {
  if (!state || state.state === "unavailable" || state.state === "unknown") return stateText(state);
  if (role === "light" && state.state === "on") {
    const brightness = percentAttribute(state, "brightness");
    return brightness === undefined ? "Aan" : `Aan · ${brightness}%`;
  }
  if (role === "cover") {
    const position = percentAttribute(state, "current_position");
    return position === undefined ? stateText(state) : `${stateText(state)} · ${position}%`;
  }
  if (role === "climate") {
    const current = numberAttribute(state, "current_temperature");
    const target = numberAttribute(state, "temperature");
    if (current !== undefined && target !== undefined) return `${current} °C · doel ${target} °C`;
    if (current !== undefined) return `${current} °C · ${stateText(state)}`;
  }
  if (role === "media" && state.state === "playing") {
    const title = state.attributes?.media_title;
    const source = state.attributes?.source;
    if (typeof title === "string" && title) return `Speelt · ${title}`;
    if (typeof source === "string" && source) return `Speelt · ${source}`;
  }
  return stateText(state);
}

function deviceTone(state: StateLike | undefined, role: DeviceRole): DevicePresentation["tone"] {
  if (!state || ["unknown", "unavailable"].includes(state.state ?? "")) return "unavailable";
  if (role === "safety" && ["on", "open", "problem", "unsafe", "unlocked"].includes(state.state ?? "")) return "warning";
  if (
    (role === "light" && state.state === "on") ||
    (role === "cover" && ["open", "opening", "closing"].includes(state.state ?? "")) ||
    (role === "media" && state.state === "playing") ||
    (role === "climate" && !["off", "idle"].includes(state.state ?? ""))
  ) return "active";
  return "normal";
}

function devicePresentation(hass: HomeAssistantLike | undefined, entity: string, role: DeviceRole, index = 0): DevicePresentation {
  const state = hass?.states?.[entity];
  return {
    entity,
    icon: entityIcon(entity, state),
    label: friendlyName(state, roleFallback(role, index)),
    value: deviceValue(state, role),
    tone: deviceTone(state, role)
  };
}


export function getRoomMetric(hass: HomeAssistantLike | undefined, room: RoomConfig): string {
  const operationalEntities = [...room.light_entities, ...(room.light_switch_entities ?? []), ...room.cover_entities, room.hvac.entity, ...room.media_entities, ...room.safety_entities].filter(Boolean);
  const states = operationalEntities.map((entity) => hass?.states?.[entity]);
  if (states.some((state) => state?.state === "unavailable")) return "Deels offline";
  const openCovers = room.cover_entities.filter((entity) => ["open", "opening"].includes(hass?.states?.[entity]?.state ?? ""));
  if (openCovers.length > 0) return openCovers.length === 1 ? "1 opening geopend" : `${openCovers.length} openingen geopend`;
  const lightsOn = [...room.light_entities, ...(room.light_switch_entities ?? [])].filter((entity) => hass?.states?.[entity]?.state === "on").length;
  if (lightsOn > 0) return lightsOn === 1 ? "1 lamp aan" : `${lightsOn} lampen aan`;
  const climate = room.hvac.entity ? hass?.states?.[room.hvac.entity] : undefined;
  const currentTemperature = numberAttribute(climate, "current_temperature");
  if (currentTemperature !== undefined) return `${currentTemperature} °C`;
  const comfort = room.hvac.comfort_entities[0];
  if (comfort) return stateText(hass?.states?.[comfort]);
  return "Normaal";
}


function lookupFloorName(hass: HomeAssistantLike | undefined, floorId: string): string | undefined {
  if (!floorId) return undefined;
  const floors = hass?.floors;
  if (Array.isArray(floors)) return floors.find((candidate) => candidate.floor_id === floorId || candidate.id === floorId)?.name;
  return floors?.[floorId]?.name;
}

function resolveFloorName(hass: HomeAssistantLike | undefined, floorId: string, fallbackIndex: number): string {
  if (!floorId) return "Overige ruimtes";
  const name = lookupFloorName(hass, floorId);
  return name ? name : `Verdieping ${fallbackIndex + 1}`;
}

/** Lamps addressable on their own, excluding a light group's synthetic control entity (already represented by its group card). */
function individualLightEntities(room: RoomConfig): string[] {
  const groupTargets = new Set((room.light_groups ?? []).map((groupConfig) => groupConfig.control_entity));
  return [...room.light_entities, ...(room.light_switch_entities ?? [])].filter((entity) => !groupTargets.has(entity));
}

/** Every entity + its device role that feeds a capability stage's status, used to decide the stage-head badge tone (availability AND warning). */
function capabilityEntityRoles(room: RoomConfig, key: RoomCapabilityStage): Array<{ entity: string; role: DeviceRole }> {
  if (key === "lighting") return [...room.light_entities, ...(room.light_switch_entities ?? [])].map((entity) => ({ entity, role: "light" as const }));
  if (key === "covers") return room.cover_entities.map((entity) => ({ entity, role: "cover" as const }));
  if (key === "comfort") {
    const roles: Array<{ entity: string; role: DeviceRole }> = [];
    if (room.hvac.entity) roles.push({ entity: room.hvac.entity, role: "climate" });
    room.hvac.comfort_entities.forEach((entity) => roles.push({ entity, role: "comfort" }));
    room.media_entities.forEach((entity) => roles.push({ entity, role: "media" }));
    room.safety_entities.forEach((entity) => roles.push({ entity, role: "safety" }));
    room.camera_entities.forEach((entity) => roles.push({ entity, role: "camera" }));
    return roles;
  }
  if (key === "plugs") return (room.smart_plugs ?? []).flatMap((plug) => [plug.switch_entity, plug.power_entity, plug.energy_day_entity, plug.energy_month_entity, plug.energy_year_entity].filter((value): value is string => Boolean(value)).map((entity) => ({ entity, role: "power" as const })));
  const energyEntities = [
    ...room.power_entities,
    room.room_energy?.power_entity, room.room_energy?.day_entity, room.room_energy?.month_entity, room.room_energy?.year_entity,
    ...(room.smart_plugs ?? []).flatMap((plug) => [plug.energy_day_entity, plug.energy_month_entity, plug.energy_year_entity])
  ].filter((value): value is string => Boolean(value));
  return energyEntities.map((entity) => ({ entity, role: "power" as const }));
}

/** Every entity that feeds a capability stage's status, used to decide whether a badge can be shown at all. */
function capabilityEntities(room: RoomConfig, key: RoomCapabilityStage): string[] {
  return capabilityEntityRoles(room, key).map(({ entity }) => entity);
}

function icon(name: string): HTMLElement {
  const element = document.createElement("ha-icon") as HTMLElement & { icon?: string };
  element.icon = name || "mdi:sofa-outline";
  return element;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", text = ""): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

function group(title: string, content: HTMLElement): HTMLElement {
  const section = element("section", "group");
  const heading = element("header", "group-heading");
  heading.append(element("strong", "", title));
  section.append(heading, content);
  return section;
}

abstract class RoomCardBase<TConfig> extends HTMLElementBase {
  protected config?: TConfig;
  protected currentHass?: HomeAssistantLike;
  protected signature = "";

  public constructor() {
    super();
    this.attachShadow?.({ mode: "open" });
  }

  public getCardSize(): number {
    return 4;
  }

  public getGridOptions(): Record<string, unknown> {
    return { columns: "full", rows: "auto", min_columns: 6 };
  }
}

export class HomeDashboardRoomOverview extends RoomCardBase<RoomOverviewConfig> {
  public setConfig(config: RoomOverviewConfig): void {
    if (!Array.isArray(config.rooms)) throw new Error("Kamers ontbreken.");
    this.config = { ...config, rooms: config.rooms.filter((room) => room.key && room.name) };
    applyDashboardPalette(this, config.palette, config.theme_mode);
    this.signature = "";
    this.render();
  }

  public set hass(value: HomeAssistantLike) {
    this.currentHass = value;
    this.shadowRoot?.querySelectorAll<HomeDashboardRoomControls>("home-dashboard-room-controls").forEach(card => { card.hass = value; });
  }

  public connectedCallback(): void {
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot || !this.config) return;
    const style = document.createElement("style");
    style.textContent = `
      ${roomStyles}.overview{display:grid;gap:20px}.count{display:grid;text-align:right}.count strong{font-size:2rem}.count span{font-size:.78rem;opacity:.8}
      .floor{display:grid;gap:10px}.floor-heading{display:grid;gap:2px;padding-inline:2px}.floor-heading h3{margin:0;font-size:1.25rem}.floor-heading span{font-size:.82rem;color:var(--secondary-text-color)}.room-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      @media(max-width:700px){.hero{padding:18px}.hero h2{font-size:1.45rem}.hero p{display:none}.room-grid{grid-template-columns:1fr}.room-main{grid-template-columns:40px minmax(0,1fr) auto 20px}.metric{max-width:110px;overflow:hidden;text-overflow:ellipsis}}
    `;
    const root = document.createElement("div");
    root.className = "overview";
    const hero = document.createElement("section");
    hero.className = "hero";
    const heroCopy = document.createElement("div");
    heroCopy.className = "hero-copy";
    const eyebrow = document.createElement("span");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Alle echte ruimtes";
    const title = document.createElement("h2");
    title.textContent = "Kamers";
    const description = document.createElement("p");
    description.textContent = "Gegroepeerd per verdieping, met primaire status en een afzonderlijk detailpad.";
    heroCopy.append(eyebrow, title, description);
    const count = document.createElement("div");
    count.className = "count";
    const countValue = document.createElement("strong");
    countValue.textContent = String(this.config.rooms.length);
    const countLabel = document.createElement("span");
    countLabel.textContent = "ruimtes";
    count.append(countValue, countLabel);
    hero.append(heroCopy, count);
    root.append(hero);

    const floorIds = [...new Set(this.config.rooms.map((room) => room.floor_id || ""))];
    floorIds.forEach((floorId, floorIndex) => {
      const section = document.createElement("section");
      section.className = "floor";
      const heading = document.createElement("div");
      heading.className = "floor-heading";
      const headingTitle = document.createElement("h3");
      headingTitle.textContent = resolveFloorName(this.currentHass, floorId, floorIndex);
      const headingCopy = document.createElement("span");
      headingCopy.textContent = "Dagelijkse status en functies";
      heading.append(headingTitle, headingCopy);
      const grid = document.createElement("div");
      grid.className = "room-grid";
      for (const room of this.config?.rooms.filter((candidate) => (candidate.floor_id || "") === floorId) ?? []) {
        const article = document.createElement("home-dashboard-room-controls") as HomeDashboardRoomControls;
        article.setConfig({ room, show_controls: this.config?.show_controls !== false });
        if (this.currentHass) article.hass = this.currentHass;
        grid.append(article);
      }
      section.append(heading, grid);
      root.append(section);
    });
    this.shadowRoot.replaceChildren(style, root);
  }
}

export class HomeDashboardRoomDetail extends RoomCardBase<RoomDetailConfig> {
  private generation = 0;
  private actionSequence = 0;
  private pendingActions = new Set<string>();
  private actionFeedback = new Map<string, { tone: "pending" | "success" | "error"; message: string; sequence: number }>();
  private activeDetailTab: "devices" | "energy" | "history" = "devices";
  private activeEnergyPeriod: "day" | "month" | "year" = "day";
  private activeHistoryWindow: "24h" | "7d" | "30d" = "24h";
  private selectedCapability: RoomCapabilityStage | undefined;
  /** media_content_id -> resolved servable URL (or undefined once resolved-but-genuinely-empty), cached for the component's lifetime. Only written once a real media_source/resolve_media request has actually settled. */
  private photoCache = new Map<string, string | undefined>();
  /** media_content_id's currently awaiting a media_source/resolve_media response, kept separate from photoCache so a render before `hass`/connection is available (or a rejected request) never gets permanently mistaken for a cached result. */
  private photoInFlight = new Set<string>();
  /** HD-205: request-key -> settled `recorder/statistics_during_period` / `history/history_during_period` /
   * `logbook/get_events` response, cached the same way as `photoCache` (never caches a rejection, so a lost
   * connection retries on the next real `hass` assignment or period/window change instead of being stuck). */
  private statisticsCache = new Map<string, unknown>();
  private statisticsInFlight = new Set<string>();
  private historyCache = new Map<string, unknown>();
  private historyInFlight = new Set<string>();
  private logbookCache = new Map<string, unknown>();
  private logbookInFlight = new Set<string>();

  public setConfig(config: RoomDetailConfig): void {
    if (!config.room?.key) throw new Error("Kamer ontbreekt.");
    this.disconnectedCallback();
    this.config = config;
    this.activeDetailTab = "devices";
    this.activeEnergyPeriod = "day";
    this.activeHistoryWindow = "24h";
    this.selectedCapability = undefined;
    this.pendingActions.clear();
    this.actionFeedback.clear();
    this.statisticsCache.clear(); this.statisticsInFlight.clear();
    this.historyCache.clear(); this.historyInFlight.clear();
    this.logbookCache.clear(); this.logbookInFlight.clear();
    applyDashboardPalette(this, config.palette, config.theme_mode);
    this.signature = "";
    this.render();
  }

  public set hass(value: HomeAssistantLike) {
    this.currentHass = value;
    const next = this.config ? stateSignature(value, this.config.room) : "";
    if (next !== this.signature) {
      this.signature = next;
      this.render(true);
    }
    // Lovelace assigns `hass` only after `setConfig()` (whose synchronous render has no connection yet) and
    // again on every reconnect, so a real resolution attempt must be retried here too -- not only when the
    // room's state signature happens to change -- or a room whose entities never change state would never
    // get its photo resolved once a real connection becomes available.
    if (this.config?.room) {
      this.loadRoomPhoto(this.config.room);
      const expanded = this.expandRoom(this.config.room);
      this.loadStatistics(expanded);
      this.loadHistory(expanded);
      this.loadLogbook(expanded);
    }
    this.shadowRoot?.querySelectorAll<LovelaceCardElement>(".embedded-card > *").forEach(card => { card.hass = value; });
  }

  public connectedCallback(): void { this.render(); }
  public disconnectedCallback(): void { this.generation++; this.pendingActions.clear(); this.shadowRoot?.querySelectorAll("dialog").forEach(dialog => dialog.remove()); }

  private actionKey(entity: string, kind: DetailKind, command: DetailCommand): string {
    return `${kind}:${entity}:${command}`;
  }

  private planAction(entity: string, kind: DetailKind, command: DetailCommand, data: Record<string, unknown> = {}): DetailPlan | undefined {
    const room = this.config?.room;
    const hass = this.currentHass;
    if (!room || !hass?.callService) return undefined;
    if (kind === "climate") {
      const temperature = data.temperature;
      const features = Number(hass.states?.[entity]?.attributes?.supported_features ?? 0);
      return actionable(hass.states?.[entity]) && (features & 1) !== 0 && room.controls_enabled === true && room.hvac.entity === entity && entity.startsWith("climate.") && command === "set_temperature" && typeof temperature === "number" && Number.isFinite(temperature)
        ? { entity, domain: "climate", service: "set_temperature", data }
        : undefined;
    }
    if (kind === "plug") {
      const plug = room.smart_plugs?.find(candidate => candidate.switch_entity === entity);
      const state = hass.states?.[entity]?.state;
      return room.controls_enabled === true && plug && !plug.protected && entity.startsWith("switch.") && command === "toggle" && ["on", "off"].includes(state ?? "")
        ? { entity, domain: "switch", service: state === "on" ? "turn_off" : "turn_on", data }
        : undefined;
    }
    if (kind === "light" && command === "set_brightness") {
      const brightnessPct = data.brightness_pct;
      if (typeof brightnessPct !== "number" || !Number.isFinite(brightnessPct) || brightnessPct < 0 || brightnessPct > 100) return undefined;
      if (!entity.startsWith("light.")) return undefined;
      // Reuse the toggle plan purely to validate mapping, controls_enabled and known state; the service call itself differs.
      return this.planAction(entity, "light", "toggle") ? { entity, domain: "light", service: "turn_on", data: { brightness_pct: brightnessPct } } : undefined;
    }
    if (command === "set_temperature" || command === "set_brightness") return undefined;
    const controlRoom = kind === "light"
      ? { ...room, light_entities: [...new Set([...room.light_entities, ...(room.light_groups ?? []).flatMap((groupConfig) => [groupConfig.control_entity, ...groupConfig.member_entities])])] }
      : kind === "cover"
        ? { ...room, cover_entities: [...new Set([...room.cover_entities, ...(room.cover_controls ?? []).map((coverConfig) => coverConfig.entity)])] }
        : room;
    const plan = planEntityControl(controlRoom, hass, entity, kind, command);
    return plan ? { entity: plan.entity, domain: plan.domain, service: plan.service, data } : undefined;
  }

  private callService(entity: string, kind: DetailKind, command: DetailCommand, data: Record<string, unknown> = {}): void {
    const plan = this.planAction(entity, kind, command, data);
    const hass = this.currentHass;
    const generation = this.generation;
    const sequence = ++this.actionSequence;
    const roomKey = this.config?.room.key;
    const actionKey = this.actionKey(entity, kind, command);
    if (!plan || !hass?.callService || this.pendingActions.has(actionKey)) return;
    this.pendingActions.add(actionKey);
    this.actionFeedback.set(actionKey, { tone: "pending", message: "Bediening wordt uitgevoerd…", sequence });
    this.render(true);
    let request: Promise<unknown>;
    try {
      request = hass.callService(plan.domain, plan.service, { ...plan.data, entity_id: plan.entity });
    } catch {
      request = Promise.reject();
    }
    void request.then(() => {
      this.pendingActions.delete(actionKey);
      if (generation !== this.generation || roomKey !== this.config?.room.key || !this.isConnected) return;
      this.actionFeedback.set(actionKey, { tone: "success", message: "Bediening bevestigd door Home Assistant.", sequence });
      this.render(true);
    }, () => {
      this.pendingActions.delete(actionKey);
      if (generation !== this.generation || roomKey !== this.config?.room.key || !this.isConnected) return;
      this.actionFeedback.set(actionKey, { tone: "error", message: "Bediening mislukt. Controleer de toestand en probeer opnieuw.", sequence });
      this.render(true);
    });
  }

  /**
   * Kicks off resolution of an uploaded photo via the standard `media_source/resolve_media`
   * WebSocket command, then patches `.room-photo` in place once it settles.
   *
   * Lovelace calls `setConfig()` (which renders synchronously) before `hass` is ever assigned, so
   * the very first attempt commonly runs with no connection at all; `hass` is then also reassigned
   * on every reconnect. None of that may be mistaken for "already resolved": `photoInFlight` tracks
   * only requests actually in flight, and `photoCache` is written only from a genuinely settled
   * response. A still-missing connection, or a rejected request, is deliberately NOT cached, so the
   * next render/hass assignment (including after a HA restart) gets a real retry instead of being
   * stuck on the placeholder forever.
   *
   * Assumption (not verifiable without a real Home Assistant instance): the response is
   * `{ url, mime_type }` with `url` already servable as-is (a relative path resolves against the HA
   * frontend's own origin, same as `entity_picture`) -- flag this for verification against a live
   * HA instance.
   */
  private loadRoomPhoto(room: RoomConfig): void {
    const mediaContentId = room.image_upload?.media_content_id;
    if (!mediaContentId || this.photoCache.has(mediaContentId) || this.photoInFlight.has(mediaContentId)) return;
    const connection = this.currentHass?.connection;
    if (typeof connection?.sendMessagePromise !== "function") return;
    this.photoInFlight.add(mediaContentId);
    const generation = this.generation;
    const roomKey = this.config?.room.key;
    let request: Promise<unknown>;
    try {
      request = connection.sendMessagePromise({ type: "media_source/resolve_media", media_content_id: mediaContentId });
    } catch {
      request = Promise.reject();
    }
    void request.then((response) => (response as { url?: unknown } | undefined)?.url, () => undefined).then((url) => {
      this.photoInFlight.delete(mediaContentId);
      if (typeof url === "string" && url) this.photoCache.set(mediaContentId, url);
      if (generation !== this.generation || roomKey !== this.config?.room.key || !this.isConnected) return;
      const photo = this.shadowRoot?.querySelector<HTMLElement>(".room-photo");
      if (photo) this.paintPhoto(photo, this.config!.room);
    });
  }

  /** Priority: resolved image_upload -> image_entity's entity_picture (unchanged) -> HD-206 placeholder. */
  private paintPhoto(photo: HTMLElement, room: RoomConfig): void {
    const mediaContentId = room.image_upload?.media_content_id;
    const picture = (mediaContentId && this.photoCache.get(mediaContentId)) || (room.image_entity ? this.currentHass?.states?.[room.image_entity]?.attributes?.entity_picture : undefined);
    photo.replaceChildren();
    if (typeof picture === "string" && picture) {
      photo.removeAttribute("aria-hidden");
      photo.setAttribute("role", "img");
      photo.setAttribute("aria-label", `Foto ${room.name}`);
      photo.style.backgroundImage = `url("${picture.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"")}")`;
    } else {
      photo.removeAttribute("role");
      photo.removeAttribute("aria-label");
      photo.style.backgroundImage = "";
      photo.setAttribute("aria-hidden", "true");
      photo.append(icon("mdi:floor-plan"), element("span", "room-photo-caption", room.image_entity || mediaContentId ? "Kamerfoto niet beschikbaar" : "Geen kamerfoto geconfigureerd"));
    }
  }

  /** HD-205: generic cached WS request, mirroring `loadRoomPhoto`'s `media_source/resolve_media` pattern --
   * a rejection or a missing connection is never cached, so the next real `hass` assignment (reconnect) or an
   * explicit reload after a period/window change retries instead of getting stuck; a settled response
   * (including a genuinely empty one) is cached for the component's lifetime under `key`. */
  private cacheKey(room: RoomConfig, variant: string, ids: readonly string[]): string {
    return `${room.key}:${variant}:${ids.join(",")}`;
  }

  private loadWsResult(cache: Map<string, unknown>, inFlight: Set<string>, key: string, message: Record<string, unknown>): void {
    if (cache.has(key) || inFlight.has(key)) return;
    const connection = this.currentHass?.connection;
    if (typeof connection?.sendMessagePromise !== "function") return;
    inFlight.add(key);
    const generation = this.generation;
    const roomKey = this.config?.room.key;
    let request: Promise<unknown>;
    try { request = connection.sendMessagePromise(message); } catch { request = Promise.reject(); }
    void request.then((response) => {
      inFlight.delete(key);
      cache.set(key, response);
      if (generation === this.generation && roomKey === this.config?.room.key && this.isConnected) this.render(true);
    }, () => {
      inFlight.delete(key);
      if (generation === this.generation && roomKey === this.config?.room.key && this.isConnected) this.render(true);
    });
  }

  /** Reuses the exact same day/month/year period + per-source entity selection as `energyPeriodGroup()`
   * (D-058 point 3: no new period convention) so the bar chart always matches whichever single-number card
   * is currently shown. */
  private energyStatisticSources(room: RoomConfig): Array<{ name: string; entity: string }> {
    const period = this.activeEnergyPeriod;
    const roomEntity = period === "day" ? room.room_energy?.day_entity : period === "month" ? room.room_energy?.month_entity : room.room_energy?.year_entity;
    const sources: Array<{ name: string; entity: string }> = [];
    if (roomEntity) sources.push({ name: `${room.name} totaal`, entity: roomEntity });
    (room.smart_plugs ?? []).forEach((plug) => {
      const entity = period === "day" ? plug.energy_day_entity : period === "month" ? plug.energy_month_entity : plug.energy_year_entity;
      if (entity) sources.push({ name: plug.name, entity });
    });
    return sources;
  }

  private loadStatistics(room: RoomConfig): void {
    const sources = this.energyStatisticSources(room);
    if (!sources.length) return; // nothing mapped: never issue an empty recorder call
    const period = this.activeEnergyPeriod;
    const key = this.cacheKey(room, period, sources.map((source) => source.entity));
    const start = statisticsWindowStart(period, new Date()).toISOString();
    this.loadWsResult(this.statisticsCache, this.statisticsInFlight, key, { type: "recorder/statistics_during_period", start_time: start, statistic_ids: sources.map((source) => source.entity), period, types: ["sum", "state"] });
  }

  private historyWindowMs(): number {
    return this.activeHistoryWindow === "24h" ? 86_400_000 : this.activeHistoryWindow === "7d" ? 7 * 86_400_000 : 30 * 86_400_000;
  }

  private loadHistory(room: RoomConfig): void {
    const entities = temperatureHumidityEntities(this.currentHass, room);
    if (!entities.length) return; // HD-205/D-058 point 4 scope: nothing temperature/humidity-shaped mapped
    const key = this.cacheKey(room, this.activeHistoryWindow, entities);
    const start = new Date(Date.now() - this.historyWindowMs()).toISOString();
    this.loadWsResult(this.historyCache, this.historyInFlight, key, { type: "history/history_during_period", start_time: start, entity_ids: entities, minimal_response: true, no_attributes: true });
  }

  /** D-058 point 1: `entity_ids` is always this room's own, already-mapped `roomEntities()` -- never
   * `device_ids`, and the call is skipped entirely (not sent with an empty filter, which the HA frontend
   * itself treats as "no filter" i.e. house-wide) when that list is empty. */
  private loadLogbook(room: RoomConfig): void {
    const entities = roomEntities(room);
    if (!entities.length) return;
    const key = this.cacheKey(room, this.activeHistoryWindow, entities);
    const start = new Date(Date.now() - this.historyWindowMs()).toISOString();
    this.loadWsResult(this.logbookCache, this.logbookInFlight, key, { type: "logbook/get_events", start_time: start, entity_ids: entities });
  }

  /** Builds a static, non-interactive chart SVG from a trusted inner-markup string (bar rects or line
   * polylines assembled below from numbers only, never from entity-derived text) via `innerHTML`, which is
   * materially more compact than one `createElementNS`/`setAttribute` call per shape. */
  private chartSvg(inner: string, viewBoxWidth: number): SVGSVGElement {
    const holder = document.createElement("div");
    holder.innerHTML = `<svg viewBox="0 0 ${viewBoxWidth} 56" class="stat-svg" aria-hidden="true">${inner}</svg>`;
    return holder.firstElementChild as unknown as SVGSVGElement;
  }

  private emptyGroup(title: string, message: string): HTMLElement {
    return group(title, element("p", "info unavailable", message));
  }

  /** `title`/`ariaLabel` describe the figure; `body` is either the chart element or a plain fallback
   * message (never a fabricated chart for missing/empty/loading data -- D-058 point 5). */
  private statFigure(title: string, body: HTMLElement | SVGSVGElement | string, ariaLabel: string): HTMLElement {
    const figure = element("figure", "energy-comparison");
    figure.setAttribute("role", "img");
    figure.setAttribute("aria-label", ariaLabel);
    figure.append(element("figcaption", "", title), typeof body === "string" ? element("small", "", body) : body);
    return figure;
  }

  /** The room's smart-plug period sources for the active day/month/year selection, deduplicated by entity
   * ID so two plugs mapped to the same sensor are never double-counted or double-charted (same dedup as
   * `plugPeriodTotal()`). Shared by the combined statistics chart and the "Grootste verbruikers" ranking
   * (HD-219) -- both must agree on exactly the same source set. */
  private plugPeriodSources(room: RoomConfig): Array<{ name: string; entity: string }> {
    const key = this.activeEnergyPeriod === "day" ? "energy_day_entity" : this.activeEnergyPeriod === "month" ? "energy_month_entity" : "energy_year_entity";
    const seen = new Set<string>();
    const sources: Array<{ name: string; entity: string }> = [];
    (room.smart_plugs ?? []).forEach((plug) => {
      const entity = plug[key];
      if (!entity || seen.has(entity)) return;
      seen.add(entity);
      // HD-220: a blank plug.name (e.g. a smart plug promoted via HD-216's pairing helper without ever
      // typing a name) must not produce a blank chart/ranking label -- same fallback already used by
      // smartPlugCard()'s own title.
      // The switch entity (not the period entity) gives a stable fallback name that never changes depending
      // on which period tab is active.
      sources.push({ name: plug.name || friendlyName(this.currentHass?.states?.[plug.switch_entity], "Smart plug"), entity });
    });
    return sources;
  }

  /** One stacked bar per real statistics bucket -- never fabricated: a source missing one bucket renders a
   * visibly distinct "geen data"-marker for that segment instead of silently vanishing or blending into 0
   * (D-058 point 5, HD-219). Colors are fixed, theme-independent tokens (same styling constraint as
   * HD-208) so one color always means the same source across both the stack and the legend. */
  private statisticsBarChart(sources: Array<{ name: string; entity: string }>, columns: CombinedStatisticColumn[], missing: boolean[], period: StatisticsPeriod, periodLabel: string): HTMLElement {
    const totals = columns.map((column) => column.values.reduce<number>((sum, value) => sum + (value ?? 0), 0));
    const maximum = Math.max(...totals, 0);
    const figure = element("figure", "stat-chart");
    figure.setAttribute("role", "img");
    figure.setAttribute("aria-label", `Verbruik per ${periodLabel} in kilowattuur, gestapeld per bron. Schaal nul tot ${maximum.toLocaleString("nl-BE")} kilowattuur. ${columns.map((column, index) => `${statisticsBucketLabel(period, column.start)}: ${totals[index]!.toLocaleString("nl-BE")} kilowattuur`).join("; ")}.`);
    const scale = element("div", "stat-chart-scale");
    scale.append(element("span", "", `${maximum.toLocaleString("nl-BE")} kWh`), element("span", "", maximum > 0 ? (maximum / 2).toLocaleString("nl-BE") : "0"), element("span", "", "0"));
    const bars = element("div", "stat-chart-bars");
    // HD-220 follow-up: a percentage `height` on a flex child only resolves against a *definite* ancestor
    // height -- .stat-chart-column's own height was itself ambiguous (a grid item under `align-items:end`,
    // never stretched to the row's 140px), so every segment's previous percentage height silently collapsed
    // to its 2px/4px floor regardless of its real value (confirmed live: a sane ~2.7 kWh day rendered as an
    // invisible sliver). Each stack now gets an explicit PIXEL height here in JS -- a known-good ancestor
    // for the percentage heights segments still use for their own share *within* that stack.
    const chartHeightPx = 140;
    columns.forEach((column, columnIndex) => {
      const columnEl = element("div", "stat-chart-column");
      const stack = element("div", "stat-chart-stack");
      const total = totals[columnIndex]!;
      // HD-222: a column with no real data anywhere (every source undefined -- typically a future day in
      // a calendar-week-padded chart, see padToCalendarWeek()) must still reserve enough height for its
      // "missing" markers to actually be visible, not just a bare total-based height that collapses to 0px
      // and silently hides them again (the exact invisible-bar bug D-077 already fixed once, for a
      // different reason).
      const floorPx = column.values.reduce<number>((sum, value) => sum + (value === undefined ? 6 : 2), 0);
      stack.style.height = `${Math.max(maximum > 0 ? (total / maximum) * chartHeightPx : 0, floorPx)}px`;
      sources.forEach((source, sourceIndex) => {
        const value = column.values[sourceIndex];
        const segment = element("span", `stat-chart-segment${value === undefined ? " stat-chart-segment-missing" : ""}`);
        segment.style.setProperty("--stat-color", `var(--stat-color-${sourceIndex % 5})`);
        // Each segment's share of its OWN column's total (never of the chart-wide maximum) -- the stack's
        // height above already encodes this column's share of the maximum, so segments only need to split
        // 100% of that box between themselves.
        segment.style.setProperty("--stat-height", value === undefined ? "6px" : `${total > 0 ? Math.max((value / total) * 100, value > 0 ? 2 : 0) : 0}%`);
        segment.title = `${source.name}: ${value === undefined ? "geen data" : `${value.toLocaleString("nl-BE")} kWh`}`;
        stack.append(segment);
      });
      columnEl.append(stack, element("span", "stat-chart-label", statisticsBucketLabel(period, column.start)));
      bars.append(columnEl);
    });
    const legend = element("div", "stat-chart-legend");
    sources.forEach((source, index) => {
      const dot = element("span", "stat-chart-legend-dot");
      dot.style.setProperty("--stat-color", `var(--stat-color-${index % 5})`);
      const item = element("span", "stat-chart-legend-item");
      item.append(dot, document.createTextNode(missing[index] ? `${source.name} (geen langetermijnstatistiek)` : source.name));
      legend.append(item);
    });
    figure.append(element("figcaption", "", `Verbruik per ${periodLabel} · kWh`), scale, bars, legend);
    return figure;
  }

  /** "Grootste verbruikers": ranks this room's smart-plug period sources (same deduplicated source set as
   * `plugPeriodSources()`/`plugPeriodTotal()`) descending by their current value for the active period.
   * Each row's percentage is a share of the SUM of those same ranked sources -- never a fabricated
   * whole-room total (same caveat as the Apparaatvergelijking comparison section). */
  private topConsumersCard(room: RoomConfig, period: StatisticsPeriod, periodLabel: string): HTMLElement | undefined {
    const digits = period === "day" ? 2 : period === "month" ? 1 : 0;
    const entries: Array<{ name: string; value: number }> = [];
    this.plugPeriodSources(room).forEach(({ name, entity }) => {
      const value = energyKwh(this.currentHass?.states?.[entity]);
      if (value !== undefined) entries.push({ name, value });
    });
    if (!entries.length) return undefined;
    const ranked = rankEnergySources(entries);
    const figure = element("figure", "energy-ranking");
    figure.setAttribute("role", "img");
    figure.setAttribute("aria-label", `Grootste verbruikers voor ${periodLabel.toLowerCase()} in kilowattuur. ${ranked.map((entry) => `${entry.name} ${entry.value.toLocaleString("nl-BE")} kilowattuur, ${Math.round(entry.share * 100)} procent`).join("; ")}.`);
    figure.append(element("figcaption", "", "Grootste verbruikers"));
    const rows = element("div", "energy-bars");
    ranked.forEach((entry) => {
      const row = element("div", "energy-bar-row");
      const track = element("span", "energy-bar-track");
      const bar = element("span", "energy-bar");
      bar.style.setProperty("--energy-share", `${Math.max(entry.share * 100, entry.value > 0 ? 2 : 0)}%`);
      track.append(bar);
      row.append(
        element("span", "energy-bar-label", entry.name),
        track,
        element("strong", "energy-bar-value", `${entry.value.toFixed(digits).replace(".", ",")} kWh · ${Math.round(entry.share * 100)}%`)
      );
      rows.append(row);
    });
    figure.append(rows, element("small", "energy-comparison-note", "Percentage t.o.v. de gerangschikte apparaatbronnen; niet optellen tot een woningtotaal."));
    return figure;
  }

  /** The Verbruik tab's combined dag-/maand-/jaarstaafdiagram (HD-219: one stacked bar per real statistics
   * bucket, replacing the previous one-tiny-chart-per-device grid) plus the "Grootste verbruikers" ranking,
   * alongside `energyPeriodGroup()`'s single-number cards. Absent vs. empty vs. loading/unavailable are
   * kept visually distinct per bucket and per source -- never a fabricated value (D-058 point 5). */
  private energyStatisticsChart(room: RoomConfig): HTMLElement | undefined {
    const period = this.activeEnergyPeriod;
    const periodLabel = period === "day" ? "dag" : period === "month" ? "maand" : "jaar";
    const plugSources = this.plugPeriodSources(room);
    const roomEntity = period === "day" ? room.room_energy?.day_entity : period === "month" ? room.room_energy?.month_entity : room.room_energy?.year_entity;
    // A room-level period entity already includes any smart-plug consumption it overlaps with (same
    // authoritative-not-additive assumption as HD-208's room-total card), so it only joins the chart's own
    // source set when there are no smart-plug sources to stack it against -- never alongside them, which
    // would double-count.
    const chartSources = plugSources.length ? plugSources : (roomEntity ? [{ name: `${room.name} totaal`, entity: roomEntity }] : []);
    const wrapper = element("div", "energy-grid");
    if (chartSources.length) {
      const allSources = this.energyStatisticSources(room);
      const key = this.cacheKey(room, period, allSources.map((source) => source.entity));
      const response = this.statisticsCache.get(key);
      if (response === undefined) {
        wrapper.append(element("p", "info unavailable", "Historische verbruiksstatistiek wordt geladen of is niet beschikbaar."));
      } else {
        // HD-220: recorder statistics' "sum" is a running cumulative total, not a per-bucket amount
        // (confirmed live: a raw-sum chart showed a ~565 kWh scale for a room using ~1-2 kWh/day) --
        // deltaSeries() converts it to "how much in this bucket" before charting. Its first bucket is
        // normally undefined (no prior baseline), which is exactly why STATISTICS_PERIOD_SPAN fetches one
        // extra leading bucket: it gets dropped below so every DISPLAYED column has a real delta.
        // HD-221: that drop is only safe when there is MORE than one combined column -- a room whose
        // longest-running source has only ever recorded a single bucket (live-confirmed for "year" in a
        // project under a year old: exactly one yearly bucket existed) would otherwise lose its only real
        // data point and show "no chart" even though deltaSeries() already kept that bucket's own value
        // (see its length<=1 case above).
        const perSourceSeries = chartSources.map(({ entity }) => deltaSeries(extractStatisticSeries(response, entity)));
        const combined = combineStatisticBuckets(perSourceSeries);
        const dropped = combined.columns.length > 1 ? combined.columns.slice(1) : combined.columns;
        // HD-222: "day" always shows the full Monday-Sunday week, even for days that haven't happened yet
        // (as empty/"missing" columns) -- the owner saw the chart showing only "ma"/"di" on a Tuesday and
        // asked for the whole week, not one that visibly grows day by day.
        const monday = new Date(statisticsWindowStart("day", new Date()));
        monday.setDate(monday.getDate() + 1);
        const columns = period === "day" ? padToCalendarWeek(dropped, chartSources.length, monday.getTime()) : dropped;
        wrapper.append(columns.length
          ? this.statisticsBarChart(chartSources, columns, combined.missing, period, periodLabel)
          : element("p", "info unavailable", perSourceSeries.every((series) => series === undefined) ? "Geen langetermijnstatistiek voor deze bronnen." : `Geen data voor deze ${periodLabel}periode.`));
      }
    }
    const ranking = this.topConsumersCard(room, period, periodLabel);
    if (ranking) wrapper.append(ranking);
    if (!wrapper.childElementCount) return undefined;
    return group(`Verbruik per ${periodLabel}`, wrapper);
  }

  private historyLineSvg(series: Array<{ points: Array<{ t: number; v: number }> }>, minV: number, maxV: number, startMs: number, endMs: number): SVGSVGElement {
    const span = Math.max(endMs - startMs, 1);
    const lines = series.map((entry, index) => {
      const points = entry.points.map((point) => `${((point.t - startMs) / span * 200).toFixed(1)},${(maxV > minV ? 54 - (point.v - minV) / (maxV - minV) * 52 : 27).toFixed(1)}`).join(" ");
      return `<polyline points="${points}" class="${index === 0 ? "stat-line" : "stat-line-alt"}"/>`;
    }).join("");
    return this.chartSvg(lines, 200);
  }

  /** The Historie tab's temperature/humidity line graph (D-058 point 4: temperature/humidity only, power
   * stays exclusively on Verbruik). Temperature and humidity get separate charts since they are different
   * scales; never a flat fabricated line when a source has no recorded points in the window. */
  private historyChart(room: RoomConfig): HTMLElement {
    const entities = temperatureHumidityEntities(this.currentHass, room);
    const title = "Temperatuur & luchtvochtigheid";
    if (!entities.length) return this.emptyGroup(title, "Geen temperatuur- of vochtigheidsbron geconfigureerd voor deze kamer.");
    const key = this.cacheKey(room, this.activeHistoryWindow, entities);
    const response = this.historyCache.get(key);
    if (response === undefined) return this.emptyGroup(title, "Historiegegevens worden geladen of zijn niet beschikbaar.");
    const wrapper = element("div", "energy-grid");
    const temp: Array<{ name: string; points: Array<{ t: number; v: number }> }> = [];
    const humidity: typeof temp = [];
    entities.forEach((entity) => {
      const state = this.currentHass?.states?.[entity];
      const rows = (response as Record<string, Array<{ s?: string; lu: number }>> | null | undefined)?.[entity];
      const points = (rows ?? []).map((row) => ({ t: row.lu * 1000, v: Number(row.s) })).filter((point) => Number.isFinite(point.v));
      const isHumidity = state?.attributes?.device_class === "humidity";
      (isHumidity ? humidity : temp).push({ name: friendlyName(state, isHumidity ? "Luchtvochtigheid" : "Temperatuur"), points });
    });
    ([["Temperatuur (°C)", temp], ["Luchtvochtigheid (%)", humidity]] as const).forEach(([label, series]) => {
      if (!series.length) return;
      const withData = series.filter((entry) => entry.points.length > 0);
      if (!withData.length) {
        wrapper.append(this.statFigure(label, "Geen data in dit venster.", `${label}: geen data in dit venster.`));
        return;
      }
      const allValues = withData.flatMap((entry) => entry.points.map((point) => point.v));
      const allPoints = withData.flatMap((entry) => entry.points.map((point) => point.t));
      const chart = this.historyLineSvg(withData, Math.min(...allValues), Math.max(...allValues), Math.min(...allPoints), Math.max(...allPoints));
      const figure = this.statFigure(label, chart, `${label}: ${withData.map((entry) => `${entry.name} van ${entry.points[0]!.v} tot ${entry.points[entry.points.length - 1]!.v}`).join("; ")}.`);
      figure.append(element("small", "energy-comparison-note", withData.map((entry) => entry.name).join(" · ")));
      wrapper.append(figure);
    });
    return group(title, wrapper);
  }

  /** The Historie tab's chronological event list: newest first, hard-capped at 50 (D-058 point 2), and
   * strictly limited to this room's own already-mapped entities via `filterRoomLogbookEvents()` (D-058
   * point 1) -- never the raw entity_id or free-text message, only the resolved name and timestamp. */
  private logbookList(room: RoomConfig): HTMLElement {
    const entities = roomEntities(room);
    const title = "Gebeurtenissen";
    if (!entities.length) return this.emptyGroup(title, "Geen gemapte entiteiten voor het gebeurtenissenlogboek.");
    const key = this.cacheKey(room, this.activeHistoryWindow, entities);
    const response = this.logbookCache.get(key);
    if (response === undefined) return this.emptyGroup(title, "Logboek wordt geladen of is niet beschikbaar.");
    const events = filterRoomLogbookEvents((response as LogbookEntryLike[] | null | undefined) ?? [], entities);
    if (!events.length) return this.emptyGroup(title, "Geen gebeurtenissen in dit venster.");
    const list = element("div", "info-list");
    events.forEach((entry) => {
      // Never fall back to the raw entity_id here: a resolved name/friendly_name, or else a generic label.
      // entry.name comes straight from HA's own logbook response — some HA versions have been known to put the
      // entity_id itself in this field when no friendly name was ever set, so it's checked rather than trusted.
      const serverName = entry.name && !/^[a-z_]+\.[a-z0-9_]+$/.test(entry.name) ? entry.name : undefined;
      const name = serverName || friendlyName(entry.entity_id ? this.currentHass?.states?.[entry.entity_id] : undefined, "Onbekende bron");
      list.append(element("div", "info", `${name} · ${formatDateTime(new Date(entry.when * 1000))}`));
    });
    return group(title, list);
  }

  private selectorGroup(ariaLabel: string, keyPrefix: string, options: ReadonlyArray<readonly [string, string, boolean, () => void]>): HTMLElement {
    const selector = element("div", "period-selector");
    selector.setAttribute("role", "group");
    selector.setAttribute("aria-label", ariaLabel);
    options.forEach(([value, label, pressed, onClick]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.setAttribute("aria-pressed", String(pressed));
      button.dataset.controlKey = `${keyPrefix}:${value}`;
      button.addEventListener("click", onClick);
      selector.append(button);
    });
    return selector;
  }

  private historyWindowSelector(room: RoomConfig): HTMLElement {
    const labels = { "24h": "24 uur", "7d": "7 dagen", "30d": "30 dagen" } as const;
    return this.selectorGroup("Historieperiode", "history-window", (["24h", "7d", "30d"] as const).map((value) => [value, labels[value], this.activeHistoryWindow === value, () => { this.activeHistoryWindow = value; this.loadHistory(room); this.loadLogbook(room); this.render(true); }]));
  }

  private historyPanel(room: RoomConfig): HTMLElement {
    const panel = element("div", "room-column energy");
    panel.append(this.historyWindowSelector(room), this.historyChart(room), this.logbookList(room));
    return panel;
  }

  private command(label: string, entity: string, kind: DetailKind, command: DetailCommand, data: Record<string, unknown> = {}): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "command";
    button.textContent = label;
    button.dataset.controlKey = `${kind}:${entity}:${command}`;
    button.disabled = this.pendingActions.has(this.actionKey(entity, kind, command)) || !this.planAction(entity, kind, command, data);
    button.addEventListener("click", () => this.callService(entity, kind, command, data));
    return button;
  }

  private confirmedCommand(label: string, entity: string, command: "open" | "close"): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "command";
    button.textContent = label;
    button.dataset.controlKey = `cover:${entity}:${command}`;
    button.disabled = this.pendingActions.has(this.actionKey(entity, "cover", command)) || !this.planAction(entity, "cover", command);
    let armed = false;
    const reset = (): void => {
      armed = false;
      button.textContent = label;
      button.setAttribute("aria-label", `${label} ${friendlyName(this.currentHass?.states?.[entity], entity)}`);
    };
    button.addEventListener("click", () => {
      if (!armed) {
        armed = true;
        button.textContent = `Bevestig ${label.toLowerCase()}`;
        button.setAttribute("aria-label", `Bevestig ${label.toLowerCase()} ${friendlyName(this.currentHass?.states?.[entity], entity)}`);
        return;
      }
      this.callService(entity, "cover", command);
      reset();
    });
    return button;
  }

  private informationGroup(titleText: string, sources: Array<[string, DeviceRole]>): HTMLElement | undefined {
    const unique = sources.filter(([entity]) => entity);
    if (!unique.length) return undefined;
    const list = element("div", "info-list");
    unique.forEach(([entity, role], index) => {
      const presentation = devicePresentation(this.currentHass, entity, role, index);
      const row = element("div", `info ${presentation.tone}`);
      row.setAttribute("aria-label", `${presentation.label}: ${presentation.value}`);
      row.textContent = `${presentation.label} · ${presentation.value}`;
      list.append(row);
    });
    return group(titleText, list);
  }

  private mushroomCard(entity: string, role: DeviceRole, actions: HTMLButtonElement[] = [], toggle = false): HTMLElement {
    const state = this.currentHass?.states?.[entity];
    const presentation = devicePresentation(this.currentHass, entity, role);
    const card = document.createElement(toggle ? "button" : "section");
    card.className = `mushroom-card ${role}-card ${presentation.tone}`;
    if (toggle) {
      (card as HTMLButtonElement).type = "button";
      card.dataset.controlKey = `light:${entity}:toggle`;
      (card as HTMLButtonElement).disabled = this.pendingActions.has(this.actionKey(entity, "light", "toggle")) || !this.planAction(entity, "light", "toggle");
      card.setAttribute("aria-label", `${presentation.label}: ${presentation.value}. Schakel`);
      card.addEventListener("click", () => this.callService(entity, "light", "toggle"));
    }
    const symbol = element("span", "mushroom-icon"); symbol.append(icon(presentation.icon));
    const copy = element("span", "mushroom-copy");
    const name = element("strong", "", presentation.label);
    const value = element("small", "", presentation.value);
    copy.append(name, value); card.append(symbol, copy);
    if (actions.length) {
      const controls = element("div", "commands");
      actions.forEach((action) => action.setAttribute("aria-label", `${action.textContent} ${presentation.label}`));
      controls.append(...actions); card.append(controls);
    }
    return card;
  }

  private lightGroupCard(groupConfig: NonNullable<RoomConfig["light_groups"]>[number]): HTMLElement {
    const state = resolveLightGroupState(this.currentHass?.states ?? {}, groupConfig.member_entities);
    const labels: Record<LightGroupState, string> = { off: "Uit", on: "Aan", partial: "Gedeeltelijk aan", unknown: "Onbekend", unavailable: "Niet beschikbaar" };
    const card = document.createElement("button");
    card.type = "button";
    card.className = `mushroom-card light-card light-group-card ${state === "on" ? "active" : state === "partial" ? "mixed" : state}`;
    card.dataset.controlKey = `light:${groupConfig.control_entity}:toggle`;
    card.disabled = state === "unknown" || state === "unavailable" || this.pendingActions.has(this.actionKey(groupConfig.control_entity, "light", "toggle")) || !this.planAction(groupConfig.control_entity, "light", "toggle");
    card.setAttribute("aria-label", `${groupConfig.name}: ${labels[state]}. Schakel groep van ${groupConfig.member_entities.length} lampen`);
    card.addEventListener("click", () => this.callService(groupConfig.control_entity, "light", "toggle"));
    const symbol = element("span", "mushroom-icon"); symbol.append(icon("mdi:lightbulb-group-outline"));
    const copy = element("span", "mushroom-copy");
    copy.append(element("strong", "", groupConfig.name), element("small", "status", labels[state]), element("small", "scope", `${groupConfig.member_entities.length} lampen`));
    card.append(symbol, copy);
    return card;
  }

  private coverCard(coverConfig: NonNullable<RoomConfig["cover_controls"]>[number]): HTMLElement {
    const extendedLabels = coverConfig.kind === "awning" || coverConfig.kind === "screen";
    const openLabel = extendedLabels ? "Uit" : "Open";
    const closeLabel = extendedLabels ? "In" : "Dicht";
    const requiresConfirmation = coverConfig.confirmation === "movement" || coverConfig.kind === "awning";
    const action = (label: string, command: "open" | "close") => requiresConfirmation
      ? this.confirmedCommand(label, coverConfig.entity, command)
      : this.command(label, coverConfig.entity, "cover", command);
    return this.mushroomCard(coverConfig.entity, "cover", [action(openLabel, "open"), this.command("Stop", coverConfig.entity, "cover", "stop"), action(closeLabel, "close")]);
  }

  /** Individual dimmable lights: a toggle mushroom-card plus an independent brightness slider next to it. */
  private lightDeviceCard(entity: string): HTMLElement {
    const wrapper = element("div", "light-card-wrapper");
    const toggle = this.mushroomCard(entity, "light", [], true);
    wrapper.append(toggle);
    const state = this.currentHass?.states?.[entity];
    const brightnessPercent = percentAttribute(state, "brightness") ?? 0;
    const row = element("div", "range-row");
    const label = document.createElement("label");
    const inputId = `light-brightness-${entity.replaceAll(".", "-")}`;
    label.setAttribute("for", inputId);
    label.textContent = "Helderheid";
    const input = document.createElement("input");
    input.type = "range";
    input.id = inputId;
    input.min = "0";
    input.max = "100";
    input.value = String(brightnessPercent);
    input.dataset.controlKey = `light:${entity}:set_brightness`;
    const output = document.createElement("output");
    // The range input already announces its own value; suppress the output's implicit role="status" so it
    // never competes with the shared action-feedback live region for assistive-technology attention.
    output.setAttribute("aria-hidden", "true");
    output.textContent = `${brightnessPercent}%`;
    input.disabled = !actionable(state) || !this.planAction(entity, "light", "set_brightness", { brightness_pct: brightnessPercent });
    input.addEventListener("input", () => { output.textContent = `${input.value}%`; });
    input.addEventListener("change", () => this.callService(entity, "light", "set_brightness", { brightness_pct: Number(input.value) }));
    row.append(label, input, output);
    wrapper.append(row);
    return wrapper;
  }

  /** Appends a read-only position bar around an already-built cover card; never touches its confirmation logic. */
  private withPositionTrack(card: HTMLElement, entity: string): HTMLElement {
    const state = this.currentHass?.states?.[entity];
    const position = numberAttribute(state, "current_position") ?? (state?.state === "open" ? 100 : state?.state === "closed" ? 0 : undefined);
    const track = element("div", "position-track");
    const fill = element("div", "position-fill");
    fill.style.width = `${position ?? 0}%`;
    track.append(fill);
    card.append(track);
    return card;
  }

  private lightingStage(room: RoomConfig): HTMLElement {
    const stage = element("div", "stage-body");
    const groups = (room.light_groups ?? []).map((groupConfig) => this.lightGroupCard(groupConfig));
    if (groups.length) {
      const heading = element("div", "section-heading");
      heading.append(element("h4", "", "Lichtgroepen"), element("span", "", `${groups.length} groepen`));
      const grid = element("div", "group-grid mushroom-grid"); grid.append(...groups);
      stage.append(heading, grid);
    }
    const individualEntities = individualLightEntities(room);
    if (individualEntities.length) {
      const heading = element("div", "section-heading");
      heading.append(element("h4", "", "Individuele lampen"), element("span", "", `${individualEntities.length} apparaten`));
      const grid = element("div", "device-grid mushroom-grid");
      individualEntities.forEach((entity) => grid.append(entity.startsWith("switch.") ? this.mushroomCard(entity, "light", [], true) : this.lightDeviceCard(entity)));
      stage.append(heading, grid);
    }
    return stage;
  }

  private coversStage(room: RoomConfig): HTMLElement {
    const stage = element("div", "stage-body");
    const typedCovers = new Set((room.cover_controls ?? []).map((coverConfig) => coverConfig.entity));
    const untyped = room.cover_entities.filter((entity) => !typedCovers.has(entity));
    const allEntities = [...(room.cover_controls ?? []).map((coverConfig) => coverConfig.entity), ...untyped];
    const classify = (entity: string): "open" | "partial" | "closed" | "unknown" => {
      const state = this.currentHass?.states?.[entity];
      const position = numberAttribute(state, "current_position");
      if (position !== undefined) return position >= 100 ? "open" : position <= 0 ? "closed" : "partial";
      if (state?.state === "open") return "open";
      if (state?.state === "closed") return "closed";
      return "unknown";
    };
    if (allEntities.length) {
      const classes = allEntities.map(classify);
      const summary = element("div", "summary-strip");
      const metric = (value: string, label: string): HTMLElement => { const item = element("div", "summary-metric"); item.append(element("strong", "", value), element("span", "", label)); return item; };
      summary.append(
        metric(String(allEntities.length), "bedieningen"),
        metric(String(classes.filter((c) => c === "open").length), "volledig open"),
        metric(String(classes.filter((c) => c === "partial").length), "gedeeltelijk"),
        metric(String(classes.filter((c) => c === "closed").length), "gesloten / in")
      );
      stage.append(summary);
    }
    const grid = element("div", "cover-grid mushroom-grid");
    (room.cover_controls ?? []).forEach((coverConfig) => grid.append(this.withPositionTrack(this.coverCard(coverConfig), coverConfig.entity)));
    untyped.forEach((entity) => grid.append(this.withPositionTrack(this.mushroomCard(entity, "cover", [this.confirmedCommand("Open", entity, "open"), this.command("Stop", entity, "cover", "stop"), this.confirmedCommand("Dicht", entity, "close")]), entity)));
    if (grid.childElementCount) stage.append(grid);
    return stage;
  }

  private comfortStage(room: RoomConfig): HTMLElement {
    const stage = element("div", "stage-body");
    if (room.hvac.entity) {
      const target = numberAttribute(this.currentHass?.states?.[room.hvac.entity], "temperature");
      const grid = element("div", "comfort-grid mushroom-grid");
      grid.append(this.mushroomCard(room.hvac.entity, "climate", target === undefined ? [] : [this.command("− 0,5°", room.hvac.entity, "climate", "set_temperature", { temperature: target - .5 }), this.command("+ 0,5°", room.hvac.entity, "climate", "set_temperature", { temperature: target + .5 })]));
      stage.append(grid);
    }
    const comfort = this.informationGroup("Comfort & klimaat", room.hvac.comfort_entities.map((entity): [string, DeviceRole] => [entity, "comfort"]));
    const mediaCards = room.media_entities.map((entity) => this.mushroomCard(entity, "media", [this.command(this.currentHass?.states?.[entity]?.state === "playing" ? "Pauze" : "Speel", entity, "media", "toggle")]));
    let media: HTMLElement | undefined;
    if (mediaCards.length) { const grid = element("div", "mushroom-grid"); grid.append(...mediaCards); media = group("Media", grid); }
    const safety = this.informationGroup("Veiligheid", room.safety_entities.map((entity): [string, DeviceRole] => [entity, "safety"]));
    const cameras = this.informationGroup("Camera's", room.camera_entities.map((entity): [string, DeviceRole] => [entity, "camera"]));
    [comfort, media, safety, cameras].forEach((section) => { if (section) stage.append(section); });
    if (room.desk && Object.keys(room.desk.card_config).length > 0) {
      const card = element("div", "embedded-card desk-card");
      stage.append(group("Bureau", card));
      void this.mountCard(card, { ...room.desk.card_config, type: "custom:linak-desk-card" });
    }
    return stage;
  }

  /** A single entity's live reading normalized to watts; undefined unless it reports a numeric W/kW state. */
  private entityWatts(entity: string | undefined): number | undefined {
    if (!entity) return undefined;
    const state = this.currentHass?.states?.[entity];
    const value = Number(state?.state);
    const unit = state?.attributes?.unit_of_measurement;
    if (!Number.isFinite(value) || (unit !== "W" && unit !== "kW")) return undefined;
    return unit === "kW" ? value * 1000 : value;
  }

  /** Sums a smart plug's live wattage across valid W/kW readings; undefined when nothing reports. */
  private plugWatts(plugs: NonNullable<RoomConfig["smart_plugs"]>): number | undefined {
    const valid = plugs.map((plug) => this.entityWatts(plug.power_entity)).filter((value): value is number => value !== undefined);
    return valid.length ? valid.reduce((sum, value) => sum + value, 0) : undefined;
  }

  /** The room's single "right now" wattage figure, shared by the rail summary, the plugs-stage summary strip and the
   * Energie tab's room-total card so the number is never computed three different ways. When room_energy.power_entity
   * is configured it is treated as an authoritative whole-room/circuit meter that already includes every downstream
   * plug and device, so nothing is added on top of it. Otherwise this combines every smart plug's power_entity with
   * every room.power_entities entity reporting a genuine W/kW reading (e.g. an air conditioner), deduplicated by
   * entity_id so a device configured in both lists is never counted twice. */
  private roomCurrentWatts(room: RoomConfig): number | undefined {
    if (room.room_energy?.power_entity) return this.entityWatts(room.room_energy.power_entity);
    const plugs = room.smart_plugs ?? [];
    const plugEntities = new Set(plugs.map((plug) => plug.power_entity).filter(Boolean));
    const extra = room.power_entities.filter((entity, index) => !plugEntities.has(entity) && room.power_entities.indexOf(entity) === index).map((entity) => this.entityWatts(entity)).filter((value): value is number => value !== undefined);
    const plugTotal = this.plugWatts(plugs);
    if (plugTotal === undefined && !extra.length) return undefined;
    return (plugTotal ?? 0) + extra.reduce((sum, value) => sum + value, 0);
  }

  /** True when room.power_entities contributes at least one genuine W/kW reading beyond any smart_plugs
   * power_entity (deduplicated the same way roomCurrentWatts() dedupes them). Used to decide whether the Energie
   * tab's room-total card should surface the combined figure: a plugs-only room's current wattage is already
   * shown on the Smart plugs tab, so plugs alone never justify this card — but a power_entities reading does,
   * whether it stands alone (e.g. an airco with no smart_plugs) or combines with smart_plugs in the same room. */
  private hasExtraPowerReading(room: RoomConfig): boolean {
    const plugEntities = new Set((room.smart_plugs ?? []).map((plug) => plug.power_entity).filter(Boolean));
    return room.power_entities.some((entity, index) => !plugEntities.has(entity) && room.power_entities.indexOf(entity) === index && this.entityWatts(entity) !== undefined);
  }

  /** Sums a smart plug period total (day/month/year) across configured plugs, deduplicated by entity ID so two
   * plugs mapped to the same period sensor are never counted twice; undefined when nothing reports. */
  private plugPeriodTotal(plugs: NonNullable<RoomConfig["smart_plugs"]>, key: "energy_day_entity" | "energy_month_entity" | "energy_year_entity"): number | undefined {
    const entities = plugs.map((plug) => plug[key]).filter((entity, index, all): entity is string => Boolean(entity) && all.indexOf(entity) === index);
    const values = entities.map((entity) => energyKwh(this.currentHass?.states?.[entity])).filter((value): value is number => value !== undefined);
    return values.length ? values.reduce((sum, value) => sum + value, 0) : undefined;
  }

  /** A period total preferring the room's own authoritative `room_energy.*_entity` (e.g. a circuit meter
   * that may include non-plug devices too, same "authoritative, not additive" assumption as
   * `roomCurrentWatts()`) and falling back to the summed smart-plug total only when absent -- the same
   * fallback `energyPeriodGroup()`'s now-removed room-total card used to apply per period. */
  private roomPeriodTotal(room: RoomConfig, period: "day" | "month" | "year"): number | undefined {
    const roomEntity = period === "day" ? room.room_energy?.day_entity : period === "month" ? room.room_energy?.month_entity : room.room_energy?.year_entity;
    if (roomEntity) return energyKwh(this.currentHass?.states?.[roomEntity]);
    const plugKey = period === "day" ? "energy_day_entity" : period === "month" ? "energy_month_entity" : "energy_year_entity";
    return this.plugPeriodTotal(room.smart_plugs ?? [], plugKey);
  }

  /** A short "today" total for the rail: the room's own day source, else (only when no room-level source is configured
   * at all) the plugs' combined day total. When a room-level source IS configured but is currently unavailable, the
   * line is omitted rather than silently swapped for a different, smaller, unlabeled partial total. */
  private energySummary(room: RoomConfig): string | undefined {
    const roomDayEntity = room.room_energy?.day_entity;
    const total = roomDayEntity ? energyKwh(this.currentHass?.states?.[roomDayEntity]) : this.plugPeriodTotal(room.smart_plugs ?? [], "energy_day_entity");
    return total === undefined ? undefined : `${total.toFixed(2).replace(".", ",")} kWh vandaag`;
  }

  private plugsStage(room: RoomConfig): HTMLElement {
    const stage = element("div", "stage-body");
    const plugs = room.smart_plugs ?? [];
    if (!plugs.length) return stage;
    const totalWatts = this.roomCurrentWatts(room);
    const activeCount = plugs.filter((plug) => this.currentHass?.states?.[plug.switch_entity]?.state === "on").length;
    const dayTotal = this.plugPeriodTotal(plugs, "energy_day_entity");
    const monthTotal = this.plugPeriodTotal(plugs, "energy_month_entity");
    const summary = element("div", "summary-strip");
    const metric = (value: string, label: string): HTMLElement => { const item = element("div", "summary-metric"); item.append(element("strong", "", value), element("span", "", label)); return item; };
    summary.append(
      metric(totalWatts === undefined ? "—" : `${Math.round(totalWatts)} W`, "huidig vermogen"),
      metric(String(activeCount), "actieve plugs"),
      metric(dayTotal === undefined ? "—" : `${dayTotal.toFixed(2).replace(".", ",")} kWh`, "vandaag"),
      metric(monthTotal === undefined ? "—" : `${monthTotal.toFixed(1).replace(".", ",")} kWh`, "deze maand")
    );
    stage.append(summary);
    const grid = element("div", "plug-grid mushroom-grid");
    plugs.forEach((plug) => grid.append(this.smartPlugCard(plug)));
    stage.append(grid);
    return stage;
  }

  /** HD-220: one at-a-glance strip combining the room's now/day/month/year(-to-date) totals, shown
   * regardless of the active period tab -- the owner's own request after comparing against the design
   * study ("ik mis het overzicht met nu, lopende dag, lopende maand en... van alle gecombineerde smart
   * plugs"). Reuses `roomCurrentWatts()`/`roomPeriodTotal()` so these numbers never disagree with the rail
   * or the Smart plugs tab, and prefer the room's own authoritative `room_energy.*_entity` the same way
   * `roomCurrentWatts()` does for "nu" (HD-221: a first version summed smart plugs unconditionally, silently
   * ignoring a configured room-level meter). The "year" figure is the room's calendar-year-to-date
   * utility_meter total (`energy_year_entity`), not a rolling trailing-12-months window -- this project has
   * no rolling-window statistic to report honestly, so it is labelled "dit jaar", never "laatste 12 maand". */
  private energySummaryStrip(room: RoomConfig): HTMLElement | undefined {
    const nowWatts = this.roomCurrentWatts(room);
    const dayTotal = this.roomPeriodTotal(room, "day");
    const monthTotal = this.roomPeriodTotal(room, "month");
    const yearTotal = this.roomPeriodTotal(room, "year");
    if (nowWatts === undefined && dayTotal === undefined && monthTotal === undefined && yearTotal === undefined) return undefined;
    const summary = element("div", "summary-strip");
    const metric = (value: string, label: string): HTMLElement => { const item = element("div", "summary-metric"); item.append(element("strong", "", value), element("span", "", label)); return item; };
    summary.append(
      metric(nowWatts === undefined ? "—" : `${Math.round(nowWatts)} W`, "nu"),
      metric(dayTotal === undefined ? "—" : `${dayTotal.toFixed(2).replace(".", ",")} kWh`, "vandaag"),
      metric(monthTotal === undefined ? "—" : `${monthTotal.toFixed(1).replace(".", ",")} kWh`, "deze maand"),
      metric(yearTotal === undefined ? "—" : `${yearTotal.toFixed(0)} kWh`, "dit jaar")
    );
    return summary;
  }

  private energyStage(room: RoomConfig): HTMLElement {
    const stage = element("div", "stage-body");
    const summary = this.energySummaryStrip(room);
    const periodEnergy = this.energyPeriodGroup(room);
    const statisticsChart = this.energyStatisticsChart(room);
    if (summary) stage.append(summary);
    if (periodEnergy) stage.append(periodEnergy);
    if (statisticsChart) stage.append(statisticsChart);
    if (!stage.childElementCount) stage.append(element("p", "info unavailable", "Geen verbruiksgegevens geconfigureerd voor deze kamer."));
    return stage;
  }

  private smartPlugCard(plug: NonNullable<RoomConfig["smart_plugs"]>[number]): HTMLElement {
    const state = this.currentHass?.states?.[plug.switch_entity];
    const card = element("section", `smart-plug-card mushroom-card${plug.protected ? " protected" : ""}${state?.state === "on" ? " active" : ""}`);
    const title = element("strong", "", plug.name || friendlyName(state, "Smart plug"));
    const values = document.createElement("small");
    values.textContent = [plug.power_entity, plug.energy_entity, plug.voltage_entity].filter(Boolean).map(entity => stateText(this.currentHass?.states?.[entity])).join(" · ") || stateText(state);
    const metrics = element("div", "plug-metrics");
    const metricValue = (entity: string | undefined, digits: number): string => {
      const value = entity ? energyKwh(this.currentHass?.states?.[entity]) : undefined;
      return value === undefined ? "—" : `${value.toFixed(digits).replace(".", ",")} kWh`;
    };
    const metric = (entity: string | undefined, digits: number, label: string): HTMLElement => { const item = element("div", "plug-metric"); item.append(element("strong", "", metricValue(entity, digits)), element("span", "", label)); return item; };
    metrics.append(metric(plug.energy_day_entity, 2, "dag"), metric(plug.energy_month_entity, 1, "maand"), metric(plug.energy_year_entity, 0, "jaar"));
    const lock = document.createElement("button"); lock.type = "button"; lock.className = "plug-lock"; lock.textContent = plug.protected ? "Beveiligd apparaat" : "Ontgrendel om te schakelen";
    const confirm = document.createElement("button"); confirm.type = "button"; confirm.className = "command"; confirm.hidden = true;
    lock.dataset.controlKey = `plug:${plug.switch_entity}:unlock`;
    confirm.dataset.controlKey = `plug:${plug.switch_entity}:confirm`;
    lock.disabled = confirm.disabled = plug.protected === true || this.pendingActions.has(this.actionKey(plug.switch_entity, "plug", "toggle")) || !this.planAction(plug.switch_entity, "plug", "toggle");
    lock.addEventListener("click", () => { confirm.hidden = false; confirm.textContent = state?.state === "on" ? "Bevestig uitschakelen" : "Bevestig inschakelen"; lock.textContent = "Bevestiging vereist"; });
    confirm.addEventListener("click", () => {
      this.callService(plug.switch_entity, "plug", "toggle");
      confirm.hidden = true;
      lock.textContent = "Ontgrendel om te schakelen";
      lock.focus();
    });
    card.append(title, values, metrics);
    if (plug.protected) card.append(element("small", "protection-reason", plug.protection_reason || "Bediening is voor dit apparaat uitgeschakeld."));
    card.append(lock, confirm); return card;
  }

  /** HD-221: the owner asked for the "Keuken totaal" room-total card and the per-device cards that used to
   * live here to be removed entirely -- `energySummaryStrip()` (now/day/month/year, period-tab-independent)
   * and "Grootste verbruikers" (`energyStatisticsChart()`) already cover this information with less
   * redundancy. All that remains here is the period selector itself: both `energyStatisticsChart()` and the
   * legacy "Energie" details panel still depend on it to pick which period is active. */
  private energyPeriodGroup(room: RoomConfig): HTMLElement | undefined {
    const hasPowerEntitiesReading = !room.room_energy?.power_entity && this.hasExtraPowerReading(room);
    const configured = Boolean(room.room_energy && Object.values(room.room_energy).some(Boolean)) || (room.smart_plugs ?? []).some((plug) => plug.energy_day_entity || plug.energy_month_entity || plug.energy_year_entity) || hasPowerEntitiesReading;
    if (!configured) return undefined;
    const wrapper = element("div", "energy-period energy-period-card");
    const periods = [["day", "Vandaag"], ["month", "Maand"], ["year", "Jaar"]] as const;
    const selector = this.selectorGroup("Energieperiode", "energy-period", periods.map(([period, label]) => [period, label, this.activeEnergyPeriod === period, () => { this.activeEnergyPeriod = period; this.loadStatistics(room); this.render(true); }]));
    wrapper.append(selector);
    return group("Kamerenergie", wrapper);
  }

  /** Rail icon + one-line summary per capability; undefined omits the summary line rather than showing a placeholder. */
  private capabilitySummary(room: RoomConfig, key: RoomCapabilityStage): string | undefined {
    if (key === "lighting") {
      const reachable = individualLightEntities(room).filter((entity) => actionable(this.currentHass?.states?.[entity]));
      if (!reachable.length) return undefined;
      const on = reachable.filter((entity) => this.currentHass?.states?.[entity]?.state === "on").length;
      return `${on} van ${reachable.length} aan`;
    }
    if (key === "covers") {
      const count = room.cover_entities.length;
      return count ? `${count} bediening${count === 1 ? "" : "en"}` : undefined;
    }
    if (key === "comfort") {
      const temperature = room.hvac.entity ? numberAttribute(this.currentHass?.states?.[room.hvac.entity], "current_temperature") : undefined;
      return temperature === undefined ? undefined : `${temperature} °C`;
    }
    if (key === "plugs") {
      const reachablePlugs = (room.smart_plugs ?? []).filter((plug) => actionable(this.currentHass?.states?.[plug.switch_entity]));
      if (!reachablePlugs.length) return undefined;
      const active = reachablePlugs.filter((plug) => this.currentHass?.states?.[plug.switch_entity]?.state === "on").length;
      const watts = this.roomCurrentWatts(room);
      return watts === undefined ? `${active} actief` : `${active} actief · ${Math.round(watts)} W`;
    }
    return this.energySummary(room);
  }

  /** Shared per-stage header: eyebrow label plus a status badge derived from real entity states (never a fabricated signal). */
  private stageHead(room: RoomConfig, key: RoomCapabilityStage, title: string): HTMLElement[] {
    const entityRoles = capabilityEntityRoles(room, key);
    const head = element("div", "section-heading stage-head");
    head.append(element("span", "eyebrow", title));
    // Nothing configured for this stage can actually be checked (e.g. a desk-only comfort stage): omit the badge
    // rather than fabricate a "Beschikbaar" signal from an empty entity list.
    if (!entityRoles.length) return [head];
    const states = entityRoles.map(({ entity, role }) => ({ state: this.currentHass?.states?.[entity], role }));
    const degradedCount = states.filter(({ state }) => !actionable(state)).length;
    const warningCount = states.filter(({ state, role }) => actionable(state) && deviceTone(state, role) === "warning").length;
    const tone: "unavailable" | "warning" | "normal" = degradedCount > 0 ? "unavailable" : warningCount > 0 ? "warning" : "normal";
    const badgeText = tone === "unavailable" ? "Deels niet beschikbaar" : tone === "warning" ? "Aandacht" : "Beschikbaar";
    const badge = element("span", `state-badge${tone === "normal" ? "" : ` ${tone}`}`, badgeText);
    head.append(badge);
    // HD-220 follow-up: the "normal" tone used to pair the Beschikbaar badge with a generic filler note
    // ("Status en bediening blijven gescheiden in één overzicht") on every single stage -- no real
    // information, just noise the owner flagged as distracting. Only warning/unavailable notes carry an
    // actual signal, so only those render.
    if (tone === "normal") return [head];
    const noteText = tone === "unavailable"
      ? `${degradedCount} bron(nen) zonder betrouwbare toestand.`
      : warningCount === 1 ? "1 signaal vraagt aandacht." : `${warningCount} signalen vragen aandacht.`;
    const noteEl = element("small", `state-note ${tone}`, noteText);
    return [head, noteEl];
  }

  /** Hero status pills: only from data that genuinely exists, deduplicated, always including the existing operational summary. */
  private heroPills(room: RoomConfig): HTMLElement[] {
    const values: string[] = [];
    if (room.hvac.entity) {
      const current = numberAttribute(this.currentHass?.states?.[room.hvac.entity], "current_temperature");
      if (current !== undefined) values.push(`${current} °C`);
    }
    const operational = getRoomMetric(this.currentHass, room);
    if (!values.includes(operational)) values.push(operational);
    return values.map((value) => element("span", "hero-pill", value));
  }

  private async mountCard(host: HTMLElement, config: Record<string, unknown>): Promise<void> {
    try {
      const helpers = await window.loadCardHelpers?.();
      if (!this.isConnected || !host.isConnected) return;
      if (!helpers) throw new Error();
      const card = helpers.createCardElement(config); card.hass = this.currentHass; host.replaceChildren(card);
    } catch {
      if (host.isConnected) host.textContent = "Kaart niet beschikbaar.";
    }
  }


  /** The same light/cover/media expansion `render()` has always applied to the configured room (folding
   * in light groups, typed cover controls and the legacy single control_* entities) before building any
   * stage. HD-205's loaders must key their caches on this SAME expanded entity set, not the raw
   * `this.config.room` -- `roomEntities()` (used for the logbook allowlist) reads light/cover/media
   * entities, so a mismatch here would silently stall the Historie tab on "wordt geladen" forever (a real
   * bug caught while writing this ticket's own browser test). */
  private expandRoom(sourceRoom: RoomConfig): RoomConfig {
    const selectedControls = sourceRoom.control_entities ?? [];
    return { ...sourceRoom,
      light_entities: [...new Set([...sourceRoom.light_entities, ...(sourceRoom.light_groups ?? []).flatMap((groupConfig) => [groupConfig.control_entity, ...groupConfig.member_entities]), sourceRoom.control_light_entity, ...selectedControls.filter(entity => entity.startsWith("light."))].filter((value): value is string => Boolean(value)))],
      light_switch_entities: [...new Set(sourceRoom.light_switch_entities ?? [])],
      cover_entities: [...new Set([...sourceRoom.cover_entities, ...(sourceRoom.cover_controls ?? []).map((coverConfig) => coverConfig.entity), sourceRoom.control_cover_entity, sourceRoom.control_awning_entity, ...selectedControls.filter(entity => entity.startsWith("cover."))].filter((value): value is string => Boolean(value)))],
      media_entities: [...new Set([...sourceRoom.media_entities, sourceRoom.control_media_entity, ...selectedControls.filter(entity => entity.startsWith("media_player."))].filter((value): value is string => Boolean(value)))]
    };
  }

  private render(preserveFocus = false): void {
    if (!this.shadowRoot || !this.config) return;
    const focusKey = preserveFocus ? (this.shadowRoot.activeElement as HTMLElement | null)?.dataset.controlKey : undefined;
    const room = this.expandRoom(this.config.room);
    const style = document.createElement("style");
    style.textContent = `
      ${roomStyles}
      .detail,.control-deck,.room-layout-primary,.room-column,.mushroom-controls,.group,.detail-panel,.stage,.stage-body{display:grid;gap:18px;min-width:0;align-content:start}.detail{width:100%}.control-deck{grid-template-columns:minmax(150px,.24fr) minmax(0,1fr);gap:12px;padding:14px;border:1px solid var(--divider-color);border-radius:18px;background:var(--room-surface);box-shadow:0 1px 2px rgb(20 35 28/.06),0 7px 24px rgb(20 35 28/.035);overflow:hidden}.capability-rail{display:grid;gap:7px;align-content:start}.capability-rail button,.detail-tabs button{min-height:44px;border:1px solid var(--divider-color);border-radius:11px;padding:9px 12px;background:var(--room-surface);color:var(--primary-text-color);font:inherit;text-align:left}.capability-rail button[aria-selected=true],.detail-tabs button[aria-selected=true]{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,var(--room-surface));color:var(--primary-color);font-weight:700}.deck-content{display:grid;gap:12px;min-width:0}.detail-tabs{display:flex;gap:7px;overflow-x:auto}.detail-tabs button{flex:1 0 auto;text-align:center}.detail-panel[hidden]{display:none}.room-layout-primary{grid-template-columns:1.2fr .8fr .7fr}.group{gap:10px}.group-heading{min-height:32px;display:flex;align-items:center}.details-card{display:grid}
      .info-list,.mushroom-grid,.plug-grid,.energy-grid,.group-grid,.device-grid,.cover-grid,.comfort-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:9px}.energy-period{display:grid;gap:10px}.period-selector{display:flex;gap:7px;flex-wrap:wrap}.period-selector button{min-height:44px;padding:8px 13px;border:1px solid var(--divider-color);border-radius:999px;background:var(--room-surface);color:inherit}.period-selector button[aria-pressed=true]{border-color:var(--primary-color);background:var(--primary-color);color:var(--text-primary-color,#fff);font-weight:700}.energy-comparison{display:grid;gap:9px;margin:0;padding:12px;border:1px solid var(--divider-color);border-radius:12px;background:var(--room-surface)}.energy-comparison figcaption{font-weight:700}.energy-bars{display:grid;gap:8px}.energy-bar-row{display:grid;grid-template-columns:minmax(90px,.7fr) minmax(100px,1.4fr) auto;gap:8px;align-items:center}.energy-bar-track{height:12px;border-radius:999px;background:var(--secondary-background-color);overflow:hidden}.energy-bar{display:block;width:var(--energy-share);height:100%;border-radius:inherit;background:var(--primary-color)}.energy-bar-value{font-variant-numeric:tabular-nums}.stat-chart{display:grid;gap:9px;margin:0;padding:12px;border:1px solid var(--divider-color);border-radius:12px;background:var(--room-surface)}.stat-chart figcaption{font-weight:700}.stat-chart-scale{display:flex;flex-direction:column;justify-content:space-between;height:140px;color:var(--secondary-text-color);font-size:.74rem;font-variant-numeric:tabular-nums;text-align:right}.stat-chart-bars{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(26px,1fr);gap:7px;align-items:end;height:140px;padding-bottom:18px;border-bottom:1px solid var(--divider-color)}.stat-chart-column{position:relative;align-self:end}.stat-chart-stack{display:flex;flex-direction:column-reverse;min-height:2px;border-radius:5px 5px 2px 2px;overflow:hidden}.stat-chart-segment{display:block;width:100%;min-height:2px;height:var(--stat-height);background:var(--stat-color)}.stat-chart-segment-missing{background:repeating-linear-gradient(135deg,var(--stat-color) 0 3px,transparent 3px 6px);opacity:.55}.stat-chart-label{position:absolute;left:0;right:0;bottom:-18px;color:var(--secondary-text-color);font-size:.68rem;text-align:center}.stat-chart-legend{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}.stat-chart-legend-item{display:inline-flex;align-items:center;gap:5px;color:var(--secondary-text-color);font-size:.74rem}.stat-chart-legend-dot{width:8px;height:8px;border-radius:3px;background:var(--stat-color)}.energy-ranking{display:grid;gap:9px;margin:0;padding:12px;border:1px solid var(--divider-color);border-radius:12px;background:var(--room-surface)}.energy-ranking figcaption{font-weight:700}.action-feedback{margin:0;padding:10px 12px;border:1px solid var(--divider-color);border-radius:12px;background:var(--room-surface)}.action-feedback.pending{border-color:var(--primary-color)}.action-feedback.success{border-color:var(--success-color,#2e7d32)}.action-feedback.error{border-color:var(--error-color,#b3261e)}
      .info,.state-badge,.mushroom-card,.command,.plug-lock{background:var(--room-surface);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:12px;padding:10px;font:inherit;overflow-wrap:anywhere}.info,.state-badge,.mushroom-card{text-align:left}.warning{border-color:var(--error-color,#b3261e)}.unavailable{opacity:.72}
      button{cursor:pointer;min-height:44px;min-width:44px}button:disabled{cursor:default;opacity:.48;background:var(--secondary-background-color)}button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}.mushroom-card{display:grid;grid-template-columns:40px minmax(0,1fr);gap:10px;align-items:center;min-height:76px;padding:12px;border-radius:16px}.light-card.active,.light-group-card.active{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,var(--room-surface))}.light-group-card.mixed{border-color:color-mix(in srgb,var(--primary-color) 45%,var(--divider-color));background:color-mix(in srgb,var(--primary-color) 5%,var(--room-surface))}.mushroom-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--secondary-background-color);color:var(--primary-color)}.mushroom-copy{display:grid;gap:2px}small{color:var(--secondary-text-color)}.commands{grid-column:1/-1}.smart-plug-card{grid-template-columns:minmax(0,1fr)}.smart-plug-card.active{border-color:var(--primary-color)}.plug-lock{color:var(--primary-color);font-weight:700}
      .room-photo{width:110px;min-height:96px;border-radius:16px;background:linear-gradient(135deg,#ffffff33,transparent),var(--hd-hero);background-size:cover;background-position:center;flex:none;display:grid;place-items:center;gap:4px;padding:8px;box-sizing:border-box;text-align:center}.room-photo ha-icon{width:32px;height:32px;opacity:.85}.room-photo-caption{font-size:.68rem;opacity:.85}.embedded-card{min-height:120px}.embedded-card:empty::before{content:"Kaart wordt geladen…"}.stat-svg{width:100%;height:56px;display:block}.stat-line{fill:none;stroke:var(--primary-color);stroke-width:2}.stat-line-alt{fill:none;stroke:var(--error-color,#b3261e);stroke-width:2}
      .hero-pills{display:flex;flex-wrap:wrap;gap:8px}.hero-pill{padding:4px 10px;border-radius:999px;background:#ffffff26;font-size:.78rem;font-weight:600}
      .deck-title{display:grid;gap:2px}
      .stage-head{align-items:flex-start}
      .capability-rail button{display:flex;gap:10px;align-items:center}
      .stage{padding:6px}.stage-body{gap:14px}.section-heading{display:flex;align-items:baseline;justify-content:space-between;gap:10px}.section-heading h4{margin:0;font-size:.95rem}.section-heading span{color:var(--secondary-text-color);font-size:.78rem}
      .summary-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--divider-color);border-radius:14px;overflow:hidden;background:var(--room-surface)}.summary-metric{min-height:70px;display:grid;align-content:center;gap:2px;padding:10px 12px;border-right:1px solid var(--divider-color)}.summary-metric:last-child{border-right:0}.summary-metric strong{font-size:1.05rem;font-variant-numeric:tabular-nums}.summary-metric span{color:var(--secondary-text-color);font-size:.72rem}
      .light-card-wrapper{display:grid;gap:8px}.range-row{display:grid;grid-template-columns:auto minmax(0,1fr) 42px;gap:9px;align-items:center}.range-row label,.range-row output{color:var(--secondary-text-color);font-size:.75rem;font-weight:680}input[type="range"]{width:100%;min-height:44px;accent-color:var(--primary-color)}
      .position-track{height:8px;overflow:hidden;border-radius:999px;background:var(--secondary-background-color)}.position-fill{height:100%;border-radius:inherit;background:var(--primary-color)}
      .plug-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));overflow:hidden;border:1px solid var(--divider-color);border-radius:10px}.plug-metric{padding:7px;border-right:1px solid var(--divider-color)}.plug-metric:last-child{border-right:0}.plug-metric strong,.plug-metric span{display:block}.plug-metric strong{font-size:.82rem;font-variant-numeric:tabular-nums}.plug-metric span{color:var(--secondary-text-color);font-size:.64rem}
      .comfort-card{display:grid;gap:8px}
      @media(max-width:1100px){.control-deck{grid-template-columns:1fr}.capability-rail{display:flex;overflow-x:auto}.capability-rail button{flex:0 0 auto}.room-layout-primary{grid-template-columns:1fr 1fr}.operations{grid-column:1/-1}.energy{grid-column:auto}}@media(max-width:600px){.hero{align-items:flex-start;flex-direction:column}.room-photo{width:100%;min-height:130px;order:-1}.detail-tabs button{min-width:max-content}.room-layout-primary{grid-template-columns:1fr}.operations,.energy{grid-column:auto}.mushroom-grid,.plug-grid{grid-template-columns:1fr}.cover-grid,.comfort-grid,.group-grid,.device-grid,.summary-strip{grid-template-columns:1fr}.energy-bar-row{grid-template-columns:minmax(90px,1fr) 1.2fr}.energy-bar-value{grid-column:1/-1}}
    `;
    const root = element("main", "detail");
    const hero = element("section", "hero");
    const heroCopy = element("div", "hero-copy");
    const floorName = lookupFloorName(this.currentHass, room.floor_id);
    const eyebrow = element("span", "eyebrow", floorName ? `Kamer · ${floorName}` : "Kamer");
    const title = element("h1", "", room.name);
    heroCopy.append(eyebrow, title);
    const heroPills = element("div", "hero-pills");
    heroPills.append(...this.heroPills(room));
    hero.append(heroCopy, heroPills);
    const photo = element("div", "room-photo");
    this.paintPhoto(photo, room);
    this.loadRoomPhoto(room);
    hero.append(photo);
    root.append(hero);
    [...this.actionFeedback.values()].sort((left, right) => left.sequence - right.sequence).forEach((entry) => {
      const feedback = element("p", `action-feedback ${entry.tone}`, entry.message);
      feedback.setAttribute("role", entry.tone === "error" ? "alert" : "status");
      feedback.setAttribute("aria-live", entry.tone === "error" ? "assertive" : "polite");
      root.append(feedback);
    });

    const hasEnergy = Boolean(room.room_energy && Object.values(room.room_energy).some(Boolean)) || (room.smart_plugs ?? []).some((plug) => plug.energy_day_entity || plug.energy_month_entity || plug.energy_year_entity);
    const hasLighting = room.light_entities.length > 0 || (room.light_switch_entities?.length ?? 0) > 0 || (room.light_groups?.length ?? 0) > 0;
    const hasCovers = room.cover_entities.length > 0 || (room.cover_controls?.length ?? 0) > 0;
    const hasComfort = Boolean(room.hvac.entity) || room.hvac.comfort_entities.length > 0 || room.media_entities.length > 0 || room.safety_entities.length > 0 || room.camera_entities.length > 0 || Boolean(room.desk && Object.keys(room.desk.card_config).length > 0);
    const hasPlugs = (room.smart_plugs?.length ?? 0) > 0;
    const hasEnergyStage = hasEnergy || room.power_entities.length > 0;
    const isAwningRoom = (room.cover_controls ?? []).some((coverConfig) => coverConfig.kind === "awning");
    const railDefinitions: Array<[RoomCapabilityStage, string, boolean, string]> = [
      ["lighting", "Verlichting", hasLighting, "mdi:lightbulb-group-outline"],
      ["covers", isAwningRoom ? "Luifel & screens" : "Rolluiken", hasCovers, "mdi:window-shutter"],
      ["comfort", "Comfort", hasComfort, "mdi:thermostat"],
      ["plugs", "Smart plugs", hasPlugs, "mdi:power-plug-outline"],
      ["energy", "Verbruik", hasEnergyStage, "mdi:gauge"]
    ];
    const configuredCapabilities = railDefinitions.filter(([, , configured]) => configured).map(([key]) => key);
    if (!this.selectedCapability || !configuredCapabilities.includes(this.selectedCapability)) this.selectedCapability = configuredCapabilities[0];

    const lightCount = individualLightEntities(room).length;
    const coverCount = room.cover_entities.length;
    const plugCount = room.smart_plugs?.length ?? 0;
    const countParts: string[] = [];
    if (lightCount > 0) countParts.push(`${lightCount} lamp${lightCount === 1 ? "" : "en"}`);
    if (coverCount > 0) countParts.push(`${coverCount} opening${coverCount === 1 ? "" : "en"}`);
    if (plugCount > 0) countParts.push(`${plugCount} plug${plugCount === 1 ? "" : "s"}`);
    // Only render the deck-head when at least one capability is configured; otherwise there is nothing to count
    // and the header would show an empty, dangling label.
    if (configuredCapabilities.length > 0) {
      const deckHead = element("header", "section-heading deck-head");
      const deckTitle = element("div", "deck-title");
      deckTitle.append(element("span", "eyebrow", "Control Deck"), element("strong", "", `${room.name} · individuele bediening`));
      deckHead.append(deckTitle);
      // A comfort-/energie-only room has nothing countParts covers (no lamps/openings/plugs), so omit the trailing
      // count span rather than render an empty, dangling label — never fabricate a count for an uncounted capability.
      if (countParts.length > 0) deckHead.append(element("span", "", countParts.join(" · ")));
      root.append(deckHead);
    }

    const deck = element("section", "control-deck");
    const rail = element("nav", "capability-rail");
    rail.setAttribute("aria-label", "Kamerfuncties");
    rail.setAttribute("role", "tablist");
    railDefinitions.filter(([, , configured]) => configured).forEach(([key, label, , railIcon]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.id = `room-rail-${room.key}-${key}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(this.selectedCapability === key));
      button.setAttribute("aria-controls", `room-stage-${room.key}`);
      button.tabIndex = this.selectedCapability === key ? 0 : -1;
      const capIcon = element("span", "mushroom-icon"); capIcon.append(icon(railIcon));
      const capCopy = element("span", "mushroom-copy");
      const capSummary = this.capabilitySummary(room, key);
      capCopy.append(element("strong", "", label));
      if (capSummary) capCopy.append(element("small", "", capSummary));
      button.append(capIcon, capCopy);
      button.dataset.controlKey = `capability:${key}`;
      button.addEventListener("click", () => { this.selectedCapability = key; this.render(true); });
      button.addEventListener("keydown", (event) => this.handleRovingKeydown(event, configuredCapabilities, key, (next) => { this.selectedCapability = next as RoomCapabilityStage; }, (next) => `[data-control-key="capability:${next}"]`));
      rail.append(button);
    });
    const stage = element("div", "stage");
    stage.id = `room-stage-${room.key}`;
    stage.setAttribute("role", "tabpanel");
    if (this.selectedCapability) {
      stage.setAttribute("aria-labelledby", `room-rail-${room.key}-${this.selectedCapability}`);
      const stageContent = this.selectedCapability === "lighting" ? this.lightingStage(room)
        : this.selectedCapability === "covers" ? this.coversStage(room)
          : this.selectedCapability === "comfort" ? this.comfortStage(room)
            : this.selectedCapability === "plugs" ? this.plugsStage(room)
              : this.energyStage(room);
      const activeLabel = railDefinitions.find(([key]) => key === this.selectedCapability)?.[1] ?? "";
      stage.append(...this.stageHead(room, this.selectedCapability, activeLabel), stageContent);
    } else {
      stage.append(element("p", "info unavailable", "Geen functies geconfigureerd voor deze kamer."));
    }
    deck.append(rail, stage);
    root.append(deck);

    const detailsCard = element("section", "details-card");
    const deckContent = element("div", "deck-content");
    const tabs = element("div", "detail-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Kamerdetails");
    const tabDefinitions = [["devices", "Apparaten"], ["energy", "Energie"], ["history", "Historie"]] as const;
    const panels = new Map<(typeof tabDefinitions)[number][0], HTMLElement>();
    const tabKeys = tabDefinitions.map(([key]) => key);
    tabDefinitions.forEach(([key, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.id = `room-tab-${room.key}-${key}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(this.activeDetailTab === key));
      button.setAttribute("aria-controls", `room-panel-${room.key}-${key}`);
      button.tabIndex = this.activeDetailTab === key ? 0 : -1;
      button.textContent = label;
      button.dataset.controlKey = `tab:${key}`;
      button.addEventListener("click", () => { this.activeDetailTab = key; this.render(true); });
      button.addEventListener("keydown", (event) => this.handleRovingKeydown(event, tabKeys, key, (next) => { this.activeDetailTab = next as typeof this.activeDetailTab; }, (next) => `[data-control-key="tab:${next}"]`));
      tabs.append(button);
      const panel = element("section", "detail-panel");
      panel.id = `room-panel-${room.key}-${key}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.hidden = this.activeDetailTab !== key;
      panels.set(key, panel);
    });

    const energy = element("div", "room-column energy");
    const periodEnergy = this.energyPeriodGroup(room);
    if (periodEnergy) energy.append(periodEnergy);
    // HD-220: this legacy details-tab panel never rendered energyStatisticsChart()'s heavier statistics-
    // backed chart, but it did show the now-removed Apparaatvergelijking comparison -- "Grootste
    // verbruikers" is a cheap, current-state-only replacement (no statistics cache dependency) so this
    // panel keeps a device comparison instead of losing one entirely.
    const legacyPeriodLabel = this.activeEnergyPeriod === "day" ? "dag" : this.activeEnergyPeriod === "month" ? "maand" : "jaar";
    const legacyRanking = this.topConsumersCard(room, this.activeEnergyPeriod, legacyPeriodLabel);
    if (legacyRanking) energy.append(legacyRanking);
    panels.get("history")?.append(this.historyPanel(room));

    if ((room.smart_plugs?.length ?? 0) > 0) {
      const list = element("div", "info-list");
      room.smart_plugs?.forEach((plug) => {
        const plugState = this.currentHass?.states?.[plug.switch_entity];
        const row = element("div", plug.protected ? "info protected-plug-row" : "info");
        const detail = plug.power_entity ? stateText(this.currentHass?.states?.[plug.power_entity]) : stateText(plugState);
        row.textContent = `${plug.name || friendlyName(plugState, "Smart plug")} · ${detail}`;
        list.append(row);
      });
      panels.get("devices")?.append(group("Smart plugs & energie", list));
    }

    if (energy.childElementCount) panels.get("energy")?.append(energy);
    for (const [key, panel] of panels) {
      if (!panel.childElementCount) panel.append(element("p", "info unavailable", "Geen gegevens voor dit onderdeel geconfigureerd."));
    }
    deckContent.append(tabs, ...panels.values());
    detailsCard.append(deckContent);
    root.append(detailsCard);
    const previous = this.shadowRoot.querySelector("main");
    if (previous) { previous.replaceWith(root); this.shadowRoot.querySelector("style")?.replaceWith(style); }
    else this.shadowRoot.replaceChildren(style, root);
    if (focusKey) Array.from(this.shadowRoot.querySelectorAll<HTMLElement>("[data-control-key]")).find(control => control.dataset.controlKey === focusKey)?.focus();
  }

  private handleRovingKeydown(event: KeyboardEvent, keys: readonly string[], current: string, apply: (next: string) => void, focusSelector: (next: string) => string): void {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = keys.indexOf(current);
    const target = event.key === "Home" ? 0 : event.key === "End" ? keys.length - 1 : (index + (event.key === "ArrowLeft" ? -1 : 1) + keys.length) % keys.length;
    const nextKey = keys[target]!;
    apply(nextKey);
    this.render();
    this.shadowRoot?.querySelector<HTMLElement>(focusSelector(nextKey))?.focus();
  }
}

export function registerHomeDashboardRoomCards(): void {
  if (typeof customElements === "undefined" || typeof window === "undefined") return;
  const cards: Array<[string, CustomElementConstructor, string, string]> = [
    ["home-dashboard-room-overview", HomeDashboardRoomOverview, "Home Dashboard Room Overview", "Verdiepingsgewijs kameroverzicht met compacte statuskaarten."],
    ["home-dashboard-room-detail", HomeDashboardRoomDetail, "Home Dashboard Room Detail", "Kamerdetail met directe bediening en status."]
  ];
  window.customCards ??= [];
  for (const [tag, constructor, name, description] of cards) {
    if (!customElements.get(tag)) customElements.define(tag, constructor);
    if (!window.customCards.some((card) => card.type === tag)) window.customCards.push({ type: tag, name, description, preview: true });
  }
}
