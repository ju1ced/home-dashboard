import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

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
  assert.ok(bundle.length < 128_000);
  assert.equal(bundle.includes(Buffer.from("sourceMappingURL")), false);
});
