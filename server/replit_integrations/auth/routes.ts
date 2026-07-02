import type { Express } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { toPublicUser } from "../../dto";
import { db } from "../../db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { sendOtp, verifyOtp } from "../../sms";
import { logger } from "../../logger";

const authLoginLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, standardHeaders: true, legacyHeaders: false, message: { message: "Too many login attempts. Please wait 15 minutes." } });
const otpLoginLimiter = rateLimit({ windowMs: 5 * 60_000, max: 5, standardHeaders: true, legacyHeaders: false, message: { message: "Too many OTP requests. Wait 5 minutes." } });

function makeSessionUser(userId: string) {
  return { claims: { sub: userId } };
}

export function registerAuthRoutes(app: Express): void {

  // ── Google OAuth ──────────────────────────────────────────────────────────
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL || "https://grouperry.com"}/api/auth/google/callback`,
    }, async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        let [user] = await db.select().from(users).where(eq(users.googleId, profile.id));
        if (!user && email) {
          const [byEmail] = await db.select().from(users).where(eq(users.email, email));
          user = byEmail;
        }
        if (user) {
          if (!user.googleId) {
            // Email-match linking: only safe if the existing account's email is
            // verified (or it was created via Google). Otherwise an attacker could
            // pre-register with someone else's email and hijack their Google login.
            if (!user.emailVerified && user.authProvider !== "google") {
              return done(null, false, { message: "account_conflict" });
            }
            // Google verifies email ownership, so mark it verified on link.
            [user] = await db.update(users).set({ googleId: profile.id, authProvider: "google", emailVerified: true }).where(eq(users.id, user.id)).returning();
          }
        } else {
          [user] = await db.insert(users).values({
            email,
            googleId: profile.id,
            authProvider: "google",
            emailVerified: true, // Google verifies emails before issuing profiles
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: profile.photos?.[0]?.value,
          }).returning();
        }
        return done(null, { claims: { sub: user.id } });
      } catch (e: any) {
        return done(e);
      }
    }));

    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get("/api/auth/google/callback", (req: any, res, next) => {
      passport.authenticate("google", (err: any, user: any, info: any) => {
        if (err) return res.redirect("/?login=true&error=google");
        if (!user) {
          // account_conflict: an unverified password account already owns this
          // email — the user must log in with their password and link Google
          // from settings instead.
          const error = info?.message === "account_conflict" ? "account_conflict" : "google";
          return res.redirect(`/?login=true&error=${error}`);
        }
        req.login(user, (loginErr: any) => {
          if (loginErr) return res.redirect("/?login=true&error=google");
          res.redirect("/");
        });
      })(req, res, next);
    });
  }

  // ── Get current user ──────────────────────────────────────────────────────
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({
        ...toPublicUser(user),
        email: user.email ?? null,
        phone: user.phone ? user.phone.slice(0, 4) + "****" : null,
        phoneVerified: user.phoneVerified ?? false,
        isAdmin: user.isAdmin ?? false,
        onboardingComplete: user.onboardingComplete ?? false,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ── Email/Password Register ───────────────────────────────────────────────
  app.post("/api/auth/register", authLoginLimiter, async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
      if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

      const normalizedEmail = email.toLowerCase().trim();
      const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail));
      if (existing) return res.status(400).json({ message: "Email already registered" });

      const passwordHash = await bcrypt.hash(password, 12);
      const [user] = await db.insert(users).values({
        email: normalizedEmail,
        passwordHash,
        authProvider: "local",
        emailVerified: false, // no email verification flow yet — must stay false until proven

        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
      }).returning();

      req.login(makeSessionUser(user.id), (err: any) => {
        if (err) return res.status(500).json({ message: "Registration failed" });
        res.json({ success: true, user: { id: user.id, onboardingComplete: user.onboardingComplete } });
      });
    } catch (e: any) {
      logger.error("register error", e);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // ── Email/Password Login ──────────────────────────────────────────────────
  app.post("/api/auth/login/email", authLoginLimiter, async (req: any, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
      if (!user || !user.passwordHash) return res.status(400).json({ message: "Invalid email or password" });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(400).json({ message: "Invalid email or password" });

      req.login(makeSessionUser(user.id), (err: any) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        res.json({ success: true, user: { id: user.id, onboardingComplete: user.onboardingComplete } });
      });
    } catch (e: any) {
      logger.error("email login error", e);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // ── Phone OTP Login — Send ────────────────────────────────────────────────
  app.post("/api/auth/login/send-otp", otpLoginLimiter, async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) return res.status(400).json({ message: "Phone number is required" });
      const cleanPhone = phone.trim().replace(/\s+/g, "");

      let [user] = await db.select().from(users).where(eq(users.phone, cleanPhone));
      if (!user) {
        [user] = await db.insert(users).values({ phone: cleanPhone, authProvider: "phone" }).returning();
      }

      const sent = await sendOtp(cleanPhone);
      if (!sent) return res.status(500).json({ message: "Failed to send OTP" });

      res.json({ success: true, message: "OTP sent to your phone number" });
    } catch (e: any) {
      logger.error("send-login-otp error", e);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  // ── Phone OTP Login — Verify ──────────────────────────────────────────────
  app.post("/api/auth/login/verify-otp", otpLoginLimiter, async (req: any, res) => {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP are required" });
      const cleanPhone = phone.trim().replace(/\s+/g, "");

      const approved = await verifyOtp(cleanPhone, String(otp).trim());
      if (!approved) return res.status(400).json({ message: "Invalid or expired OTP" });

      let [user] = await db.select().from(users).where(eq(users.phone, cleanPhone));
      if (!user) return res.status(400).json({ message: "Phone number not registered. Please request a code first." });

      if (!user.phoneVerified) {
        [user] = await db.update(users).set({ phoneVerified: true }).where(eq(users.id, user.id)).returning();
      }

      req.login(makeSessionUser(user.id), (err: any) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        res.json({ success: true, user: { id: user.id, onboardingComplete: user.onboardingComplete } });
      });
    } catch (e: any) {
      logger.error("verify-login-otp error", e);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  app.get("/api/logout", (req: any, res) => {
    req.logout(() => res.json({ success: true }));
  });

  // ── Login redirect — open redirect protected ──────────────────────────────
  app.get("/api/login", (req: any, res) => {
    const returnTo = req.query.returnTo as string;
    const safeReturn = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : null;
    res.redirect(safeReturn ? "/?login=true&returnTo=" + encodeURIComponent(safeReturn) : "/?login=true");
  });
}
