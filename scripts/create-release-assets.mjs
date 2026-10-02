import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const hacs = JSON.parse(await readFile(new URL("hacs.json", root), "utf8"));
const bundleUrl = new URL("dist/home-dashboard.js", root);
const editorBundleUrl = new URL("dist/home-dashboard-editor.js", root);
const bundle = await readFile(bundleUrl);
const editorBundle = await readFile(editorBundleUrl);
const expectedTag = `v${packageJson.version}`;
const tag = process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME || expectedTag;

if (tag !== expectedTag) {
  throw new Error(`Releasetag ${tag} komt niet overeen met packageversie ${expectedTag}`);
}

const sha256 = createHash("sha256").update(bundle).digest("hex");
const checksum = `${sha256}  home-dashboard.js\n`;
const editorSha256 = createHash("sha256").update(editorBundle).digest("hex");
const editorChecksum = `${editorSha256}  home-dashboard-editor.js\n`;
// "artifact" blijft het hoofdruntimebestand identificeren (dat is wat HACS via
// hacs.json's filename registreert als Lovelace-resource). De editorbundle
// krijgt een eigen checksumveld voor integriteit, zonder de artifact-semantiek
// van het manifest te wijzigen.
const manifest = {
  artifact: "home-dashboard.js",
  commit: process.env.GITHUB_SHA || "local",
  homeassistant: hacs.homeassistant,
  node: process.version,
  schema: 1,
  sha256,
  tag,
  version: packageJson.version,
  editor: {
    artifact: "home-dashboard-editor.js",
    sha256: editorSha256
  }
};

await writeFile(new URL("dist/home-dashboard.js.sha256", root), checksum, "utf8");
await writeFile(new URL("dist/home-dashboard-editor.js.sha256", root), editorChecksum, "utf8");
await writeFile(new URL("dist/release-manifest.json", root), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Release-assets gemaakt voor ${tag}.`);
