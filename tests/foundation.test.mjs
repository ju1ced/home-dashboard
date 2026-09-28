import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);

test("HACS manifest points at the versioned dashboard bundle", async () => {
  const hacs = JSON.parse(await readFile(new URL("hacs.json", root), "utf8"));
  const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  const bundle = await readFile(new URL("dist/home-dashboard.js", root), "utf8");

  assert.equal(hacs.filename, "home-dashboard.js");
  assert.equal(hacs.homeassistant, "2026.8.2");
  assert.equal(hacs.hide_default_branch, true);
  assert.match(bundle, new RegExp(packageJson.version.replaceAll(".", "\\.")));
});

test("dist contains exactly one HACS JavaScript runtime artifact", async () => {
  const files = (await readdir(new URL("dist/", root))).filter((file) => file.endsWith(".js"));
  assert.deepEqual(files, ["home-dashboard.js"]);
  assert.ok((await stat(new URL("dist/home-dashboard.js", root))).size > 0);
});

test("release assets are deterministic for a given bundle", async () => {
  const bundle = await readFile(new URL("dist/home-dashboard.js", root));
  const repositoryCheck = await readFile(new URL("scripts/check-repo.mjs", root), "utf8");
  const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  const commit = "01234567".repeat(5);
  const tag = `v${packageJson.version}`;
  // Zie scripts/verify-dist.mjs: 245_000 is de gereviewde alpha.20-grens voor
  // de complete Control Deck-slice en laat minder dan 1 procent marge.
  assert.ok(bundle.length <= 245_000);
  assert.equal(bundle.includes(Buffer.from("sourceMappingURL")), false);
  const result = spawnSync(process.execPath, ["scripts/create-release-assets.mjs"], { cwd: rootPath, encoding: "utf8", env: { ...process.env, GITHUB_SHA: commit, RELEASE_TAG: tag } });
  assert.equal(result.status, 0, result.stderr);
  const checksum = await readFile(new URL("dist/home-dashboard.js.sha256", root), "utf8");
  const manifest = JSON.parse(await readFile(new URL("dist/release-manifest.json", root), "utf8"));
  const sha256 = createHash("sha256").update(bundle).digest("hex");
  assert.equal(checksum, `${sha256}  home-dashboard.js\n`);
  assert.deepEqual({ artifact: manifest.artifact, commit: manifest.commit, sha256: manifest.sha256, tag: manifest.tag, version: manifest.version }, { artifact: "home-dashboard.js", commit, sha256, tag, version: packageJson.version });
  assert.match(repositoryCheck, /generatedPrivacyExclusions/);
  assert.match(repositoryCheck, /dist\/home-dashboard\.js\.sha256/);
  assert.match(repositoryCheck, /dist\/release-manifest\.json/);
});

test("release- en CI-workflows handhaven de browsergate", async () => {
  const releaseWorkflow = await readFile(new URL(".github/workflows/release.yaml", root), "utf8");
  const ciWorkflow = await readFile(new URL(".github/workflows/ci.yaml", root), "utf8");

  for (const [name, workflow] of [["release", releaseWorkflow], ["CI", ciWorkflow]]) {
    assert.match(workflow, /playwright install --with-deps chromium/, `${name} installeert Chromium niet`);
    assert.match(workflow, /pnpm run test:browser/, `${name} voert de browsermatrix niet uit`);
    assert.match(workflow, /HD_BROWSER_CHANNEL:\s*chromium/, `${name} kiest het geïnstalleerde browserkanaal niet`);
  }
});

test("editortouchgate meet alle native invoer en gebruikt het gelabelde viewport", async () => {
  const editor = await readFile(new URL("src/editor/home-dashboard-editor.ts", root), "utf8");
  const browserCheck = await readFile(new URL("scripts/render-room-controls.mjs", root), "utf8");

  assert.match(editor, /input,select,textarea\{[^}]*min-height:44px/);
  assert.match(browserCheck, /currentCase='editor\/rooms\/normal\/1440x1100';\s*await page\.setViewportSize\(\{width:1440,height:1100\}\)/);
  assert.match(browserCheck, /querySelectorAll\('button,summary,input,select,textarea,\.toolbar label'\)/);
});

