export const meta = {
  name: 'home-dashboard-review-pr',
  description: 'Adversarial multi-dimensional review of a home-dashboard specialist PR — correctness, architecture, UX, privacy',
  phases: [
    { title: 'Review' },
    { title: 'Verdict' },
  ],
}

// args: { branch, pr_number, domain, changed_files }
const branch = args?.branch
const prNumber = args?.pr_number
const domain = args?.domain
const changedFiles = args?.changed_files || []

if (!branch) throw new Error('args.branch required')

const FINDING_SCHEMA = {
  type: 'object',
  required: ['dimension', 'verdict', 'findings'],
  properties: {
    dimension: { type: 'string' },
    verdict: { type: 'string', enum: ['pass', 'warn', 'fail'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'description', 'location'],
        properties: {
          severity: { type: 'string', enum: ['blocking', 'warning', 'suggestion'] },
          description: { type: 'string' },
          location: { type: 'string', description: 'File path and line number if known' },
          fix: { type: 'string', description: 'Suggested fix' },
        },
      },
    },
  },
}

phase('Review')

// Read the diff once and share it across reviewers via the prompt
// Each reviewer reads the actual branch files using git show

const REVIEW_DIMENSIONS = [
  {
    key: 'correctness',
    label: 'Correctness & TypeScript',
    prompt: `Review the ${domain} specialist implementation for TypeScript correctness.

Read the changed files from git:
  git -C /projects/home-dashboard diff main...${branch}
  git -C /projects/home-dashboard show ${branch}:src/cards/home-dashboard-specialist-${domain}.ts 2>/dev/null || echo "file not found"

Also read the reference patterns:
  git -C /projects/home-dashboard show main:src/cards/home-dashboard-energy-domain-cards.ts
  git -C /projects/home-dashboard show main:src/config/types.ts

Check for:
- Type safety: are all function parameters and return types correctly typed?
- Null/undefined handling: does the card handle missing config, missing hass, unavailable entities?
- Custom element lifecycle: are connectedCallback, setConfig, set hass implemented correctly?
- Shadow DOM: is the shadow root created once and updated correctly on re-renders?
- View strategy wiring: is the new "specialist-${domain}" path handled in home-dashboard-strategy.ts?
- View strategy dispatch: is the new path dispatched to the correct card in home-dashboard-view-strategy.ts?
- Index registration: is the new custom element registered in index.ts?
- Resource check: does the card verify the specialist card (card_type) is loaded before using it?
- Fallback state: does unavailable/stale/missing produce a meaningful UI, not a crash?
- Export: is buildSpecialist${(domain || '').charAt(0).toUpperCase() + (domain || '').slice(1)}Sections() exported for the view?

Be adversarial. Mark any issue that would cause a runtime error as blocking.`,
  },
  {
    key: 'architecture',
    label: 'Architecture & Consistency',
    prompt: `Review the ${domain} specialist implementation for architectural consistency with the home-dashboard project.

Read:
  git -C /projects/home-dashboard diff main...${branch}

Also read for comparison:
  git -C /projects/home-dashboard show main:src/cards/home-dashboard-energy-domain-cards.ts
  git -C /projects/home-dashboard show main:src/strategy/home-dashboard-strategy.ts
  git -C /projects/home-dashboard show main:src/index.ts

Check for:
- Pattern consistency: does the new specialist card follow the same HTMLElement extension pattern as existing cards?
- Module boundaries: does the new file avoid importing from files it should not depend on?
- Code duplication: is any logic duplicated that already exists in a shared utility?
- Naming conventions: TypeScript identifiers, file names, CSS custom property names, MDI icon names
- Section building: does buildSpecialist${(domain || '').charAt(0).toUpperCase() + (domain || '').slice(1)}Sections() return LovelaceCardConfig[] consistently with buildEnergySections()?
- View path consistency: is "specialist-${domain}" used consistently across all files?
- Navigation: is the domains view navigation button updated to point to "specialist-${domain}" instead of "more"?
- No unnecessary abstractions: is the complexity proportional to what's needed?
- The specialist should feel like a natural part of the dashboard, not bolted on

Mark as fail if the new code introduces a pattern inconsistent with existing code without a documented reason.`,
  },
  {
    key: 'ux',
    label: 'UX, Responsiveness & Accessibility',
    prompt: `Review the ${domain} specialist implementation for UX quality, responsive behavior and accessibility.

Read:
  git -C /projects/home-dashboard diff main...${branch}
  git -C /projects/home-dashboard show ${branch}:src/cards/home-dashboard-specialist-${domain}.ts 2>/dev/null

Also read the existing UX reference:
  git -C /projects/home-dashboard show main:src/cards/home-dashboard-energy-domain-cards.ts

Check for:
- Touch targets: are all interactive elements at least 44×44px?
- Density modes: does the card work correctly in both "comfortable" and "compact" density?
- Light/dark theme: does the card use CSS custom properties for colors (not hardcoded hex)?
- Responsive layout: does the card avoid horizontal overflow at narrow viewports?
- Unavailable state: is the unavailable/not-installed state clearly communicated (not just an empty box)?
- Summary tile: does the home-view summary tile give useful at-a-glance info without being overwhelming?
- HACS install guidance: when the specialist card is not installed, is the HACS installation path clear?
- Consistent visual language: does the card use the same typography, spacing and icon style as other cards?
- Navigation: does the specialist view have a correct back_path for mobile navigation?
- Screen reader: are status indicators communicated via text, not just color or icon?

Mark as warning for suggestions; mark as fail only for UX issues that make the feature unusable on common devices.`,
  },
  {
    key: 'privacy',
    label: 'Privacy & Safety',
    prompt: `Review the ${domain} specialist implementation for privacy violations and safety issues.

Read:
  git -C /projects/home-dashboard diff main...${branch}

Check for PRIVACY violations (any of these is blocking):
- Hardcoded real Home Assistant entity IDs (e.g., sensor.kia_battery_abc123)
- Real device names, serial numbers, MAC addresses, or UUIDs
- Real person names, addresses, GPS coordinates, or location data
- Real API keys, tokens, or credentials
- Test fixtures containing real data (check config/examples/ if modified)

All entity references must go through SpecialistConfig.mapping_keys or card_type — never hardcoded.

Check for SAFETY issues:
- Are destructive actions (vehicle controls, irrigation triggers, pool chemical dosing) protected with confirmation guards?
- Does the card clearly indicate when it is performing a write/action vs. showing read-only state?
- Is there any code that auto-executes a service call without user interaction?

Mark any privacy violation as blocking. Mark missing confirmation guards for destructive actions as blocking.`,
  },
]

