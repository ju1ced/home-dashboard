import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const required = [
  "README.md",
  "AGENTS.md",
  "CHANGELOG.md",
  "LICENSE",
  "SECURITY.md",
  "hacs.json",
  "tsconfig.json",
  "pnpm-workspace.yaml",
  ".github/workflows/ci.yaml",
  ".github/workflows/hacs.yaml",
  ".github/workflows/release.yaml",
  ".github/PULL_REQUEST_TEMPLATE.md",
  "src/index.ts",
  "dist/home-dashboard.js",
  "scripts/build.mjs",
  "scripts/verify-dist.mjs",
  "scripts/create-release-assets.mjs",
  "tests/foundation.test.mjs",
  "docs/installation/hacs.md",
  "docs/releases/testing-v0.1.0-alpha.1.md",
  "docs/discovery/current-state.md",
  "docs/discovery/current-dashboard-information-parity.md",
  "docs/discovery/source-and-evidence-matrix.md",
  "docs/discovery/reference-projects.md",
  "docs/discovery/requirements.md",
  "docs/design/concepts.md",
  "docs/design/final-proposal.md",
  "docs/design/concept-scorecard.md",
  "docs/design/dashboard-proposal.md",
  "docs/design/information-architecture.md",
  "docs/design/design-system.md",
  "docs/design/integration-strategy.md",
  "docs/design/implementation-plan.md",
  "docs/design/delivery-roadmap.md",
  "docs/design/decision-log.md",
  "prototype/index.html",
  "prototype/styles.css",
  "prototype/app.js",
  "prototype/fixtures.js"
];

const renderSizes = new Map([
  ["docs/renders/home-desktop.png", [1440, 900]],
  ["docs/renders/home-mobile.png", [390, 844]],
  ["docs/renders/rooms-desktop.png", [1440, 900]],
  ["docs/renders/rooms-mobile.png", [390, 844]],
  ["docs/renders/room-desktop.png", [1440, 900]],
  ["docs/renders/room-mobile.png", [390, 844]],
  ["docs/renders/energy-desktop.png", [1440, 900]],
  ["docs/renders/energy-mobile.png", [390, 844]],
  ["docs/renders/integrations-desktop.png", [1440, 900]],
  ["docs/renders/pool-desktop.png", [1440, 900]],
  ["docs/renders/home-desktop-dark.png", [1440, 900]]
]);

async function exists(file) {
  try {
    return (await stat(path.join(root, file))).isFile();
  } catch {
    return false;
  }
}

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walk(target));
    else output.push(target);
  }
  return output;
}

for (const file of required) {
  if (!await exists(file)) errors.push(`Ontbrekend vereist bestand: ${file}`);
}

for (const [file, expected] of renderSizes) {
  if (!await exists(file)) {
    errors.push(`Ontbrekende render: ${file}`);
    continue;
  }
  const png = await readFile(path.join(root, file));
  if (png.toString("ascii", 1, 4) !== "PNG") {
    errors.push(`Geen geldige PNG: ${file}`);
    continue;
  }
  const actual = [png.readUInt32BE(16), png.readUInt32BE(20)];
  if (actual[0] !== expected[0] || actual[1] !== expected[1]) {
    errors.push(`Verkeerde renderafmeting ${file}: ${actual.join("×")} in plaats van ${expected.join("×")}`);
  }
}

const allFiles = await walk(root);
const markdownFiles = allFiles.filter((file) => file.endsWith(".md"));
const textExtensions = new Set([".md", ".html", ".css", ".js", ".mjs", ".ts", ".json", ".yaml", ".yml"]);
const textFiles = allFiles.filter((file) => textExtensions.has(path.extname(file).toLowerCase()));

for (const file of markdownFiles) {
  const source = await readFile(file, "utf8");
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of source.matchAll(linkPattern)) {
    let target = match[1].trim().replace(/^<|>$/g, "");
    if (!target || target.startsWith("#") || /^(https?:|mailto:)/i.test(target)) continue;
    target = target.split("#", 1)[0];
    if (/^[A-Za-z]:[\\/]/.test(target)) {
      errors.push(`Absolute lokale Markdown-link in ${path.relative(root, file)}: ${target}`);
      continue;
    }
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
    try {
      await stat(resolved);
    } catch {
      errors.push(`Gebroken lokale link in ${path.relative(root, file)}: ${target}`);
    }
  }
}

const privacyPatterns = [
  [/(?<![A-Za-z0-9_])(?:sensor|binary_sensor|light|switch|climate|cover|media_player|vacuum|person|device_tracker|camera|alarm_control_panel|lock|automation|script|scene|input_button|input_number|number|select|button|update)\.[a-z0-9_]{3,}/g, "mogelijk echte Home Assistant entity-ID"],
  [/(?:[0-9A-F]{2}:){5}[0-9A-F]{2}/gi, "MAC-adres"],
  [/https?:\/\/(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)[^\s)"']*/gi, "interne URL"],
  [/(?:access[_-]?token|api[_-]?key|client[_-]?secret|password)\s*[:=]\s*["'][^"']+["']/gi, "mogelijk secret"]
];

for (const file of textFiles) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (["codex-home-dashboard-design-prompt.md", "scripts/check-repo.mjs"].includes(relative)) continue;
  const source = await readFile(file, "utf8");
  for (const [pattern, label] of privacyPatterns) {
    pattern.lastIndex = 0;
    const hit = pattern.exec(source);
    if (hit) errors.push(`${label} in ${relative}: ${hit[0]}`);
  }
}

const fixtures = await readFile(path.join(root, "prototype/fixtures.js"), "utf8");
for (const state of ["normal", "warning", "unavailable"]) {
  if (!new RegExp(`\\b${state}\\s*:`).test(fixtures)) errors.push(`Prototypefixture ontbreekt: ${state}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Checks geslaagd: ${required.length} kernbestanden, ${renderSizes.size} renders, ${markdownFiles.length} Markdown-bestanden en privacyscan.`);
}
