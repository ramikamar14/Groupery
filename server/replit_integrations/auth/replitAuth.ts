import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

export function getSession() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required but not set. Set it before starting the server.");
  }
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    // Reset the cookie maxAge and call store.touch() on every request so the
    // session never expires while the user is actively using the app.
    rolling: true,
    cookie: {
      httpOnly: true,
      // In production the API is served over HTTPS.  Capacitor native apps call
      // the production API from a capacitor:// or http://localhost origin, which
      // the browser treats as cross-site.  SameSite=None+Secure is required for
      // the session cookie to be sent in those credentialed cross-origin fetches.
      // SameSite=None requires Secure=true, which is always the case in production.
      // In development (HTTP) we fall back to Lax so the cookie still works.
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express): Promise<void> {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};
