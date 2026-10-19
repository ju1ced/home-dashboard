export const meta = {
  name: 'home-dashboard-advance',
  description: 'Advance home-dashboard one PR milestone: discover → plan → implement → review → self-confirm. Loop completes when a PR passes review.',
  phases: [
    { title: 'Orient' },
    { title: 'Discover' },
    { title: 'Plan' },
    { title: 'Implement' },
    { title: 'Visual Test' },
    { title: 'Review' },
    { title: 'Conclude' },
  ],
}

// ── Roadmap ──────────────────────────────────────────────────────────────────
// PRs 1-6 are complete as of v0.6.0-alpha.1.
// This workflow advances one specialist PR per loop invocation (PRs 7-10).
// QA milestones (11-13) need a separate workflow.
const SPECIALIST_ROADMAP = [
  { pr: 7,  domain: 'kia',    title: 'Kia EV specialist',           release: 'v0.7.0-alpha.1' },
  { pr: 8,  domain: 'robot',  title: 'Robot vacuum specialist',      release: 'v0.8.0-alpha.1' },
  { pr: 9,  domain: 'garden', title: 'Garden specialist',            release: 'v0.9.0-alpha.1' },
  { pr: 10, domain: 'pool',   title: 'Pool specialist',              release: 'v0.10.0-alpha.1' },
]

const ORIENT_SCHEMA = {
  type: 'object',
  required: ['next_pr', 'domain', 'rationale', 'ready_to_proceed'],
  properties: {
    next_pr:          { type: 'number' },
    domain:           { type: 'string', enum: ['kia', 'robot', 'garden', 'pool', 'none'] },
    title:            { type: 'string' },
    rationale:        { type: 'string' },
    ready_to_proceed: { type: 'boolean' },
    blocker:          { type: 'string' },
    branch_exists:    { type: 'boolean', description: 'True if a codex/ branch for this PR already exists' },
    existing_branch:  { type: 'string' },
  },
}

// ── Phase 1: Orient ──────────────────────────────────────────────────────────
phase('Orient')

const orientation = await agent(
  `Determine the current state of the home-dashboard project and identify the next specialist PR to implement.

Run these commands:
  git -C /projects/home-dashboard log --oneline -15
  git -C /projects/home-dashboard branch -a | grep codex
  ls /projects/home-dashboard/src/cards/

Roadmap of specialist PRs (PRs 1-6 already done as of v0.6.0-alpha.1):
${JSON.stringify(SPECIALIST_ROADMAP, null, 2)}

Identify the next unimplemented PR:
- A PR is implemented if src/cards/ contains a home-dashboard-specialist-<domain>.ts file
- A PR is in-progress if a git branch named codex/pr<N>-<domain>* exists

If an in-progress branch exists, set branch_exists=true and existing_branch to its name.
If all specialist PRs (7-10) are done, set domain="none".
If there is a reason we cannot proceed (merge conflict, broken tests, etc.), set ready_to_proceed=false and explain.

Otherwise set ready_to_proceed=true.`,
  { schema: ORIENT_SCHEMA, label: 'orient', phase: 'Orient' }
)

if (orientation.domain === 'none') {
  log('All specialist PRs (7-10) are complete.')
  return {
    complete: true,
    message: 'Specialist PRs 7-10 are all implemented. Next milestone: PR11 responsive/a11y/visual QA.',
  }
}

if (!orientation.ready_to_proceed) {
  log(`Cannot proceed: ${orientation.blocker}`)
  return { complete: false, blocker: orientation.blocker, next_pr: orientation.next_pr }
}

const targetPR = SPECIALIST_ROADMAP.find(r => r.pr === orientation.next_pr)
const branchName = orientation.existing_branch || `codex/pr${orientation.next_pr}-${orientation.domain}-specialist`
log(`Target: PR ${orientation.next_pr} — ${targetPR?.title} (branch: ${branchName})`)

// ── Phase 2: Discover ────────────────────────────────────────────────────────
phase('Discover')

const discovery = await workflow(
  { scriptPath: '/projects/home-dashboard/.claude/workflows/home-dashboard-discover-domain.js' },
  { domain: orientation.domain }
)

