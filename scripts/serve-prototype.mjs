import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../prototype");
const repositoryRoot = path.resolve(root, "..");
const port = Number.parseInt(process.env.HD_PROTOTYPE_PORT || "4173", 10);
const healthToken = process.env.HD_PROTOTYPE_TOKEN || "standalone";
// HD-171: opt-in only. Every other consumer of this server (the full browser matrix) relies on the
// default no-store contract so each check always exercises a byte-identical, freshly-read dist/ file.
// The performance-baseline script is the only caller that sets this, in its own short-lived server
// instance, to produce a real cold-vs-warm HTTP cache distinction for the parse/evaluation metric.
const cacheableDist = process.env.HD_PROTOTYPE_CACHE === "1";

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"]
]);

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", "http://localhost");
    if (requestUrl.pathname === "/__health") {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify({ service: "home-dashboard-prototype", token: healthToken }));
      return;
    }
    const relative = decodeURIComponent(requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname);
    const target = relative.startsWith("/dist/")
      ? path.resolve(repositoryRoot, `.${relative}`)
      : path.resolve(root, `.${relative}`);

    const allowed = target === root || target.startsWith(`${root}${path.sep}`) || target.startsWith(`${path.join(repositoryRoot, "dist")}${path.sep}`);
    if (!allowed) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const info = await stat(target);
    if (!info.isFile()) throw new Error("Not a file");
    const body = await readFile(target);
    const cacheable = cacheableDist && relative.startsWith("/dist/");
    response.writeHead(200, {
      "Content-Type": contentTypes.get(path.extname(target)) || "application/octet-stream",
      "Cache-Control": cacheable ? "public, max-age=31536000, immutable" : "no-store"
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Prototype: http://127.0.0.1:${port}/`);
});
