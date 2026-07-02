import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { registerSeoRoutes } from "./seo";
import { serveStatic } from "./static";
import { createServer } from "http";
import { env } from "./env";
import { pool } from "./db";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Trust the first proxy hop so req.ip is the real client IP — critical for rate limiting.
app.set("trust proxy", 1);

// ── Security headers ──────────────────────────────────────────────────────────
// Helmet sets X-Content-Type-Options, X-Frame-Options, HSTS, etc.
// Content-Security-Policy is relaxed so the SPA + Capacitor work correctly.
app.use(
  helmet({
    contentSecurityPolicy: false,   // SPA with inline scripts; tighten once CSP is mapped
    crossOriginEmbedderPolicy: false, // Required for Capacitor WebView
  }),
);

// ── CORS ─────────────────────────────────────────────────────────────────────
// Native-app webview origins. Plain http://localhost is excluded in production:
// any local dev server on a victim's machine could otherwise make credentialed
// cross-origin requests (CSRF). Capacitor Android (androidScheme: https) uses
// https://localhost, which stays allowed.
const CAPACITOR_ORIGINS = [
  "capacitor://localhost",
  "https://localhost",
  "ionic://localhost",
  ...(env.NODE_ENV === "production" ? [] : ["http://localhost"]),
];
// Automatically allow www variant of APP_ORIGIN (e.g. https://www.grouperry.com)
const wwwOrigin = env.APP_ORIGIN.replace("://", "://www.");
const ALLOWED_ORIGINS = [...CAPACITOR_ORIGINS, env.APP_ORIGIN, wwwOrigin];

// Support comma-separated extra origins via EXTRA_ORIGINS env var (useful for staging/preview URLs)
const extraOrigins = process.env.EXTRA_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? [];
ALLOWED_ORIGINS.push(...extraOrigins);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

// ── Request logging ───────────────────────────────────────────────────────────
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // SECURITY: never log response bodies — may contain PII / OTP / tokens.
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// ── Health check (before auth/routes so it's always reachable) ───────────────
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "ok", uptime: process.uptime() });
  } catch {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});

(async () => {
  // Add missing columns that weren't in the DB when deployed without DATABASE_URL secret.
  // ADD COLUMN IF NOT EXISTS is idempotent — safe to run on every boot.
  try {
    await pool.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR,
        ADD COLUMN IF NOT EXISTS stripe_account_id  VARCHAR,
        ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE
    `);
    // Backfill: Google-created accounts have verified emails (Google verifies them).
    await pool.query(`
      UPDATE users SET email_verified = TRUE
      WHERE email_verified IS NOT TRUE AND google_id IS NOT NULL
    `);
    await pool.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS stripe_payment_method_id VARCHAR,
        ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR,
        ADD COLUMN IF NOT EXISTS charge_status VARCHAR,
        ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP
    `);
    // One phone = one account (phone-OTP login identifies accounts by phone).
    // Deduplicate first so the index can build on legacy data: keep the oldest
    // row's phone, null out the rest (those accounts keep email/Google login).
    await pool.query(`
      UPDATE users u SET phone = NULL, phone_verified = FALSE
      WHERE phone IS NOT NULL AND EXISTS (
        SELECT 1 FROM users older
        WHERE older.phone = u.phone AND older.created_at < u.created_at
      )
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique
      ON users (phone) WHERE phone IS NOT NULL
    `);
    // Ratings keep 2 decimal places (was a lossy integer — 4.49 displayed as 4).
    await pool.query(`ALTER TABLE users ALTER COLUMN rating TYPE REAL`);
  } catch (e: any) {
    console.error("[startup] schema migration error:", e.message);
  }

  // SEO routes (dynamic sitemap + per-listing OG meta) must be registered
  // before the API routes' agent-ready handlers and the SPA static fallback
  // so /sitemap.xml and HTML requests to /listings/:id are handled here.
  registerSeoRoutes(app);

  await registerRoutes(httpServer, app);

  // ── Global error handler ──────────────────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const safeMessage =
      status < 500
        ? err.message || "Request error"
        : env.NODE_ENV === "production"
          ? "Internal Server Error"
          : err.message || "Internal Server Error";

    // Log with request id when available
    console.error(`[error] ${status} ${safeMessage}`, err.stack ?? "");

    if (res.headersSent) return next(err);

    // Uniform error shape: { code, message }
    const code =
      status === 400 ? "BAD_REQUEST"
      : status === 401 ? "UNAUTHORIZED"
      : status === 403 ? "FORBIDDEN"
      : status === 404 ? "NOT_FOUND"
      : status === 429 ? "RATE_LIMITED"
      : "INTERNAL_ERROR";

    return res.status(status).json({ code, message: safeMessage });
  });

  if (env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(env.PORT, 10);
  httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
})();
