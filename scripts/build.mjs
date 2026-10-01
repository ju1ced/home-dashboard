import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const version = process.env.HOME_DASHBOARD_VERSION || packageJson.version;

await mkdir(new URL("../dist/", import.meta.url), { recursive: true });

const shared = {
  bundle: true,
  define: {
    __HOME_DASHBOARD_VERSION__: JSON.stringify(version)
  },
  format: "esm",
  legalComments: "eof",
  minify: true,
  platform: "browser",
  sourcemap: false,
  target: ["es2022"]
};

// Main runtime bundle: every card, the strategy and the view strategy. This is
// what every dashboard visitor downloads just to view their dashboard, so it
// deliberately does NOT contain the config-flow editor UI (see
// scripts/verify-dist.mjs for the size budget this is held to).
await build({
  ...shared,
  banner: {
    js: `/*! Home Dashboard ${version} | MIT License | https://github.com/ju1ced/home-dashboard */`
  },
  entryPoints: [fileURLToPath(new URL("../src/index.ts", import.meta.url))],
  outfile: fileURLToPath(new URL("../dist/home-dashboard.js", import.meta.url))
});

// Editor bundle: the visual config UI, lazy-loaded on demand from
// HomeDashboardStrategy.getConfigElement() (src/strategy/home-dashboard-strategy.ts)
// only when a user actually opens the dashboard's config flow. Built as an
// independent, self-contained bundle (no esbuild `splitting`) rather than a
// shared chunk, so dist/home-dashboard.js never has a static/eager dependency
// on another file: a stale or missing editor bundle after a HACS upgrade can
// only break the editor, never the runtime dashboard itself.
await build({
  ...shared,
  banner: {
    js: `/*! Home Dashboard editor ${version} | MIT License | https://github.com/ju1ced/home-dashboard */`
  },
  entryPoints: [fileURLToPath(new URL("../src/editor/editor-entry.ts", import.meta.url))],
  outfile: fileURLToPath(new URL("../dist/home-dashboard-editor.js", import.meta.url))
});

console.log(`Bundle gebouwd: dist/home-dashboard.js, dist/home-dashboard-editor.js (${version})`);
