declare const __HOME_DASHBOARD_VERSION__: string;

import { compileConfig, parseImportedConfig, serializeConfig } from "./config/compiler";
import { createDefaultConfig } from "./config/defaults";
import { migrateConfig } from "./config/migrate";
import { validateConfig } from "./config/validate";
import { validateConfigSchema } from "./config/schema-validator";
import { getCameraPresentation, HomeDashboardCameraStrip, registerHomeDashboardCameraStrip } from "./cards/home-dashboard-camera-strip";
import { getHomeStructureSignature, getWastePresentation, HomeDashboardHomeOverview, registerHomeDashboardHomeOverview } from "./cards/home-dashboard-home-overview";
import { getRoomMetric, HomeDashboardRoomDetail, HomeDashboardRoomOverview, registerHomeDashboardRoomCards, roomPath } from "./cards/home-dashboard-room-cards";
import { EDITOR_COVERAGE } from "./editor/fields";
import { EDITOR_SECTION_KEYS, getEditorItemToken, getEditorSectionForKey, HomeDashboardStrategyEditor, mergeEditorIssues, registerHomeDashboardEditor } from "./editor/home-dashboard-editor";
import { HomeDashboardStrategy, registerHomeDashboardStrategy } from "./strategy/home-dashboard-strategy";
import { buildView, HomeDashboardViewStrategy, registerHomeDashboardViewStrategy } from "./strategy/home-dashboard-view-strategy";

export { buildView, compileConfig, createDefaultConfig, EDITOR_COVERAGE, EDITOR_SECTION_KEYS, getCameraPresentation, getEditorItemToken, getEditorSectionForKey, getHomeStructureSignature, getRoomMetric, getWastePresentation, HomeDashboardCameraStrip, HomeDashboardHomeOverview, HomeDashboardRoomDetail, HomeDashboardRoomOverview, HomeDashboardStrategy, HomeDashboardStrategyEditor, HomeDashboardViewStrategy, mergeEditorIssues, migrateConfig, parseImportedConfig, roomPath, serializeConfig, validateConfig, validateConfigSchema };
export type { HomeDashboardConfigV1, ValidationIssue } from "./config/types";

export interface HomeDashboardBuildInfo {
  readonly name: "Home Dashboard";
  readonly version: string;
  readonly phase: "energy-domains";
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
  phase: "energy-domains",
  minimumHomeAssistant: "2026.8.2"
});

if (typeof window !== "undefined") {
  registerHomeDashboardCameraStrip();
  registerHomeDashboardHomeOverview();
  registerHomeDashboardRoomCards();
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