const reviews = await parallel(
  REVIEW_DIMENSIONS.map(dim => () => agent(
    `You are performing an adversarial code review of a home-dashboard pull request for the "${dim.label}" dimension.

PR: ${prNumber} — ${domain} specialist integration
Branch: ${branch}
Changed files: ${changedFiles.join(', ')}

${dim.prompt}

Your role is to find problems. Do not be lenient. Rate each finding:
- blocking: must be fixed before merge
- warning: should be fixed but does not block merge
- suggestion: optional improvement

Overall verdict:
- fail: one or more blocking findings
- warn: only warnings and suggestions, no blockers
- pass: no significant issues`,
    { schema: FINDING_SCHEMA, label: `review-${dim.key}`, phase: 'Review', model: 'opus', effort: 'high' }
  ))
)

phase('Verdict')

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['verdict', 'blocking_issues', 'warnings', 'summary'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'pass_with_warnings', 'fail'] },
    blocking_issues: { type: 'array', items: { type: 'string' } },
    warnings: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
}

const BUILD_VERIFY_SCHEMA = {
  type: 'object',
  required: ['build_passed', 'test_output_summary'],
  properties: {
    build_passed: { type: 'boolean' },
    test_output_summary: { type: 'string' },
    errors: { type: 'array', items: { type: 'string' } },
  },
}

const buildVerification = await agent(
  `Independently verify the build on branch "${branch}" for the home-dashboard project.

Do NOT trust the implementing agent's self-reported build status — run it yourself.

Steps:
1. git -C /projects/home-dashboard checkout ${branch}
2. cd /projects/home-dashboard && pnpm test 2>&1 | tail -40
3. git -C /projects/home-dashboard checkout main

Report whether pnpm test passed or failed, and summarize the output (errors if any).`,
  { schema: BUILD_VERIFY_SCHEMA, label: 'build-verify', phase: 'Verdict', model: 'opus', effort: 'high' }
)

const verdict = await agent(
  `You are the lead reviewer synthesizing four adversarial review passes for a home-dashboard pull request.

PR: ${prNumber} — ${domain} specialist integration
Branch: ${branch}

Review results from four dimensions:
${JSON.stringify(reviews.filter(Boolean), null, 2)}

Independent build verification result:
${JSON.stringify(buildVerification)}

Your job:
1. Collect all blocking findings across all dimensions
2. Collect all warnings
3. If the build failed, add a blocking issue for that
4. Give an honest final verdict

Rules:
- If ANY dimension returned "fail" OR if build_passed is false, the overall verdict must be "fail"
- If no dimension failed but there are warnings, the verdict is "pass_with_warnings"
- "pass" means the PR is genuinely ready for human review and is safe to merge

Do not soften findings. A "pass" verdict from this workflow means the implementing agent
believes the code is correct and ready. The human reviewer still has final say.

Summarize the verdict in 2-3 sentences for the loop report.`,
  { schema: VERDICT_SCHEMA, label: 'verdict', phase: 'Verdict', model: 'opus', effort: 'high' }
)

return verdict
