import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

const root = new URL("../", import.meta.url);
const port = 4600 + (process.pid % 1000);
const token = randomUUID();
const prototypeUrl = `http://127.0.0.1:${port}`;
const checks = [
  {
    label: "prototype routes",
    script: "scripts/check-prototype-browser.mjs",
    context: "Home/Kamers/Energie/Domeinen/Meer/kamer/Kia/robot/tuin/3D-printer/zwembad; warning light 390×844, 1024×900, 1440×900; warning dark 1440×900; normal/unavailable light 390×844"
  },
  {
    label: "Home header",
    script: "scripts/check-home-header-row.mjs",
    context: "integrated/kiosk at 1920×1000 and 390×1000",
    environment: { HD_RENDER_DIRECTORY: "generated/browser-matrix/header-row" }
  },
  {
    label: "navigation",
    script: "scripts/check-navigation-browser.mjs",
    context: "integrated/kiosk/native; seven routes at 390×900, 1024×900 and 1440×900",
    environment: { HD_RENDER_DIRECTORY: "generated/browser-matrix/navigation" }
  },
  {
    label: "room detail",
    script: "scripts/check-room-detail-browser.mjs",
    context: "normal/dark/warning/missing/unknown/unavailable at 390×844, 1024×900 and 1440×900",
    environment: { HD_RENDER_DIRECTORY: "generated/browser-matrix/room-detail" }
  },
  {
    label: "Home, editor and room controls",
    script: "scripts/render-room-controls.mjs",
    context: "normal/dark/warning/missing/unavailable and integrated/kiosk/native at 390×844, 1024×900 and 1440×900; touch and reduced-motion gates",
    environment: { HD_RENDER_DIRECTORY: "generated/browser-matrix/room-controls" }
  }
];

let server;
let activeChild;
let shuttingDown = false;

function waitForExit(child) {
  return new Promise((resolve) => {
    if (!child || child.exitCode !== null || child.signalCode !== null) {
      resolve();
      return;
    }
    child.once("exit", resolve);
  });
}

async function terminate(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    waitForExit(child),
    new Promise((resolve) => setTimeout(resolve, 2000))
  ]);
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
    await waitForExit(child);
  }
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  await terminate(activeChild);
  await terminate(server);
}

for (const [signal, exitCode] of [["SIGINT", 130], ["SIGTERM", 143]]) {
  process.once(signal, () => {
    void shutdown().finally(() => process.exit(exitCode));
  });
}

async function healthMatches() {
  try {
    const response = await fetch(`${prototypeUrl}/__health`);
    if (!response.ok) return false;
    const body = await response.json();
    return body.service === "home-dashboard-prototype" && body.token === token;
  } catch {
    return false;
  }
}

function runCheck(check, environment) {
  return new Promise((resolve, reject) => {
    activeChild = spawn(process.execPath, [check.script], {
      cwd: root,
      stdio: "inherit",
      env: { ...environment, ...check.environment }
    });
    activeChild.once("error", reject);
    activeChild.once("exit", (code, signal) => {
      activeChild = undefined;
      if (shuttingDown) return;
      if (code === 0) resolve();
      else reject(new Error(`Browser matrix failed in ${check.label} [${check.context}] (${signal ?? code})`));
    });
  });
}

try {
  server = spawn(process.execPath, ["scripts/serve-prototype.mjs"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, HD_PROTOTYPE_PORT: String(port), HD_PROTOTYPE_TOKEN: token }
  });
  for (let attempt = 0; attempt < 50 && !(await healthMatches()); attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Repository prototype server exited before readiness (${server.exitCode})`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!(await healthMatches())) throw new Error(`Repository prototype identity check failed at ${prototypeUrl}`);

  const baseEnvironment = {
    ...process.env,
    HD_BROWSER_CHANNEL: process.env.HD_BROWSER_CHANNEL || "chromium",
    HD_PROTOTYPE_URL: prototypeUrl
  };
  for (const check of checks) {
    console.log(`\n=== Browser matrix: ${check.label} ===`);
    await runCheck(check, baseEnvironment);
  }
  console.log("\nBrowser regression matrix passed. Evidence is in generated/browser-matrix/. Live Home Assistant acceptance remains a separate gate.");
} finally {
  await shutdown();
}
