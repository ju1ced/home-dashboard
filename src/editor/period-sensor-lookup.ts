/**
 * HD-217: a room's smart-plug energy sensor often already has day/month/year `utility_meter`
 * helpers in Home Assistant, but their entity IDs follow no naming convention derived from the
 * device itself -- only the helper's own `source` option gives a reliable answer. This looks
 * that up via the native `config_entries`/entity-registry websocket API (no extra HA component
 * required), entirely client-side within the editor.
 *
 * `hass.callWS` is optional on this project's minimal `HomeAssistantLike` contract (only `states`
 * is guaranteed); every path here degrades to `null` -- no lookup, no suggestion, no error -- when
 * it is absent or the call fails, so existing embeddings and tests are unaffected.
 */

export interface HomeAssistantWithCallWS {
  callWS?: (message: Record<string, unknown>) => Promise<unknown>;
}

export interface PeriodSensorMatch {
  day?: string;
  month?: string;
  year?: string;
}

interface UtilityMeterConfigEntry {
  entry_id: string;
  domain: string;
  options?: { source?: string; cycle?: string };
}

interface EntityRegistryEntry {
  entity_id: string;
  config_entry_id?: string | null;
}

const CYCLE_FIELDS: Record<"daily" | "monthly" | "yearly", keyof PeriodSensorMatch> = {
  daily: "day",
  monthly: "month",
  yearly: "year"
};

export async function lookupPeriodSensors(hass: HomeAssistantWithCallWS | undefined, energyEntityId: string): Promise<PeriodSensorMatch | null> {
  if (!hass?.callWS || !energyEntityId) return null;
  try {
    const [configEntries, entityEntries] = await Promise.all([
      hass.callWS({ type: "config_entries/get", domain: "utility_meter" }) as Promise<UtilityMeterConfigEntry[]>,
      hass.callWS({ type: "config/entity_registry/list" }) as Promise<EntityRegistryEntry[]>
    ]);
    const matchingEntries = (configEntries ?? []).filter((entry) => entry.domain === "utility_meter" && entry.options?.source === energyEntityId);
    const byCycle = new Map<string, UtilityMeterConfigEntry[]>();
    for (const entry of matchingEntries) {
      const cycle = entry.options?.cycle;
      if (!cycle) continue;
      (byCycle.get(cycle) ?? byCycle.set(cycle, []).get(cycle)!).push(entry);
    }
    const result: PeriodSensorMatch = {};
    for (const [cycle, field] of Object.entries(CYCLE_FIELDS) as Array<[string, keyof PeriodSensorMatch]>) {
      const entries = byCycle.get(cycle);
      // Exactly one candidate required: no helper found -> leave unmapped, more than one -> genuinely
      // ambiguous (shouldn't happen for a correctly configured utility_meter) -> never guess which.
      if (!entries || entries.length !== 1) continue;
      const registryMatch = (entityEntries ?? []).find((candidate) => candidate.config_entry_id === entries[0]!.entry_id);
      if (registryMatch) result[field] = registryMatch.entity_id;
    }
    return Object.keys(result).length ? result : null;
  } catch {
    return null;
  }
}
