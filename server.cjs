/**
 * RouteWitness Production Web Server
 *
 * Lightweight, zero-dependency Node.js HTTP server for Google Cloud Run:
 * - Serves static production assets from dist/
 * - SPA history fallback to index.html
 * - Dedicated /healthz endpoint for Cloud Run container probes
 * - Dedicated /version.json endpoint for candidate SHA verification
 * - Dedicated /evidence/latest.json endpoint for Release Receipt inspection
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, "dist");
const ARTIFACTS_DIR = path.join(__dirname, "artifacts/route-witness");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  // 1. Healthz probe
  if (pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
    return;
  }

  // 2. Version endpoint
  if (pathname === "/version.json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        project: "RouteWitness / AccessGraph",
        version: "1.0.0",
        commitSha: process.env.CI_COMMIT_SHA || process.env.GIT_COMMIT || "production-candidate",
        cloudRunRevision: process.env.K_REVISION || "local",
        builtAt: process.env.BUILD_TIMESTAMP || new Date().toISOString(),
      })
    );
    return;
  }

  // 3. Evidence endpoint
  if (pathname === "/evidence/latest.json") {
    const receiptPath = path.join(ARTIFACTS_DIR, "release-receipt.json");
    if (fs.existsSync(receiptPath)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(fs.readFileSync(receiptPath));
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "No receipt generated yet" }));
    return;
  }

  // 4. Static file serving with SPA fallback
  let filePath = path.join(DIST_DIR, pathname === "/" ? "index.html" : pathname);

  // Path traversal safeguard
  const rel = path.relative(DIST_DIR, filePath);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(DIST_DIR, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end("Internal Server Error");
        return;
      }
      res.writeHead(200, {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      });
      res.end(content);
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[RouteWitness] Production server listening on http://0.0.0.0:${PORT}`);
});
