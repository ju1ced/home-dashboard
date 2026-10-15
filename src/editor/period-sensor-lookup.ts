/**
 * HD-217: a room's smart-plug energy sensor often already has day/month/year `utility_meter`
 * helpers in Home Assistant, but their entity IDs follow no naming convention derived from the
 * device itself -- only the helper's own `source` option gives a reliable answer.
 *
 * HD-217 correction: the first version of this file assumed `hass.callWS({type:
 * "config_entries/get", ...})` would return each entry's `options` (its `source`/`cycle`). It
 * never does, for any integration -- confirmed against Home Assistant core's own
 * `ConfigEntry.as_json_fragment` (`homeassistant/config_entries.py`), which the `config_entries/get`
 * and `config_entries/get_single` websocket commands both serialize through. A browser client has
 * exactly one way to read a config entry's current options: start (and then always abort) an
 * OPTIONS FLOW over REST -- `POST /api/config/config_entries/options/flow` with `{handler:
 * entry_id}` returns a `data_schema` whose fields carry the entry's live values as
 * `description.suggested_value` (confirmed against `homeassistant/helpers/schema_config_entry_flow.py`,
 * which prefills exactly this way for any schema-based options flow, utility_meter included). This
 * is also exactly what the real Home Assistant frontend does to populate its own "edit helper"
 * dialog (`showOptionsFlowDialog` in `ha-config-helpers.ts`) -- there is no lighter alternative.
 *
 * Because this probe is per-entry (one REST round trip to open, read, and abort a flow), and a
 * single house can have 100+ `utility_meter` helpers (138, live-confirmed during HD-216's
 * promotion pass), probing on every "opzoeken"-click for every plug would be both slow and
 * needlessly heavy on the live config-entries flow manager. The full source -> {entryId, cycle}[]
 * map is therefore built ONCE per editor session and cached module-wide (`utilityMeterMapPromise`),
 * not per room/plug; a single probed set serves every lookup for the rest of that session.
 *
 * `hass.callWS`/`hass.callApi` are both optional on this project's minimal `HomeAssistantLike`
 * contract (only `states` is guaranteed); every path here degrades to `null` -- no lookup, no
 * suggestion, no error -- when either is absent or any call fails, so existing embeddings and
 * tests are unaffected.
 */

export interface HomeAssistantWithLookup {
  callWS?: (message: Record<string, unknown>) => Promise<unknown>;
  callApi?: <T = unknown>(method: "GET" | "POST" | "DELETE", path: string, data?: Record<string, unknown>) => Promise<T>;
}

export interface PeriodSensorMatch {
  day?: string;
  month?: string;
  year?: string;
}

interface ConfigEntrySummary {
  entry_id: string;
  domain: string;
}

interface EntityRegistryEntry {
  entity_id: string;
  config_entry_id?: string | null;
}

interface OptionsFlowSchemaField {
  name?: string;
  description?: { suggested_value?: unknown };
}

interface OptionsFlowStep {
  flow_id?: string;
  data_schema?: OptionsFlowSchemaField[];
}

const CYCLE_FIELDS: Record<"daily" | "monthly" | "yearly", keyof PeriodSensorMatch> = {
  daily: "day",
  monthly: "month",
  yearly: "year"
};

function suggestedString(fields: OptionsFlowSchemaField[], name: string): string | undefined {
  const value = fields.find((field) => field.name === name)?.description?.suggested_value;
  return typeof value === "string" ? value : undefined;
}

/** Opens, reads, and always aborts one options flow -- never leaves a flow dangling on the live
 * instance, win or lose. Returns `undefined` on any failure (missing `callApi`, a rejected
 * request, or a response the schema parse can't make sense of); callers treat that exactly like
 * "no match", never as an error to surface. */
