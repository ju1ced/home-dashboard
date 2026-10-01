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
// 215_000 -> 245_000: HD-202 voegt het volledige capability-gedreven Control Deck
// toe aan dezelfde HACS-bundle: drieperiodenenergie, lichtgroepen, getypeerde
// openingen, beschermde plugs, tabs, toegankelijke apparaatvergelijking en
// servicefeedback met pending-lock.
// 245_000 -> 254_000 (D-052): HD-204 herstructureert de Control Deck naar de
// afgetikte v3-rail (rail als hoofdnavigatie, dimsliders, samenvattingsstrips,
// geconsolideerde Comfort-stage). Gemeten kandidaat: 251.696 bytes. Bewust iets
// ruimere marge dan voorheen (± 2,3 kB) na HD-171's waarschuwing dat de vorige
// grens (603 bytes marge) de eerstvolgende specialistintegratie direct zou
// blokkeren; HD-171 blijft de plek waar dit structureel wordt opgelost.
// 254_000 -> 258_000 (D-053): HD-206 voegt de deck-head, stage-head,
// rail-iconen/samenvattingen en hero-pillen toe die HD-204 oversloeg, inclusief
// een drietonige statusbadge zonder gefabriceerde waarden. Gemeten kandidaat:
// 256.821 bytes. Dit is de derde verhoging op rij; HD-171 moet dit structureel
// oplossen vóór de volgende specialistintegraties.
// 258_000 -> 260_000 (D-054): HD-209 voegt rechtstreekse kamerfoto-upload toe
// via de native HA media-selector (image_upload) en media_source/resolve_media.
// Gemeten kandidaat: 259.642 bytes (na de adversarial-reviewronde die de
// setConfig/hass-volgorde, aria-hidden en schema-validator fixte). Vierde
// verhoging op rij; HD-171 moet dit structureel oplossen.
const maxBundleBytes = 260_000;

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
