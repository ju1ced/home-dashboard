import { registerHomeDashboardEditor } from "./home-dashboard-editor";

export { EDITOR_SECTION_KEYS, getEditorItemToken, getEditorSectionForKey, HomeDashboardStrategyEditor, mergeEditorIssues, registerHomeDashboardEditor } from "./home-dashboard-editor";
export { EDITOR_COVERAGE } from "./fields";

registerHomeDashboardEditor();