if (!discovery || !discovery.ready_to_implement) {
  log(`Discovery blocked: ${discovery?.blocker || 'insufficient information to implement'}`)
  return {
    complete: false,
    blocker: discovery?.blocker || 'Discovery phase did not produce enough information to proceed',
    domain: orientation.domain,
    next_pr: orientation.next_pr,
  }
}

log(`Discovery complete. Card type: ${discovery.card_type || 'unknown'}. Files to create: ${(discovery.files_to_create || []).join(', ')}`)

// ── Phase 3: Plan ────────────────────────────────────────────────────────────
phase('Plan')

const PLAN_SCHEMA = {
  type: 'object',
  required: ['files_to_create', 'files_to_modify', 'implementation_spec', 'branch_name'],
  properties: {
    files_to_create:     { type: 'array', items: { type: 'string' } },
    files_to_modify:     { type: 'array', items: { type: 'string' } },
    branch_name:         { type: 'string' },
    card_type:           { type: 'string' },
    implementation_spec: {
      type: 'string',
      description: 'Complete, self-contained implementation instructions the implementing agent can follow verbatim',
    },
    review_checklist:    { type: 'array', items: { type: 'string' } },
  },
}

const plan = await agent(
  `Create a concrete, self-contained implementation plan for the ${orientation.domain} specialist PR (PR ${orientation.next_pr}).

Discovery results:
${JSON.stringify(discovery, null, 2)}

Read these existing files to ground the plan in the actual codebase:
  cat /projects/home-dashboard/src/config/types.ts
  cat /projects/home-dashboard/src/strategy/home-dashboard-strategy.ts
  cat /projects/home-dashboard/src/strategy/home-dashboard-view-strategy.ts
  cat /projects/home-dashboard/src/cards/home-dashboard-energy-domain-cards.ts | head -120
  cat /projects/home-dashboard/src/index.ts

Then write an implementation_spec that is:
- Self-contained: the implementing agent will read it without additional context
- Concrete: specify exact TypeScript class names, method signatures, and key logic
- Pattern-faithful: all new code follows the conventions of the existing source

The spec must describe:

1. NEW FILE: src/cards/home-dashboard-specialist-${orientation.domain}.ts
   - Class name: HomeDashboardSpecialist${orientation.domain.charAt(0).toUpperCase() + orientation.domain.slice(1)}
   - Registration tag: "home-dashboard-specialist-${orientation.domain}"
   - Implements: setConfig(config), set hass(hass), connectedCallback(), render() with shadow DOM
   - Config interface: uses SpecialistConfig (enabled, card_type, minimum_version, mapping_keys)
   - Three render states:
     a) card_type not loaded in customElements: show HACS install instructions with card_type name
     b) hass entity unavailable/stale: show unavailable state
     c) normal: create and configure an element of config.card_type, pass hass
   - Exports: buildSpecialist${orientation.domain.charAt(0).toUpperCase() + orientation.domain.slice(1)}Sections(specialist, maxColumns) → LovelaceCardConfig[]
   - Summary tile: a compact tile for the home view when something notable is active

2. MODIFIED FILE: src/strategy/home-dashboard-strategy.ts
   - Add createSpecialistView helper for "specialist-${orientation.domain}" path (subview, back_path: "domains")
   - Include the new view in the strategy's generate() output

3. MODIFIED FILE: src/strategy/home-dashboard-view-strategy.ts
   - Dispatch view="specialist-${orientation.domain}" to the new card

4. MODIFIED FILE: src/cards/home-dashboard-energy-domain-cards.ts
   - Change the ${orientation.domain} navigation button path from "more" to "specialist-${orientation.domain}"

5. MODIFIED FILE: src/index.ts
   - Import and register the new card (registerHomeDashboardSpecialist${orientation.domain.charAt(0).toUpperCase() + orientation.domain.slice(1)})

Branch name: ${branchName}

CRITICAL PRIVACY RULE (include this verbatim in the spec):
No real Home Assistant entity IDs, device identifiers, person names, addresses or coordinates
may appear in any tracked file. All entity references must go through SpecialistConfig.mapping_keys.`,
  { schema: PLAN_SCHEMA, label: 'plan', phase: 'Plan' }
)

