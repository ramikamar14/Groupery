import type { LucideIcon } from "lucide-react";
import { CreditCard, Share2, Package, Star, Zap } from "lucide-react";

export type StatusFilter = "all" | "active" | "completed" | "expired";

export function listingMatchesStatusFilter(listing: { status?: string }, status: StatusFilter): boolean {
  if (status === "all") return true;
  if (status === "expired") return listing.status === "expired" || listing.status === "cancelled";
  return listing.status === status;
}

export function getNextAction(
  listing: any,
  tab: "created" | "joined" | "all",
  isCreator: boolean
): { key: string; icon: LucideIcon; color: string } | null {
  const isFull = listing.filledSlots >= listing.totalSlots;
  const s = listing.status;
  if (isCreator || tab === "created") {
    if (s === "active" && isFull)
      return {
        key: "collectPayments",
        icon: CreditCard,
        color:
          "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800",
      };
    if (s === "active" && !isFull)
      return {
        key: "shareToFill",
        icon: Share2,
        color: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800",
      };
    if (s === "completed")
      return {
        key: "markDeliveries",
        icon: Package,
        color: "text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-300 dark:bg-teal-950/50 dark:border-teal-800",
      };
  } else {
    if (s === "active" && listing.paymentMethod)
      return {
        key: "sendPayment",
        icon: CreditCard,
        color:
          "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800",
      };
    if (s === "active")
      return {
        key: "awaitingUpdates",
        icon: Zap,
        color: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-800",
      };
    if (s === "completed")
      return {
        key: "leaveReview",
        icon: Star,
        color:
          "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-950/50 dark:border-yellow-800",
      };
  }
  return null;
}

export type CardDisplayStatus = "active" | "completed" | "expired" | "cancelled";

export function getCardDisplayStatus(listing: { status?: string }): CardDisplayStatus {
  if (listing.status === "cancelled") return "cancelled";
  if (listing.status === "completed") return "completed";
  if (listing.status === "expired") return "expired";
  return "active";
}
