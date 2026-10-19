export const meta = {
  name: 'home-dashboard-discover-domain',
  description: 'Discover HA entities, reference repo patterns and existing code for a specialist domain',
  phases: [
    { title: 'HA & Reference Discovery' },
    { title: 'Synthesis' },
  ],
}

// args.domain: 'kia' | 'robot' | 'garden' | 'pool'
const domain = args?.domain
if (!domain || !['kia', 'robot', 'garden', 'pool'].includes(domain)) {
  throw new Error('args.domain required: kia | robot | garden | pool')
}

const DOMAIN_META = {
  kia: {
    search_queries: ['kia', 'kia_uvo', 'kia connect', 'ev', 'electric vehicle'],
    reference_repo_url: 'https://github.com/ju1ced/ha-kia-connect-dashboard',
    reference_readme_url: 'https://raw.githubusercontent.com/ju1ced/ha-kia-connect-dashboard/main/README.md',
    label: 'Kia EV',
    icon: 'mdi:car-electric',
    nav_label: 'Auto',
  },
  robot: {
    search_queries: ['vacuum', 'ecovacs', 'deebot', 'robot', 'clean'],
    reference_repo_url: 'https://github.com/ju1ced/robot-vacuum-dashboard',
    reference_readme_url: 'https://raw.githubusercontent.com/ju1ced/robot-vacuum-dashboard/main/README.md',
    label: 'Robot Vacuum',
    icon: 'mdi:robot-vacuum',
    nav_label: 'Robot',
  },
  garden: {
    search_queries: ['garden', 'irrigation', 'soil', 'plant', 'moisture', 'sprinkler', 'watering'],
    reference_repo_url: 'https://github.com/ju1ced/garden-dashboard',
    reference_readme_url: 'https://raw.githubusercontent.com/ju1ced/garden-dashboard/main/README.md',
    label: 'Garden',
    icon: 'mdi:flower',
    nav_label: 'Tuin',
  },
  pool: {
    search_queries: ['pool', 'zwembad', 'water_quality', 'chlorine', 'ph', 'filter'],
    reference_repo_url: null,
    reference_readme_url: null,
    label: 'Pool',
    icon: 'mdi:pool',
    nav_label: 'Zwembad',
  },
}

const cfg = DOMAIN_META[domain]

const ENTITIES_SCHEMA = {
  type: 'object',
  required: ['entity_groups', 'available', 'summary', 'notable_states'],
  properties: {
    entity_groups: {
      type: 'array',
      items: {
        type: 'object',
        required: ['group_name', 'description', 'entity_count', 'example_attributes', 'states_observed'],
        properties: {
          group_name: { type: 'string' },
          description: { type: 'string' },
          entity_count: { type: 'number' },
          example_attributes: { type: 'array', items: { type: 'string' } },
          states_observed: { type: 'array', items: { type: 'string' } },
          warning_relevant: { type: 'boolean' },
        },
      },
    },
    available: { type: 'boolean' },
    summary: { type: 'string' },
    notable_states: {
      type: 'array',
      items: { type: 'string' },
      description: 'States that warrant surfacing a summary tile on the home view',
    },
  },
}

const REFERENCE_SCHEMA = {
  type: 'object',
  required: ['card_type', 'configuration_keys', 'ux_patterns', 'summary'],
  properties: {
    card_type: { type: 'string', description: 'The custom card element name, e.g. custom:kia-connect-card' },
    configuration_keys: { type: 'array', items: { type: 'string' } },
    ux_patterns: { type: 'array', items: { type: 'string' } },
    notable_states: { type: 'array', items: { type: 'string' } },
    summary_card_approach: { type: 'string' },
    hacs_repo_identifier: { type: 'string' },
    minimum_version: { type: 'string' },
    summary: { type: 'string' },
  },
}

const EXISTING_PATTERNS_SCHEMA = {
  type: 'object',
  required: ['specialist_config_type', 'view_dispatch_pattern', 'card_registration_pattern', 'navigation_pattern', 'shadow_dom_pattern'],
  properties: {
    specialist_config_type: { type: 'string', description: 'TypeScript code for SpecialistConfig interface' },
    view_dispatch_pattern: { type: 'string', description: 'How strategy.ts dispatches to specialist views, with code example' },
    card_registration_pattern: { type: 'string', description: 'How new cards are registered in index.ts, with code example' },
    navigation_pattern: { type: 'string', description: 'How domain navigation buttons work, with navigationButton() call example' },
    shadow_dom_pattern: { type: 'string', description: 'Template for a custom element using shadow DOM (from energy-domain-cards.ts)' },
    files_for_implementation: { type: 'array', items: { type: 'string' }, description: 'Files that must be read/modified to add a specialist domain' },
  },
}

phase('HA & Reference Discovery')

