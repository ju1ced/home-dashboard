import { registerRoomControls } from "./cards/home-dashboard-room-controls";
export { favoriteRooms, roomControlSources, planRoomControl, planEntityControl, executeRoomControl, executeEntityControl, HomeDashboardRoomControls } from "./cards/home-dashboard-room-controls";
declare const __HOME_DASHBOARD_VERSION__: string;

import { compileConfig, parseImportedConfig, serializeConfig } from "./config/compiler";
import { createDefaultConfig } from "./config/defaults";
import { migrateConfig } from "./config/migrate";
import { validateConfig } from "./config/validate";
import { validateConfigSchema } from "./config/schema-validator";
import { executeConfiguredAction, findPrivacyAction, getCameraPresentation, HomeDashboardCameraStrip, registerHomeDashboardCameraStrip } from "./cards/home-dashboard-camera-strip";
import { getHomeStructureSignature, getWastePresentation, HomeDashboardHomeOverview, registerHomeDashboardHomeOverview } from "./cards/home-dashboard-home-overview";
import { extractStatisticSeries, filterRoomLogbookEvents, getRoomMetric, HomeDashboardRoomDetail, HomeDashboardRoomOverview, registerHomeDashboardRoomCards, resolveLightGroupState, roomPath, temperatureHumidityEntities } from "./cards/home-dashboard-room-cards";
import { getKiaPresentation, HomeDashboardKiaSummary, registerHomeDashboardKiaIntegration } from "./cards/home-dashboard-kia-integration";
import { getPrinterPresentation, HomeDashboardPrinterSummary, printerStateKey, registerHomeDashboardPrinterIntegration } from "./cards/home-dashboard-printer-integration";
import { getPoolPresentation, HomeDashboardPoolSummary, registerHomeDashboardPoolIntegration } from "./cards/home-dashboard-pool-integration";
import { HomeDashboardStrategy, registerHomeDashboardStrategy } from "./strategy/home-dashboard-strategy";
import { buildView, HomeDashboardViewStrategy, registerHomeDashboardViewStrategy } from "./strategy/home-dashboard-view-strategy";

export { buildView, compileConfig, createDefaultConfig, executeConfiguredAction, extractStatisticSeries, filterRoomLogbookEvents, findPrivacyAction, getCameraPresentation, getHomeStructureSignature, getKiaPresentation, getPoolPresentation, getPrinterPresentation, getRoomMetric, getWastePresentation, HomeDashboardCameraStrip, HomeDashboardHomeOverview, HomeDashboardKiaSummary, HomeDashboardPoolSummary, HomeDashboardPrinterSummary, HomeDashboardRoomDetail, HomeDashboardRoomOverview, HomeDashboardStrategy, HomeDashboardViewStrategy, migrateConfig, parseImportedConfig, printerStateKey, resolveLightGroupState, roomPath, serializeConfig, temperatureHumidityEntities, validateConfig, validateConfigSchema };
export type { HomeDashboardConfigV1, ValidationIssue } from "./config/types";

export interface HomeDashboardBuildInfo {
  readonly name: "Home Dashboard";
  readonly version: string;
  readonly phase: "room-controls";
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
  phase: "room-controls",
  minimumHomeAssistant: "2026.8.2"
});

if (typeof window !== "undefined") {
  registerRoomControls();
  registerHomeDashboardCameraStrip();
  registerHomeDashboardHomeOverview();
  registerHomeDashboardRoomCards();
  registerHomeDashboardKiaIntegration();
  registerHomeDashboardPrinterIntegration();
  registerHomeDashboardPoolIntegration();
  registerHomeDashboardViewStrategy();
  registerHomeDashboardStrategy();
  window.__HOME_DASHBOARD_BUILD__ = buildInfo;
  console.info(
    "%c HOME DASHBOARD %c " + buildInfo.version,
    "color: white; background: #276b5b; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;",
    "color: #276b5b; background: #dcefe8; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;"
  );
}
