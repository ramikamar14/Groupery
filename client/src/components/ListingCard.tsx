import { Link } from "wouter";
import { Users, MapPin, Clock, Share2, Star, Flame, Timer, Bookmark, BookmarkCheck, CheckCircle, Sparkles, TrendingUp, Zap, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, differenceInHours, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import type { ListingWithCreator } from "@shared/schema";
import { RankBadge, computeRank } from "@/components/RankBadge";

interface ListingCardProps {
  listing: ListingWithCreator;
}

function getProgressColor(pct: number): string {
  if (pct >= 95) return "bg-destructive";
  if (pct >= 75) return "bg-amber-500";
  if (pct >= 40) return "bg-primary";
  return "bg-emerald-500";
}

function getCountdownLabel(expiresAt: string | Date, t: (key: string, opts?: any) => string): { label: string; urgent: boolean } {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const hoursLeft = differenceInHours(expiry, now);
  const minsLeft = differenceInMinutes(expiry, now);

  if (minsLeft <= 0) return { label: t("listing.expired"), urgent: false };
  if (hoursLeft < 1) return { label: t("listing.minsLeft", { count: minsLeft }), urgent: true };
  if (hoursLeft < 24) return { label: t("listing.hoursLeft", { count: hoursLeft }), urgent: true };
  const days = Math.floor(hoursLeft / 24);
  if (days <= 2) return { label: t("listing.daysLeft", { count: days }), urgent: true };
  return { label: t("listing.daysLeft", { count: days }), urgent: false };
}

export function ListingCard({ listing }: ListingCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const percentFilled = Math.min(100, Math.round((listing.filledSlots / listing.totalSlots) * 100));
  const isExpired = new Date(listing.expiresAt) < new Date();
  const isCompleted = listing.status === "completed";

  const creatorVerified = (listing as any).creator?.verificationStatus === "verified";
  const reliabilityScore = (listing as any).creator?.reliabilityScore ?? 50;
  const riskLevel = (percentFilled >= 80 || reliabilityScore >= 80)
    ? "low"
    : (percentFilled >= 40 || reliabilityScore >= 60)
    ? "medium"
    : "high";
  const isAlmostFull = percentFilled >= 75 && percentFilled < 100 && listing.status === "active";
  const hoursUntilExpiry = differenceInHours(new Date(listing.expiresAt), new Date());
  const isExpiringSoon = hoursUntilExpiry <= 48 && hoursUntilExpiry > 0 && listing.status === "active";
  const slotsLeft = listing.totalSlots - listing.filledSlots;
  const showSpotsLeft = slotsLeft <= Math.max(3, Math.round(listing.totalSlots * 0.15)) && slotsLeft > 0 && listing.status === "active";
  const countdown = getCountdownLabel(listing.expiresAt, t);
  const savingsPct = (listing as any).pricePerSlot && (listing as any).marketPrice
    ? Math.round((1 - (listing as any).pricePerSlot / (listing as any).marketPrice) * 100)
    : null;

  const { data: savedListings } = useQuery<number[]>({
    queryKey: ["/api/user/saved-listings"],
    queryFn: async () => {
      const res = await fetch("/api/user/saved-listings", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    enabled: !!user,
    select: (data: any) => Array.isArray(data) ? data.map((s: any) => typeof s === "number" ? s : s.listingId) : [],
  });

  const isSaved = savedListings?.includes(listing.id);

  const saveMutation = useMutation({
    mutationFn: async (save: boolean) => {
      const method = save ? "POST" : "DELETE";
      const res = await fetch(`/api/listings/${listing.id}/save`, { method, credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-listings"] });
    },
  });

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: t("listing.signInToSave"), variant: "destructive" }); return; }
    saveMutation.mutate(!isSaved);
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/listings/${listing.id}`;
    try {
      if (navigator.share) { await navigator.share({ title: listing.title, url }); return; }
      await navigator.clipboard.writeText(url);
      toast({ title: t("listing.linkCopied") });
    } catch {}
  };

  return (
    <Link href={`/listings/${listing.id}`} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
      <div className="bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative">

        {/* ── Image area ── */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          <img
            src={listing.imageUrl || "https://placehold.co/600x338?text=Grouperry"}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Scrim for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          {/* Top-left: status badge */}
          {isCompleted ? (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10" data-testid={`badge-completed-${listing.id}`}>
              <CheckCircle className="w-3 h-3" /> {t("listing.complete")}
            </span>
          ) : listing.status === "expired" || isExpired ? (
            <span className="absolute top-3 left-3 bg-neutral-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10" data-testid={`badge-expired-${listing.id}`}>{t("listing.expired")}</span>
          ) : listing.status === "cancelled" ? (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10" data-testid={`badge-cancelled-${listing.id}`}>{t("listing.cancelled")}</span>
          ) : (listing as any).isFeatured ? (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10" data-testid={`badge-featured-${listing.id}`}>
              <Sparkles className="w-3 h-3" /> {t("listing.featured")}
            </span>
          ) : (listing as any).isTrending ? (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10" data-testid={`badge-trending-${listing.id}`}>
              <TrendingUp className="w-3 h-3" /> {t("listing.trending")}
            </span>
          ) : isAlmostFull ? (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse z-10" data-testid={`badge-almost-full-${listing.id}`}>
              <Flame className="w-3 h-3" /> {t("listing.almostFull")}
            </span>
          ) : isExpiringSoon ? (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10" data-testid={`badge-expiring-soon-${listing.id}`}>
              <Timer className="w-3 h-3" /> {t("listing.endingSoon")}
            </span>
          ) : null}

          {/* Top-right: save + share */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
            {user && (
              <button
                onClick={handleSaveClick}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center transition-colors"
                data-testid={`button-save-${listing.id}`}
              >
                {isSaved
                  ? <BookmarkCheck className="w-4 h-4 text-white" />
                  : <Bookmark className="w-4 h-4 text-white" />}
              </button>
            )}
            <button
              onClick={handleShareClick}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center transition-colors"
              data-testid={`button-share-${listing.id}`}
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Bottom-left: category pill */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {listing.category}
            </span>
          </div>

          {/* Bottom-right: savings badge */}
          {savingsPct && savingsPct > 0 && (
            <div className="absolute bottom-3 right-3 z-10" data-testid={`price-savings-${listing.id}`}>
              <span className="text-[11px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full shadow-sm">
                Save {savingsPct}%
              </span>
            </div>
          )}
        </div>

        {/* ── Content area ── */}
        <div className="p-4 flex-1 flex flex-col gap-3">

          {/* Title */}
          <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          {/* Price row */}
          {(listing as any).pricePerSlot && (
            <div className="flex items-center gap-2" data-testid={`price-${listing.id}`}>
              <span className="text-xl font-bold text-primary font-display">
                ${((listing as any).pricePerSlot / 100).toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground">/ person</span>
              {(listing as any).marketPrice && (
                <span className="text-xs text-muted-foreground line-through ml-auto">
                  ${((listing as any).marketPrice / 100).toFixed(0)} retail
                </span>
              )}
            </div>
          )}

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground/80">
                <span className={cn("font-bold", isAlmostFull ? "text-destructive" : "text-foreground")}>{listing.filledSlots}</span>
                <span className="text-muted-foreground"> / {listing.totalSlots} joined</span>
              </span>
              <span className={cn("font-semibold tabular-nums", percentFilled >= 75 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                {percentFilled}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-700 ease-out rounded-full", getProgressColor(percentFilled))}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
            {showSpotsLeft && (
              <p className="text-[11px] font-semibold text-destructive flex items-center gap-1" data-testid={`spots-left-${listing.id}`}>
                <Zap className="w-3 h-3" />
                {slotsLeft <= 3 ? `Only ${slotsLeft} spot${slotsLeft !== 1 ? "s" : ""} left!` : t("listing.onlySpotsLeft", { count: slotsLeft })}
              </p>
            )}
          </div>

          {/* Creator + trust row */}
          <div className="flex items-center gap-1.5 flex-wrap min-h-[20px]">
            {(listing as any).creator && (
              <RankBadge rank={computeRank((listing as any).creator)} size="sm" />
            )}
            {creatorVerified && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-full" data-testid={`badge-creator-verified-${listing.id}`}>
                    <ShieldCheck className="w-3 h-3" />
                    {t("listing.verified", "Verified")}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Identity verified organizer</TooltipContent>
              </Tooltip>
            )}
            {(listing as any).creator?.rating > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground" data-testid={`rating-creator-${listing.id}`}>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {((listing as any).creator.rating as number).toFixed(1)}
              </span>
            )}
            {listing.status === "active" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ml-auto",
                      riskLevel === "low"
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                        : riskLevel === "medium"
                        ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
                        : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800"
                    )}
                    data-testid={`badge-risk-${listing.id}`}
                  >
                    {riskLevel === "low" ? <ShieldCheck className="w-3 h-3" /> : riskLevel === "medium" ? <ShieldQuestion className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {riskLevel === "low" ? t("listing.riskLow", "Low risk") : riskLevel === "medium" ? t("listing.riskMedium", "Med risk") : t("listing.riskHigh", "Higher risk")}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {riskLevel === "low" ? "Well-established group with strong fill rate" : riskLevel === "medium" ? "Group building momentum" : "New or slow-filling group — verify before joining"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Footer: location + countdown */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/40 mt-auto">
            {listing.location ? (
              <div className="flex items-center min-w-0 flex-1">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{listing.location}</span>
              </div>
            ) : <div className="flex-1" />}
            <div className={cn(
              "flex items-center gap-1 shrink-0",
              countdown.urgent ? "text-amber-600 dark:text-amber-400 font-semibold" : ""
            )}>
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span className="whitespace-nowrap">{isExpired ? t("listing.expired") : countdown.label}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
