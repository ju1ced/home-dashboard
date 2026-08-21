import type { CompiledConfigManifest, HomeDashboardConfigV1 } from "./types";
import { migrateConfig } from "./migrate";
import { validateConfig } from "./validate";
import { validateConfigSchema } from "./schema-validator";

export interface CompileResult {
  config: HomeDashboardConfigV1;
  manifest: CompiledConfigManifest;
}

export function compileConfig(input: unknown): CompileResult {
  const { config } = migrateConfig(input);
  const errors = [...validateConfigSchema(config), ...validateConfig(config)].filter((candidate) => candidate.severity === "error");
  if (errors.length) throw new Error(errors.map((candidate) => `${candidate.path}: ${candidate.message}`).join("\n"));

  const enabledSpecialists = Object.entries(config.specialists)
    .filter(([, specialist]) => specialist.enabled)
    .map(([key]) => key);
  const requiredCardTypes = Object.values(config.specialists)
    .filter((specialist) => specialist.enabled)
    .map((specialist) => specialist.card_type);

  return {
    config,
    manifest: {
      schema_version: config.schema_version,
      counts: {
        persons: config.persons.length,
        cameras: config.security.cameras.length,
        rooms: config.rooms.length,
        actions: config.actions.length
      },
      enabled_specialists: enabledSpecialists,
      required_card_types: requiredCardTypes
    }
  };
}

export function serializeConfig(config: HomeDashboardConfigV1): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

export function parseImportedConfig(source: string): HomeDashboardConfigV1 {
  const parsed: unknown = JSON.parse(source);
  if (typeof parsed === "object" && parsed !== null && (parsed as Record<string, unknown>).schema_version === 1) {
    const rawSchemaErrors = validateConfigSchema(parsed);
    if (rawSchemaErrors.length) throw new Error(rawSchemaErrors.map((candidate) => `${candidate.path}: ${candidate.message}`).join("\n"));
  }
  const migrated = migrateConfig(parsed).config;
  const errors = [...validateConfigSchema(migrated), ...validateConfig(migrated)].filter((candidate) => candidate.severity === "error");
  if (errors.length) throw new Error(errors.map((candidate) => `${candidate.path}: ${candidate.message}`).join("\n"));
  return migrated;
}