test("browser regression matrix has one documented runner", async () => {
  const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  const runner = await readFile(new URL("scripts/check-browser-matrix.mjs", root), "utf8");
  const routeCheck = await readFile(new URL("scripts/check-prototype-browser.mjs", root), "utf8");
  const server = await readFile(new URL("scripts/serve-prototype.mjs", root), "utf8");
  const headerCheck = await readFile(new URL("scripts/check-home-header-row.mjs", root), "utf8");
  const roomCheck = await readFile(new URL("scripts/check-room-detail-browser.mjs", root), "utf8");
  const renderCheck = await readFile(new URL("scripts/render-room-controls.mjs", root), "utf8");
  const documentation = await readFile(new URL("docs/quality/browser-regression-matrix.md", root), "utf8");

  assert.equal(packageJson.scripts["test:browser"], "node scripts/check-browser-matrix.mjs");
  assert.equal(packageJson.scripts["browser:install"], "playwright install chromium");
  assert.equal(packageJson.devDependencies.playwright, "1.63.0");
  for (const check of [
    "check-prototype-browser.mjs",
    "check-home-header-row.mjs",
    "check-navigation-browser.mjs",
    "check-room-detail-browser.mjs",
    "render-room-controls.mjs"
  ]) {
    assert.ok(runner.includes(check), `${check} ontbreekt in de browsermatrix`);
  }
  for (const contract of [
    "390×844",
    "1024×900",
    "1440×900",
    "normal",
    "warning",
    "missing",
    "unavailable",
    "keyboard",
    "focus",
    "editor",
    "specialist"
  ]) {
    assert.ok(documentation.includes(contract), `${contract} ontbreekt in de matrixdocumentatie`);
  }
  assert.match(routeCheck, /marker:/);
  assert.match(routeCheck, /route-specific content/);
  assert.match(runner, /HD_PROTOTYPE_TOKEN/);
  assert.match(runner, /HD_PROTOTYPE_URL/);
  assert.match(server, /__health/);
  assert.match(server, /HD_PROTOTYPE_TOKEN/);
  assert.match(runner, /Browser matrix failed in/);
  assert.match(headerCheck, /currentCase/);
  assert.match(headerCheck, /new Error\(`\$\{currentCase\}:/);
  assert.match(headerCheck, /HD_BROWSER_CHANNEL/);
  assert.match(roomCheck, /HD_BROWSER_CHANNEL/);
  assert.match(renderCheck, /currentCase/);
  assert.match(renderCheck, /new Error\(`\$\{currentCase\}:/);
  assert.match(runner, /if \(shuttingDown\) return/);
});

test("releasekwaliteit heeft expliciete parity- en toegankelijkheidsgrenzen", async () => {
  const energy = await readFile(new URL("docs/quality/energy-parity-manifest.md", root), "utf8");
  const pool = await readFile(new URL("docs/quality/pool-status-contract.md", root), "utf8");
  const accessibility = await readFile(new URL("docs/quality/responsive-accessibility-qa.md", root), "utf8");

  for (const status of ["Gedekt", "Gedeeltelijk", "Geblokkeerd / uitgesteld"]) assert.match(energy, new RegExp(status));
  for (const boundary of ["Actuele Power Sankey", "Dubbeltelling", "Stale", "HD-121"]) assert.match(energy, new RegExp(boundary));
  for (const contract of ["Unavailable", "Warmtepompfout", "Zoutsysteemfout", "Vrije tekststatus", "HD-151"]) assert.match(pool, new RegExp(contract));
  for (const gate of ["390×844", "1024×900", "1440×900", "44×44", "Reduced motion", "200%", "screenreaderreview", "Review/validatie"]) assert.match(accessibility, new RegExp(gate, "i"));
});