const [haDiscovery, referenceResearch, existingPatterns] = await parallel([
  () => agent(
    `You are discovering Home Assistant entities for the "${cfg.label}" domain to inform home-dashboard development.

Use ToolSearch to load these HA MCP tool schemas before calling them:
  mcp__home-assistant__ha_search
  mcp__home-assistant__ha_get_entity

Search for entities related to these terms (try each): ${cfg.search_queries.join(', ')}

For each group of entities found, report:
- Entity domain (sensor, binary_sensor, switch, select, etc.)
- Attribute NAMES (not values) that could be useful (e.g., "battery_level", "charging_status")
- Which states indicate a warning, active, or error condition
- How many entities of each type exist

PRIVACY RULES — mandatory:
- Do NOT include real entity IDs or unique device identifiers in your output
- Use descriptive role names: "battery state-of-charge sensor" not "sensor.kia_abc123_battery"
- Do NOT include real person names, addresses, coordinates or device serials

If no entities are found for this domain, set available=false and explain what you searched.
Report notable_states: states that should trigger a summary tile on the home overview view.`,
    { schema: ENTITIES_SCHEMA, label: 'ha-entity-discovery', phase: 'HA & Reference Discovery' }
  ),

  () => cfg.reference_readme_url
    ? agent(
        `Research the ${cfg.label} reference dashboard to extract card patterns for the home-dashboard project.

Fetch and read:
  ${cfg.reference_readme_url}

Also try fetching the main source/entry file from:
  ${cfg.reference_repo_url}

Extract:
1. The exact custom card element type string (e.g. "custom:kia-connect-card") — critical
2. Required configuration keys for the card
3. UX patterns: how does it show status, errors, charging, activity?
4. What states does it surface as notable?
5. HACS repository identifier and minimum supported version
6. How does it handle unavailable/stale/missing data?

The goal is to understand exactly how to wrap this card in the home-dashboard specialist view.`,
        { schema: REFERENCE_SCHEMA, label: 'reference-research', phase: 'HA & Reference Discovery' }
      )
    : Promise.resolve({
        card_type: `custom:${domain}-card`,
        configuration_keys: [],
        ux_patterns: ['No reference repository available — custom implementation required'],
        notable_states: [],
        summary_card_approach: 'Custom implementation required from scratch',
        hacs_repo_identifier: '',
        minimum_version: '',
        summary: `No reference repository available for ${domain}`,
      }),

  () => agent(
    `Read the home-dashboard TypeScript source to understand the patterns needed when adding a new specialist domain.

Read these files carefully:
  /projects/home-dashboard/src/config/types.ts
  /projects/home-dashboard/src/strategy/home-dashboard-strategy.ts
  /projects/home-dashboard/src/strategy/home-dashboard-view-strategy.ts
  /projects/home-dashboard/src/cards/home-dashboard-energy-domain-cards.ts
  /projects/home-dashboard/src/index.ts

Extract the following as actual code snippets:
1. The SpecialistConfig TypeScript interface (from types.ts)
2. How createViewStrategy() dispatches view paths — show the if/else chain including what "more" view returns
3. How customElements.define() and register functions work in index.ts
4. The navigationButton() function signature and a call example
5. A complete custom element class skeleton using shadow DOM (model on HomeDashboardEnergyOverview)
6. List of files that must be created or modified to add a new specialist domain

Return actual code, not descriptions.`,
    { schema: EXISTING_PATTERNS_SCHEMA, label: 'existing-code-patterns', phase: 'HA & Reference Discovery' }
  ),
])

phase('Synthesis')

const SYNTHESIS_SCHEMA = {
  type: 'object',
  required: ['domain', 'ready_to_implement', 'implementation_brief'],
  properties: {
    domain: { type: 'string' },
    ready_to_implement: { type: 'boolean' },
    blocker: { type: 'string' },
    card_type: { type: 'string' },
    view_path: { type: 'string' },
    entity_summary: { type: 'string' },
    notable_states: { type: 'array', items: { type: 'string' } },
    files_to_create: { type: 'array', items: { type: 'string' } },
    files_to_modify: { type: 'array', items: { type: 'string' } },
    implementation_brief: { type: 'string', description: 'Detailed brief the implementation agent can follow verbatim' },
  },
}

const synthesis = await agent(
  `Synthesize discovery results for the "${domain}" specialist domain and write an implementation brief for home-dashboard.

HA entity discovery: ${JSON.stringify(haDiscovery)}
Reference repo research: ${JSON.stringify(referenceResearch)}
Existing project patterns: ${JSON.stringify(existingPatterns)}

The home-dashboard is a HACS custom Lovelace dashboard strategy written in TypeScript.
It wraps external specialist cards using SpecialistConfig. The view path convention is "specialist-${domain}".

Write a detailed implementation brief covering:

1. FILES TO CREATE
   - src/cards/home-dashboard-specialist-${domain}.ts
     * A custom element class following the same shadow DOM pattern as HomeDashboardEnergyOverview
     * Must handle three states: (a) specialist card installed — show full card; (b) specialist not installed — show HACS install instructions; (c) entity unavailable — show stale/unavailable state
     * Must also expose a buildSpecialist${domain[0].toUpperCase() + domain.slice(1)}Sections() export for the view strategy

2. FILES TO MODIFY
   - src/strategy/home-dashboard-strategy.ts: add specialist-${domain} subview creation
   - src/strategy/home-dashboard-view-strategy.ts: dispatch "specialist-${domain}" view to the new card
   - src/cards/home-dashboard-energy-domain-cards.ts: update navigation button path from "more" to "specialist-${domain}"
   - src/index.ts: register the new custom element

3. TYPESCRIPT SPEC
   Include exact interface shapes, class skeletons with key methods (setConfig, set hass, render, getCardSize), and function signatures.
   All entity references must use SpecialistConfig.mapping_keys — no hardcoded entity IDs.

4. HACS RESOURCE CHECK
   The specialist card (${referenceResearch?.card_type || 'unknown'}) must be verified as loaded before use.
   Show HACS install guidance when missing.

Determine ready_to_implement: true unless there is a fundamental gap in the discovery (e.g., no card_type known and no reference).
If the card_type is unknown, set blocker to explain what must be determined first.`,
  { schema: SYNTHESIS_SCHEMA, label: 'synthesis', phase: 'Synthesis' }
)

return synthesis
