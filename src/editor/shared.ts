import type { ValidationIssue } from "../config/types";

export const SECTION_TITLES: Record<string, string> = {
  general: "Algemeen",
  today: "Vandaag",
  persons: "Personen",
  security: "Security",
  rooms: "Kamers",
  energy: "Energie",
  actions: "Acties",
  specialists: "Kia, 3D-printer, robot, tuin en zwembad",
  layout: "Layout",
  diagnostics: "Diagnostiek"
};
export const EDITOR_SECTION_KEYS = Object.keys(SECTION_TITLES);
// HD-234: one icon tile per nav item -- the plain text-only list gave every section equal,
// unlabelled visual weight, with no relationship to the rest of the dashboard's visual language.
export const SECTION_ICONS: Record<string, string> = {
  general: "mdi:cog-outline",
  today: "mdi:weather-partly-cloudy",
  persons: "mdi:account-group-outline",
  security: "mdi:shield-home-outline",
  rooms: "mdi:floor-plan",
  energy: "mdi:lightning-bolt-outline",
  actions: "mdi:gesture-tap-button",
  specialists: "mdi:puzzle-outline",
  layout: "mdi:view-dashboard-outline",
  diagnostics: "mdi:stethoscope"
};

export function getEditorItemToken(collection: string, item: object, index: number): string {
  const key = (item as { key?: unknown }).key;
  return `${collection}:${typeof key === "string" && key.trim() ? key.trim() : `#${index}`}`;
}

/**
 * Shared arrow-key/Home/End navigation for any fixed, ordered set of tab-like keys -- the
 * top-level editor sections (EDITOR_SECTION_KEYS) and HD-235's per-room sub-tabs (ROOM_TAB_KEYS)
 * both use this instead of duplicating the same wrap-around index math.
 */
export function getAdjacentKey(keys: readonly string[], current: string, key: string): string {
  const currentIndex = Math.max(0, keys.indexOf(current));
  if (key === "Home") return keys[0] ?? current;
  if (key === "End") return keys.at(-1) ?? current;
  const direction = ["ArrowLeft", "ArrowUp"].includes(key) ? -1 : ["ArrowRight", "ArrowDown"].includes(key) ? 1 : 0;
  return keys[(currentIndex + direction + keys.length) % keys.length] ?? current;
}

export function getEditorSectionForKey(current: string, key: string): string {
  return getAdjacentKey(EDITOR_SECTION_KEYS, current, key) ?? "general";
}

// HD-235: a room's detail pane is split into the same labeled-tab pattern HD-234 introduced at the
// top editor-section level (icon-tagged nav items, one active underline), instead of inventing a
// second visual language just for rooms. Every existing room field keeps its current meaning,
// validation and stored shape -- this only changes which sub-tab a field's markup renders under.
export const ROOM_TAB_TITLES: Record<string, string> = {
  basis: "Basis",
  snelkoppelingen: "Snelkoppelingen",
  bronmappings: "Bronmappings",
  energie: "Energie",
  klimaat: "Klimaat"
};
export const ROOM_TAB_KEYS = Object.keys(ROOM_TAB_TITLES);
export const ROOM_TAB_ICONS: Record<string, string> = {
  basis: "mdi:information-outline",
  snelkoppelingen: "mdi:gesture-tap-button",
  bronmappings: "mdi:swap-horizontal-bold",
  energie: "mdi:lightning-bolt-outline",
  klimaat: "mdi:thermostat"
};
export function getRoomTabForKey(current: string, key: string): string {
  return getAdjacentKey(ROOM_TAB_KEYS, current, key) ?? "basis";
}

export function mergeEditorIssues(schemaIssues: ValidationIssue[], semanticIssues: ValidationIssue[]): ValidationIssue[] {
  const usefulSchemaIssues = schemaIssues.filter((schemaIssue) => schemaIssue.code !== "schema_any_of" || !semanticIssues.some((semanticIssue) =>
    semanticIssue.path === schemaIssue.path || semanticIssue.path.startsWith(`${schemaIssue.path}.`) || semanticIssue.path.startsWith(`${schemaIssue.path}[`)
  ));
  return [...usefulSchemaIssues, ...semanticIssues];
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderSelector(collection: string, index: number, field: string, value: unknown, selector: Record<string, unknown>): string {
  return `<ha-selector class="collection-selector" data-collection="${collection}" data-index="${index}" data-field="${field}" data-selector="${escapeHtml(JSON.stringify(selector))}" data-value="${escapeHtml(JSON.stringify(value))}"></ha-selector>`;
}
