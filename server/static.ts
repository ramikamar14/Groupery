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
        // The app shell must never be cached by browsers OR Cloudflare — otherwise
        // a stale index.html keeps pointing at old JS hashes and the new service
        // worker never installs. no-store also tells Cloudflare's edge not to cache.
        if (name === "index.html" || name === "sw.js") {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          return;
        }
        // Content-hashed build assets are immutable — the filename changes whenever
        // the content changes, so they're safe to cache forever.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  // fall through to index.html if the file doesn't exist — same no-store policy so
  // the SPA shell is always fetched fresh.
  app.use("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