async function probeUtilityMeterOptions(hass: HomeAssistantWithLookup, entryId: string): Promise<{ source: string | undefined; cycle: string | undefined } | undefined> {
  if (!hass.callApi) return undefined;
  let flowId: string | undefined;
  try {
    const step = await hass.callApi<OptionsFlowStep>("POST", "config/config_entries/options/flow", { handler: entryId });
    flowId = step.flow_id;
    const fields = step.data_schema ?? [];
    return { source: suggestedString(fields, "source"), cycle: suggestedString(fields, "cycle") };
  } catch {
    return undefined;
  } finally {
    if (flowId) {
      try { await hass.callApi?.("DELETE", `config/config_entries/options/flow/${flowId}`); } catch { /* best-effort cleanup only */ }
    }
  }
}

let utilityMeterMapPromise: Promise<Map<string, Array<{ entryId: string; cycle: string }>>> | undefined;

async function utilityMeterSourceMap(hass: HomeAssistantWithLookup): Promise<Map<string, Array<{ entryId: string; cycle: string }>>> {
  if (utilityMeterMapPromise) return utilityMeterMapPromise;
  const build = (async (): Promise<Map<string, Array<{ entryId: string; cycle: string }>>> => {
    if (!hass.callWS || !hass.callApi) return new Map();
    const entries = ((await hass.callWS({ type: "config_entries/get", domain: "utility_meter" })) as ConfigEntrySummary[] | undefined) ?? [];
    const probed = await Promise.all(entries.map(async (entry) => ({ entryId: entry.entry_id, options: await probeUtilityMeterOptions(hass, entry.entry_id) })));
    const map = new Map<string, Array<{ entryId: string; cycle: string }>>();
    for (const { entryId, options } of probed) {
      if (!options?.source || !options.cycle) continue;
      const list = map.get(options.source) ?? [];
      list.push({ entryId, cycle: options.cycle });
      map.set(options.source, list);
    }
    return map;
  })();
  // Never cache a rejection -- a transient failure (lost connection mid-probe) should retry on the
  // next lookup, not poison every later lookup for the rest of the session.
  utilityMeterMapPromise = build.catch((error) => {
    utilityMeterMapPromise = undefined;
    throw error;
  });
  return utilityMeterMapPromise;
}

/** Test-only: clears the module-wide cache so each test starts from a clean slate. Never called
 * from production code -- the whole point of the cache is that production never clears it mid-session. */
export function __resetUtilityMeterCacheForTests(): void {
  utilityMeterMapPromise = undefined;
}

export async function lookupPeriodSensors(hass: HomeAssistantWithLookup | undefined, energyEntityId: string): Promise<PeriodSensorMatch | null> {
  if (!hass?.callWS || !hass?.callApi || !energyEntityId) return null;
  try {
    const [map, entityEntries] = await Promise.all([
      utilityMeterSourceMap(hass),
      hass.callWS({ type: "config/entity_registry/list" }) as Promise<EntityRegistryEntry[] | undefined>
    ]);
    const matches = map.get(energyEntityId) ?? [];
    const byCycle = new Map<string, string[]>();
    for (const match of matches) {
      (byCycle.get(match.cycle) ?? byCycle.set(match.cycle, []).get(match.cycle)!).push(match.entryId);
    }
    const result: PeriodSensorMatch = {};
    for (const [cycle, field] of Object.entries(CYCLE_FIELDS) as Array<[string, keyof PeriodSensorMatch]>) {
      const candidates = byCycle.get(cycle);
      // Exactly one candidate required: no helper found -> leave unmapped, more than one -> genuinely
      // ambiguous (shouldn't happen for a correctly configured utility_meter) -> never guess which.
      if (!candidates || candidates.length !== 1) continue;
      const registryMatch = (entityEntries ?? []).find((candidate) => candidate.config_entry_id === candidates[0]);
      if (registryMatch) result[field] = registryMatch.entity_id;
    }
    return Object.keys(result).length ? result : null;
  } catch {
    return null;
  }
}