log(`Plan complete. Branch: ${plan.branch_name}. Files: ${[...(plan.files_to_create || []), ...(plan.files_to_modify || [])].join(', ')}`)

// ── Phase 4: Implement ───────────────────────────────────────────────────────
phase('Implement')

const IMPLEMENT_SCHEMA = {
  type: 'object',
  required: ['branch', 'changed_files', 'build_passed', 'summary'],
  properties: {
    branch:         { type: 'string' },
    changed_files:  { type: 'array', items: { type: 'string' } },
    build_passed:   { type: 'boolean' },
    build_errors:   { type: 'string' },
    summary:        { type: 'string' },
  },
}

const implementation = await agent(
  `Implement the ${orientation.domain} specialist integration for the home-dashboard project.

=== IMPLEMENTATION SPEC ===
${plan.implementation_spec}
===========================

Branch to create (or use if exists): ${plan.branch_name}
Project root: /projects/home-dashboard/

STEP-BY-STEP PROCEDURE:
1. Check current branch: git -C /projects/home-dashboard branch --show-current
2. Create/switch branch: git -C /projects/home-dashboard checkout -b ${plan.branch_name} 2>/dev/null || git -C /projects/home-dashboard checkout ${plan.branch_name}
3. Read every file you will modify BEFORE editing (required for Edit tool)
4. Create new files with Write tool
5. Edit existing files with Edit tool
6. Run: cd /projects/home-dashboard && pnpm test
7. Fix any TypeScript errors (re-read affected files, then edit)
8. Re-run pnpm test until it passes
9. Stage and commit:
   git -C /projects/home-dashboard add src/
   git -C /projects/home-dashboard commit -m "feat: add ${orientation.domain} specialist view and card (PR ${orientation.next_pr})"
10. Return to main so subsequent phases start clean:
    git -C /projects/home-dashboard checkout main

MANDATORY RULES:
- Read each file with the Read tool before editing it (Edit tool requires this)
- Do NOT hardcode real entity IDs, device names, or personal identifiers
- All entity references go through SpecialistConfig.mapping_keys
- If pnpm test fails, fix the errors — do not give up after one attempt
- The new card must handle: card not installed, unavailable state, normal state
- Return build_passed=true only if pnpm test actually succeeded

Return: branch name, list of files changed, build result.`,
  { schema: IMPLEMENT_SCHEMA, label: 'implement', phase: 'Implement' }
)

if (!implementation) {
  log('Implementation agent returned null — probable catastrophic failure')
  return {
    complete: false,
    blocker: 'Implementation agent failed to return a result',
    domain: orientation.domain,
    next_pr: orientation.next_pr,
  }
}

const activeBranch = implementation.branch || plan.branch_name
log(`Implementation done. Branch: ${activeBranch}. Build: ${implementation.build_passed ? 'PASSED' : 'FAILED'}`)

if (!implementation.build_passed) {
  return {
    complete: false,
    blocker: `Build failed after implementation: ${implementation.build_errors || 'see agent output'}`,
    branch: activeBranch,
    domain: orientation.domain,
    next_pr: orientation.next_pr,
    next_steps: 'Fix build errors and re-run the loop, or inspect the branch manually.',
  }
}

// ── Phase 5: Visual Test ─────────────────────────────────────────────────────
phase('Visual Test')

