import { Link } from "wouter";
import { Users, MapPin, Clock, Share2, Star, Flame, Timer, Bookmark, BookmarkCheck, CheckCircle, Tag, Sparkles, TrendingUp, Zap, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
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

  let statusBadge = null;
  if (isCompleted) {
    statusBadge = <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10 flex items-center gap-1" data-testid={`badge-completed-${listing.id}`}><CheckCircle className="w-3 h-3" />{t("listing.complete")}</span>;
  } else if (isExpired || listing.status === "expired") {
    statusBadge = <span className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10" data-testid={`badge-expired-${listing.id}`}>{t("listing.expired")}</span>;
  } else if (listing.status === "cancelled") {
    statusBadge = <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10" data-testid={`badge-cancelled-${listing.id}`}>{t("listing.cancelled")}</span>;
  }

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative">
        {statusBadge}

        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          <img
            src={listing.imageUrl || "https://placehold.co/600x400?text=Grouperry"}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

          <div className="absolute bottom-3 left-3 text-white">
            <div className="flex items-center space-x-1 text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full w-fit mb-1">
              <span className="capitalize">{listing.category}</span>
            </div>
          </div>

          {(listing as any).isFeatured && (
            <div className="absolute top-3 left-3 z-10" data-testid={`badge-featured-${listing.id}`}>
              <Badge className="text-xs font-semibold bg-amber-500/90 hover:bg-amber-500/90 text-white border-0 shadow-md gap-1">
                <Sparkles className="w-3 h-3" />
                {t("listing.featured")}
              </Badge>
            </div>
          )}

          {(listing as any).isTrending && !(listing as any).isFeatured && (
            <div className="absolute top-3 left-3 z-10" data-testid={`badge-trending-${listing.id}`}>
              <Badge className="text-xs font-semibold bg-orange-500/90 hover:bg-orange-500/90 text-white border-0 shadow-md gap-1">
                <TrendingUp className="w-3 h-3" />
                {t("listing.trending")}
              </Badge>
            </div>
          )}

          {isAlmostFull && !(listing as any).isFeatured && !(listing as any).isTrending && (
            <div className="absolute top-3 left-3 z-10" data-testid={`badge-almost-full-${listing.id}`}>
              <Badge variant="destructive" className="text-xs font-bold animate-pulse">
                <Flame className="w-3 h-3 mr-1" />
                {t("listing.almostFull")}
              </Badge>
            </div>
          )}

          {isExpiringSoon && !isAlmostFull && !(listing as any).isFeatured && !(listing as any).isTrending && (
            <div className="absolute top-3 left-3 z-10" data-testid={`badge-expiring-soon-${listing.id}`}>
              <Badge variant="secondary" className="text-xs font-bold bg-amber-500 text-white border-amber-600">
                <Timer className="w-3 h-3 mr-1" />
                {t("listing.endingSoon")}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-display font-bold text-lg leading-tight mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1 leading-relaxed">
            {listing.description}
          </p>

          {/* Progress bar with urgency */}
          <div className="mb-3">
            <div className="flex justify-between items-center text-xs font-medium mb-1.5">
              <span className={cn(isAlmostFull ? "text-destructive font-bold" : "text-foreground/80")}>
                {listing.filledSlots} {t("listing.joinedLabel")}
              </span>
              <span className="text-muted-foreground">{t("listing.of")} {listing.totalSlots}</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500 ease-out rounded-full", getProgressColor(percentFilled))}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
            {showSpotsLeft && (
              <p className="text-[11px] font-semibold text-destructive mt-1 flex items-center gap-1" data-testid={`spots-left-${listing.id}`}>
                <Zap className="w-3 h-3" />
                {t("listing.onlySpotsLeft", { count: slotsLeft })}
              </p>
            )}
          </div>

          {/* Price display (P5) */}
          {(listing as any).pricePerSlot && (
            <div className="flex items-center gap-2 mb-3" data-testid={`price-${listing.id}`}>
              <span className="text-sm font-bold text-primary">${((listing as any).pricePerSlot / 100).toFixed(2)}/slot</span>
              {(listing as any).marketPrice && (
                <>
                  <span className="text-xs text-muted-foreground line-through">${((listing as any).marketPrice / 100).toFixed(2)}</span>
                  <Badge variant="secondary" className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5">
                    Save {Math.round((1 - (listing as any).pricePerSlot / (listing as any).marketPrice) * 100)}%
                  </Badge>
                </>
              )}
            </div>
          )}

          {/* Compact creator + tags row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 min-h-[20px]">
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
                <span className="text-muted-foreground/60">({(listing as any).creator.ratingCount})</span>
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
            {(listing as any).tags && (listing as any).tags.length > 0 && (
              <>
                {(listing as any).tags.slice(0, 2).map((tag: any) => (
                  <Badge key={tag.id || tag.tag} variant="secondary" className="text-[10px] px-1.5 py-0" data-testid={`card-tag-${tag.tag}-${listing.id}`}>
                    {tag.tag}
                  </Badge>
                ))}
                {(listing as any).tags.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">+{(listing as any).tags.length - 2}</span>
                )}
              </>
            )}
          </div>

          {/* Footer: location + countdown + actions */}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-3 border-t border-border/50">
            {listing.location && (
              <div className="flex items-center truncate max-w-[40%]">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{listing.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <div className={cn(
                "flex items-center gap-1",
                countdown.urgent ? "text-amber-600 dark:text-amber-400 font-semibold" : ""
              )}>
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>{isExpired ? t("listing.expired") : countdown.label}</span>
              </div>
              {user && (
                <button
                  onClick={handleSaveClick}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                  data-testid={`button-save-${listing.id}`}
                >
                  {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-primary" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                onClick={handleShareClick}
                className="p-1 rounded-full hover:bg-muted transition-colors"
                data-testid={`button-share-${listing.id}`}
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
