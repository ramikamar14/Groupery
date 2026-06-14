import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(
    express.static(distPath, {
      setHeaders(res, filePath) {
        const name = path.basename(filePath);
        // Must revalidate with origin on every request so Cloudflare never serves
        // a stale index.html or sw.js. stale-if-error=30 allows serving a cached
        // copy for up to 30 s if the origin is briefly unavailable (e.g. pm2 reload).
        if (name === "index.html" || name === "sw.js") {
          res.setHeader("Cache-Control", "no-cache, stale-if-error=30");
          return;
        }
        // Content-hashed build assets are immutable — filename changes with content.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  // SPA fallback — serve index.html for all unmatched routes.
  app.use("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, stale-if-error=30");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