const VISUAL_SCHEMA = {
  type: 'object',
  required: ['verdict', 'served_successfully', 'observations'],
  properties: {
    verdict: { type: 'string', enum: ['pass', 'warn', 'fail'] },
    served_successfully: { type: 'boolean' },
    observations: { type: 'array', items: { type: 'string' } },
    ux_issues: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
}

const visualTest = await agent(
  `Perform visual and build-artifact validation of the ${orientation.domain} specialist card.

Branch: ${activeBranch}
Project root: /projects/home-dashboard/

Steps:
1. Check out branch: git -C /projects/home-dashboard checkout ${activeBranch}
2. Build: cd /projects/home-dashboard && pnpm build 2>&1 | tail -30
3. Verify the built artifact contains the new element:
   grep -c "home-dashboard-specialist-${orientation.domain}" /projects/home-dashboard/dist/home-dashboard.js && echo "ELEMENT FOUND" || echo "ELEMENT MISSING"
4. Also check element registration exists:
   grep "registerHomeDashboard" /projects/home-dashboard/dist/home-dashboard.js | grep -i "${orientation.domain}" || echo "REGISTRATION MISSING"
5. Start prototype in background: cd /projects/home-dashboard && pnpm run serve &
6. Wait 3 seconds, then fetch to verify it loads:
   sleep 3 && curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4173/
7. Inspect prototype HTML for navigation links to specialist-${orientation.domain}:
   curl -s http://127.0.0.1:4173/ | grep -i "${orientation.domain}" | head -10 || echo "No specialist nav found in prototype HTML"
8. Stop dev server: pkill -f "vite" 2>/dev/null || pkill -f "preview" 2>/dev/null; true
9. Return to main: git -C /projects/home-dashboard checkout main

Evaluate:
- Did pnpm build succeed?
- Is the custom element "home-dashboard-specialist-${orientation.domain}" present in dist/?
- Does the prototype serve (HTTP 200)?
- Are there any glaring structural or naming issues visible in the build output?

Rate the visual/build test as:
- pass: build succeeded, element registered, prototype serves correctly
- warn: minor issues but the card would render
- fail: build failed, element missing, or prototype breaks

Note: the prototype is a static mock — absence of live specialist data in it is expected.
What matters is that the compiled element exists and the navigation path is wired correctly.`,
  { schema: VISUAL_SCHEMA, label: 'visual-test', phase: 'Visual Test', model: 'opus', effort: 'high' }
)

log(`Visual test: ${visualTest?.verdict || 'no result'} — ${visualTest?.summary || ''}`)

if (visualTest?.verdict === 'fail') {
  return {
    complete: false,
    blocker: `Visual/build test failed: ${(visualTest.ux_issues || visualTest.observations || []).join('; ')}`,
    branch: activeBranch,
    domain: orientation.domain,
    next_pr: orientation.next_pr,
    next_steps: 'Fix the build/visual issues and re-run the loop.',
  }
}

// ── Phase 6: Adversarial Review ─────────────────────────────────────────────
phase('Review')

const review = await workflow(
  { scriptPath: '/projects/home-dashboard/.claude/workflows/home-dashboard-review-pr.js' },
  {
    branch: activeBranch,
    pr_number: orientation.next_pr,
    domain: orientation.domain,
    changed_files: implementation.changed_files || [],
  }
)

log(`Review verdict: ${review?.verdict || 'no verdict'}`)
if (review?.blocking_issues?.length) {
  log(`Blocking issues: ${review.blocking_issues.join(' | ')}`)
}

// ── Phase 7: Conclude ────────────────────────────────────────────────────────
phase('Conclude')

if (!review || review.verdict === 'fail') {
  return {
    complete: false,
    verdict: 'fail',
    blocking_issues: review?.blocking_issues || ['Review returned no verdict'],
    warnings: review?.warnings || [],
    branch: activeBranch,
    domain: orientation.domain,
    next_pr: orientation.next_pr,
    next_steps: 'Fix the blocking issues listed above. The branch exists and can be continued. Re-run the loop.',
  }
}

// Loop goal achieved: PR is implemented, built, and passed adversarial review.
return {
  complete: true,
  pr_number: orientation.next_pr,
  domain: orientation.domain,
  release_target: targetPR?.release,
  branch: activeBranch,
  verdict: review.verdict,
  warnings: review.warnings || [],
  summary: [
    `PR ${orientation.next_pr} (${orientation.domain} specialist) is implemented and passed review.`,
    `Branch: ${activeBranch}`,
    `Target release: ${targetPR?.release}`,
    review.warnings?.length ? `Warnings to address before merge: ${review.warnings.join('; ')}` : 'No warnings.',
    `Next loop will target PR ${orientation.next_pr + 1}.`,
  ].join(' '),
}
