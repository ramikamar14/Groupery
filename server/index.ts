import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Trust the first proxy hop so req.ip is the real client IP — critical for rate limiting.
app.set("trust proxy", 1);

// Allow requests from Capacitor native apps (iOS: capacitor://localhost,
// Android: http://localhost) and the production web origin.
const CAPACITOR_ORIGINS = ["capacitor://localhost", "http://localhost", "ionic://localhost"];
const ALLOWED_ORIGINS = [
  ...CAPACITOR_ORIGINS,
  process.env.APP_ORIGIN ?? "https://grouperry.com",
];
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin browser requests (no Origin header) and known origins.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

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
      // SECURITY: never log response bodies — they may contain PII, phone numbers,
      // OTP codes, auth tokens, or moderation data. Log only routing metadata.
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  // NOTE: /api/ai is registered in server/routes.ts with requireAuth + aiLimiter + Zod validation.
  // Do NOT register any /api/* routes here — they bypass auth and rate limiting.
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    // In production never expose raw DB/internal error messages (column names, constraint
    // violations, stack traces). Only pass through messages from known "safe" errors that
    // set an explicit status code < 500.
    const safeMessage =
      status < 500
        ? err.message || "Request error"
        : process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message: safeMessage });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
