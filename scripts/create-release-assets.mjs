import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const hacs = JSON.parse(await readFile(new URL("hacs.json", root), "utf8"));
const bundleUrl = new URL("dist/home-dashboard.js", root);
const bundle = await readFile(bundleUrl);
const expectedTag = `v${packageJson.version}`;
const tag = process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME || expectedTag;

if (tag !== expectedTag) {
  throw new Error(`Releasetag ${tag} komt niet overeen met packageversie ${expectedTag}`);
}

const sha256 = createHash("sha256").update(bundle).digest("hex");
const checksum = `${sha256}  home-dashboard.js\n`;
const manifest = {
  artifact: "home-dashboard.js",
  commit: process.env.GITHUB_SHA || "local",
  homeassistant: hacs.homeassistant,
  node: process.version,
  schema: 1,
  sha256,
  tag,
  version: packageJson.version
};

await writeFile(new URL("dist/home-dashboard.js.sha256", root), checksum, "utf8");
await writeFile(new URL("dist/release-manifest.json", root), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Release-assets gemaakt voor ${tag}.`);
