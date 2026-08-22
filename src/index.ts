declare const __HOME_DASHBOARD_VERSION__: string;

import { compileConfig, parseImportedConfig, serializeConfig } from "./config/compiler";
import { createDefaultConfig } from "./config/defaults";
import { migrateConfig } from "./config/migrate";
import { validateConfig } from "./config/validate";
import { validateConfigSchema } from "./config/schema-validator";
import { EDITOR_COVERAGE } from "./editor/fields";
import { EDITOR_SECTION_KEYS, getEditorItemToken, getEditorSectionForKey, HomeDashboardStrategyEditor, registerHomeDashboardEditor } from "./editor/home-dashboard-editor";
import { HomeDashboardStrategy, registerHomeDashboardStrategy } from "./strategy/home-dashboard-strategy";
import { buildView, HomeDashboardViewStrategy, registerHomeDashboardViewStrategy } from "./strategy/home-dashboard-view-strategy";

export { buildView, compileConfig, createDefaultConfig, EDITOR_COVERAGE, EDITOR_SECTION_KEYS, getEditorItemToken, getEditorSectionForKey, HomeDashboardStrategy, HomeDashboardStrategyEditor, HomeDashboardViewStrategy, migrateConfig, parseImportedConfig, serializeConfig, validateConfig, validateConfigSchema };
export type { HomeDashboardConfigV1, ValidationIssue } from "./config/types";

export interface HomeDashboardBuildInfo {
  readonly name: "Home Dashboard";
  readonly version: string;
  readonly phase: "shell";
  readonly minimumHomeAssistant: "2026.8.2";
}

declare global {
  interface Window {
    __HOME_DASHBOARD_BUILD__?: HomeDashboardBuildInfo;
  }
}

export const buildInfo: HomeDashboardBuildInfo = Object.freeze({
  name: "Home Dashboard",
  version: __HOME_DASHBOARD_VERSION__,
  phase: "shell",
  minimumHomeAssistant: "2026.8.2"
});

if (typeof window !== "undefined") {
  registerHomeDashboardEditor();
  registerHomeDashboardViewStrategy();
  registerHomeDashboardStrategy();
  window.__HOME_DASHBOARD_BUILD__ = buildInfo;
  console.info(
    "%c HOME DASHBOARD %c " + buildInfo.version,
    "color: white; background: #276b5b; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;",
    "color: #276b5b; background: #dcefe8; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;"
  );
}
