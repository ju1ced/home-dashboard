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
const maxBundleBytes = 120_000;

if (hacs.filename !== "home-dashboard.js") errors.push("hacs.json verwijst niet naar home-dashboard.js");
if (hacs.homeassistant !== "2026.8.2") errors.push("Onverwachte minimale Home Assistant-versie");
if (!hacs.hide_default_branch) errors.push("HACS moet uitsluitend releases aanbieden");
if (!bundle.startsWith("/*! Home Dashboard")) errors.push("Bundleheader ontbreekt");
if (!bundle.includes(packageJson.version)) errors.push("Packageversie ontbreekt in bundle");
if (bundle.includes("sourceMappingURL")) errors.push("Productiebundle bevat een sourcemapverwijzing");
if (distFiles.some((file) => file.endsWith(".map"))) errors.push("dist bevat een sourcemap");
if (bundleStats.size > maxBundleBytes) errors.push(`Dashboardbundle overschrijdt 120 kB: ${bundleStats.size}`);

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Dist-check geslaagd: ${bundleStats.size} bytes, versie ${packageJson.version}.`);
}
