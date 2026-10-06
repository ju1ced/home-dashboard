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

export function getEditorItemToken(collection: string, item: object, index: number): string {
  const key = (item as { key?: unknown }).key;
  return `${collection}:${typeof key === "string" && key.trim() ? key.trim() : `#${index}`}`;
}

export function getEditorSectionForKey(current: string, key: string): string {
  const currentIndex = Math.max(0, EDITOR_SECTION_KEYS.indexOf(current));
  if (key === "Home") return EDITOR_SECTION_KEYS[0] ?? "general";
  if (key === "End") return EDITOR_SECTION_KEYS.at(-1) ?? "general";
  const direction = ["ArrowLeft", "ArrowUp"].includes(key) ? -1 : ["ArrowRight", "ArrowDown"].includes(key) ? 1 : 0;
  return EDITOR_SECTION_KEYS[(currentIndex + direction + EDITOR_SECTION_KEYS.length) % EDITOR_SECTION_KEYS.length] ?? "general";
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
