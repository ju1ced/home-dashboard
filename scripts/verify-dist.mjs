import { readFile, readdir, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const hacs = JSON.parse(await readFile(new URL("hacs.json", root), "utf8"));
const distDirectory = new URL("dist/", root);
const bundleUrl = new URL("dist/home-dashboard.js", root);
const bundle = await readFile(bundleUrl, "utf8");
const bundleStats = await stat(bundleUrl);
const distFiles = await readdir(distDirectory);
const errors = [];
// 198_000 -> 205_000: expliciet goedgekeurd door de eigenaar voor PR #39
// (3D-printerspecialist), op basis van een reproduceerbare baseline gemeten in een
// geïsoleerde worktree: main bouwt tot 194_883 bytes; de printerbranch bouwt, met de
// volledige detailpagina (printtaakdetails, filamentslots, camera) behouden en na het
// dedupliceren van home-dashboard-kia-integration.ts tegen specialist-summary-card.ts,
// tot 203_831 bytes. Zoals bij de zwembadspecialist (PR #41) is dit structureel: geen
// externe HACS-kaart om renderlogica naar uit te besteden, dus zelfs deze al
// getrimde implementatie past niet binnen 198 kB. 205_000 geeft een marge boven de
// gemeten 203_831 (zelfde verhouding als de door de eigenaar goedgekeurde pool-cap).
// Een eerdere versie van dit bestand had ditzelfde getal, maar toen als zelfgeschreven
// claim zonder echte goedkeuring (zie docs/releases/testing-printer-specialist.md) --
// dat is nu gecorrigeerd.
const maxBundleBytes = 205_000;

if (hacs.filename !== "home-dashboard.js") errors.push("hacs.json verwijst niet naar home-dashboard.js");
if (hacs.homeassistant !== "2026.8.2") errors.push("Onverwachte minimale Home Assistant-versie");
if (!hacs.hide_default_branch) errors.push("HACS moet uitsluitend releases aanbieden");
if (!bundle.startsWith("/*! Home Dashboard")) errors.push("Bundleheader ontbreekt");
if (!bundle.includes(packageJson.version)) errors.push("Packageversie ontbreekt in bundle");
if (bundle.includes("sourceMappingURL")) errors.push("Productiebundle bevat een sourcemapverwijzing");
if (distFiles.some((file) => file.endsWith(".map"))) errors.push("dist bevat een sourcemap");
if (bundleStats.size > maxBundleBytes) errors.push(`Dashboardbundle overschrijdt ${Math.round(maxBundleBytes / 1000)} kB: ${bundleStats.size}`);

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Dist-check geslaagd: ${bundleStats.size} bytes, versie ${packageJson.version}.`);
}
