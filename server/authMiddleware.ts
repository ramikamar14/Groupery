import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { authStorage } from "./replit_integrations/auth/storage";

// Augment Express Request so TypeScript knows about req.listing
declare global {
  namespace Express {
    interface Request {
      listing?: any;
    }
  }
}

// ── requireAuth ────────────────────────────────────────────────────────────
// Confirms the user is logged in. All other middleware below assume this runs first.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if ((req as any).isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
}

// ── preloadListing ─────────────────────────────────────────────────────────
// Parses req.params.id (400 on NaN), fetches listing from DB (404 if missing),
// attaches result to req.listing so downstream middleware/handlers avoid re-fetching.
export async function preloadListing(req: Request, res: Response, next: NextFunction) {
  const id = Number.parseInt(req.params.id as string, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid listing ID" });
  try {
    const listing = await storage.getListing(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    req.listing = listing;
    return next();
  } catch (err) {
    return next(err);
  }
}

// ── requireListingOwner ───────────────────────────────────────────────────
// Must run after requireAuth + preloadListing.
// Allows ONLY the listing creator. Use for destructive/sensitive mutations.
export function requireListingOwner(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.claims?.sub;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (req.listing!.creatorId !== userId) {
    return res.status(403).json({ message: "Forbidden: only the listing creator can perform this action" });
  }
  return next();
}

// ── requireParticipantOrOwner ─────────────────────────────────────────────
// Must run after requireAuth + preloadListing.
// Allows the listing creator OR any confirmed participant.
// Use for member-only data (group chat, proofs view, contact reveal).
export async function requireParticipantOrOwner(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.claims?.sub;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const listing = req.listing!;
  if (listing.creatorId === userId) return next();
  try {
    const participation = await storage.getParticipation(listing.id, userId);
    if (!participation) {
      return res.status(403).json({ message: "Forbidden: you must be a member of this group" });
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

// ── requireAdmin ───────────────────────────────────────────────────────────
// Confirms the user is an admin (isAdmin flag on DB user record).
// Centralised here so it's consistent across all admin routes.
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
  const userId = (req as any).user?.claims?.sub;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  try {
    const user = await authStorage.getUser(userId);
    // Check both columns for belt-and-suspenders — they are always synced on role change,
    // but this guard ensures a single-column desync cannot grant admin access.
    const isAdmin = user?.isAdmin === true || user?.role === "admin";
    if (!isAdmin) return res.status(403).json({ message: "Forbidden" });
    return next();
  } catch (err) {
    return next(err);
  }
}
