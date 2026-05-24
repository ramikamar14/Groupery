import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Crown, UserCheck, Clock, Users, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { getCardDisplayStatus, getNextAction, type CardDisplayStatus } from "./group-utils";

function pricesFromListing(listing: any): { price: number; original: number; discountPct: number } {
  const groupCents = listing.pricePerSlot ?? 0;
  const marketCents = listing.marketPrice ?? groupCents;
  const price = groupCents / 100;
  const original = Math.max(marketCents, groupCents) / 100;
  const discountPct =
    marketCents > 0 && marketCents > groupCents ? Math.round((1 - groupCents / marketCents) * 100) : 0;
  return { price, original, discountPct };
}

const statusBadgeClass: Record<CardDisplayStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  completed: "bg-sky-500/20 text-sky-700 dark:text-sky-400 border-sky-500/30",
  expired: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

export function MyGroupCard({
  listing,
  role,
  tab,
}: {
  listing: any;
  role: "creator" | "member";
  tab: "created" | "joined" | "all";
}) {
  const { t } = useTranslation();
  const isCreator = role === "creator";
  const nextAction = getNextAction(listing, tab, isCreator);
  const displayStatus = getCardDisplayStatus(listing);
  const fillPct = Math.min(100, Math.round((listing.filledSlots / Math.max(1, listing.totalSlots)) * 100));
  const { price, original, discountPct } = pricesFromListing(listing);
  const hasPrice = (listing.pricePerSlot ?? 0) > 0;
  const isActive = displayStatus === "active";

  const statusLabel =
    displayStatus === "active"
      ? t("myGroups.active")
      : displayStatus === "completed"
        ? t("myGroups.completed")
        : displayStatus === "cancelled"
          ? t("myGroups.cancelled")
          : t("myGroups.expired");

  return (
    <Link href={`/listings/${listing.id}`} className="block">
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-accent/30 h-full">
        <div className="relative aspect-[4/3] overflow-hidden">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="size-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-primary/10 via-accent/5 to-primary/15 flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-4xl select-none" aria-hidden>📦</span>
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
            <Badge
              className={cn(
                "border backdrop-blur-md shadow-sm",
                isCreator
                  ? "bg-amber-500/90 text-white border-amber-400/50"
                  : "bg-sky-500/90 text-white border-sky-400/50"
              )}
            >
              {isCreator ? (
                <>
                  <Crown className="size-3" />
                  {t("myGroups.organiser")}
                </>
              ) : (
                <>
                  <UserCheck className="size-3" />
                  {t("myGroups.member")}
                </>
              )}
            </Badge>

            {nextAction && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-sm",
                  nextAction.color
                )}
              >
                <nextAction.icon className="size-3" />
                {t(`myGroups.${nextAction.key}`)}
              </span>
            )}
          </div>

          <Badge className={cn("absolute right-3 top-3 border backdrop-blur-md z-10", statusBadgeClass[displayStatus])}>
            {statusLabel}
          </Badge>

          {discountPct > 0 && (
            <div className="absolute bottom-3 right-3 z-10">
              <Badge className="bg-accent text-accent-foreground border-accent/50 font-semibold">-{discountPct}%</Badge>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-card-foreground line-clamp-2 text-balance">{listing.title}</h3>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="size-3" />
                {t("myGroups.membersCount", {
                  current: listing.filledSlots,
                  target: listing.totalSlots,
                })}
              </span>
              <span className="font-medium text-accent">{fillPct}%</span>
            </div>
            <Progress value={fillPct} className="h-1.5 bg-muted" />
          </div>

          {listing.myOrder?.escrowId && (
            <div className={cn(
              "flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg border",
              listing.myOrder.escrowStatus === "released"
                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
                : listing.myOrder.escrowStatus === "refunded"
                ? "bg-muted border-border text-muted-foreground"
                : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400"
            )}>
              <ShieldCheck className="size-3 shrink-0" />
              <span className="font-medium">
                {listing.myOrder.escrowStatus === "released"
                  ? "Funds released"
                  : listing.myOrder.escrowStatus === "refunded"
                  ? "Refunded"
                  : "Held in escrow"}
              </span>
              <span className="opacity-60">· #{listing.myOrder.escrowId.slice(-6)}</span>
            </div>
          )}

          <div className="flex items-baseline justify-between pt-1 gap-2 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-card-foreground">
                {hasPrice ? `$${price.toFixed(2)}` : "—"}
              </span>
              {original > price && (
                <span className="text-sm text-muted-foreground line-through">${original.toFixed(2)}</span>
              )}
            </div>
            {listing.expiresAt && isActive && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="size-3 shrink-0" />
                {formatDistanceToNow(new Date(listing.expiresAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
