import { Link } from "wouter";
import { MapPin, Clock, Share2, Star, Bookmark, BookmarkCheck, CheckCircle, ShieldCheck, ShieldAlert, ShieldQuestion, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInHours, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import type { ListingWithCreator } from "@shared/schema";
import { RankBadge, computeRank } from "@/components/RankBadge";

interface ListingCardProps {
  listing: ListingWithCreator;
}

function getCountdownLabel(expiresAt: string | Date, t: (key: string, opts?: any) => string): { label: string; urgent: boolean } {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const hoursLeft = differenceInHours(expiry, now);
  const minsLeft = differenceInMinutes(expiry, now);
  if (minsLeft <= 0) return { label: t("listing.expired"), urgent: false };
  if (hoursLeft < 1) return { label: `${minsLeft}m left`, urgent: true };
  if (hoursLeft < 24) return { label: `${hoursLeft}h left`, urgent: true };
  const days = Math.floor(hoursLeft / 24);
  if (days <= 2) return { label: `${days}d left`, urgent: true };
  return { label: `${days} days left`, urgent: false };
}

/** Momentum-style segmented slot meter */
function SlotMeter({ filled, total, big = false }: { filled: number; total: number; big?: boolean }) {
  const cells = Math.min(total, 20); // cap display at 20 segments
  const scale = total > 20 ? filled / total : 1;
  const filledCells = total > 20 ? Math.round((filled / total) * 20) : filled;
  const h = big ? 20 : 14;
  const r = big ? 6 : 5;
  const gap = cells > 16 ? 3 : 4;

  return (
    <div style={{ display: "flex", gap }}>
      {Array.from({ length: cells }).map((_, i) => {
        const isFilled = i < filledCells;
        const isNext = i === filledCells;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: h,
              borderRadius: r,
              transition: `all 0.45s cubic-bezier(0.2,0.8,0.2,1)`,
              transitionDelay: `${i * 30}ms`,
              background: isFilled
                ? "linear-gradient(180deg,#8b5cf6,#6d28d9)"
                : isNext
                ? "#fff"
                : "#ede9fe",
              border: isNext ? "1.5px dashed #c4b5fd" : "1.5px solid transparent",
              boxShadow: isFilled ? "0 3px 8px -2px rgba(109,40,217,0.5)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

export function ListingCard({ listing }: ListingCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const percentFilled = Math.min(100, Math.round((listing.filledSlots / listing.totalSlots) * 100));
  const isExpired = new Date(listing.expiresAt) < new Date();
  const isCompleted = listing.status === "completed";
  const slotsLeft = listing.totalSlots - listing.filledSlots;
  const countdown = getCountdownLabel(listing.expiresAt, t);
  const savingsPct =
    (listing as any).pricePerSlot && (listing as any).marketPrice && (listing as any).marketPrice > (listing as any).pricePerSlot
      ? Math.round((1 - (listing as any).pricePerSlot / (listing as any).marketPrice) * 100)
      : null;
  const creatorVerified = (listing as any).creator?.verificationStatus === "verified";
  const reliabilityScore = (listing as any).creator?.reliabilityScore ?? 50;
  const riskLevel =
    percentFilled >= 80 || reliabilityScore >= 80 ? "low" : percentFilled >= 40 || reliabilityScore >= 60 ? "medium" : "high";
  const isActive = listing.status === "active" && !isExpired;

  const { data: savedListings } = useQuery<number[]>({
    queryKey: ["/api/user/saved-listings"],
    queryFn: async () => {
      const res = await fetch("/api/user/saved-listings", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    enabled: !!user,
    select: (data: any) => (Array.isArray(data) ? data.map((s: any) => (typeof s === "number" ? s : s.listingId)) : []),
  });
  const isSaved = savedListings?.includes(listing.id);

  const saveMutation = useMutation({
    mutationFn: async (save: boolean) => {
      const res = await fetch(`/api/listings/${listing.id}/save`, {
        method: save ? "POST" : "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/user/saved-listings"] }),
  });

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: t("listing.signInToSave"), variant: "destructive" }); return; }
    saveMutation.mutate(!isSaved);
  };

  const handleShare = async (e: React.MouseEvent) => {
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
      <div className="bg-white dark:bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative"
        style={{ boxShadow: "0 6px 20px -6px rgba(109,40,217,0.10), 0 2px 6px rgba(25,19,32,0.05)" }}>

        {/* ── Image / tile area ─────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ height: 130 }}>
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="gp-img-tile w-full h-full">
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fff", boxShadow: "0 6px 18px -6px rgba(109,40,217,.4)", display: "grid", placeItems: "center", color: "var(--v-700)", fontWeight: 800, fontSize: 18 }}>
                {listing.title.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>
                product shot
              </span>
            </div>
          )}

          {/* Dark overlay for readability */}
          {listing.imageUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />}

          {/* LIVE chip — top left */}
          {isActive && (
            <span className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-red-500 text-white text-[10.5px] font-bold px-2 py-1 rounded-full"
              data-testid={`badge-live-${listing.id}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}
          {isCompleted && (
            <span className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-emerald-500 text-white text-[10.5px] font-bold px-2 py-1 rounded-full"
              data-testid={`badge-completed-${listing.id}`}>
              <CheckCircle className="w-3 h-3" /> Done
            </span>
          )}
          {(isExpired || listing.status === "expired") && !isCompleted && (
            <span className="absolute top-2.5 left-2.5 z-10 bg-neutral-500 text-white text-[10.5px] font-bold px-2 py-1 rounded-full"
              data-testid={`badge-expired-${listing.id}`}>Expired</span>
          )}
          {listing.status === "cancelled" && (
            <span className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white text-[10.5px] font-bold px-2 py-1 rounded-full"
              data-testid={`badge-cancelled-${listing.id}`}>Cancelled</span>
          )}

          {/* Save / share — top right */}
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            {user && (
              <button onClick={handleSave}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center transition-colors"
                data-testid={`button-save-${listing.id}`}>
                {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-white" /> : <Bookmark className="w-3.5 h-3.5 text-white" />}
              </button>
            )}
            <button onClick={handleShare}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center transition-colors"
              data-testid={`button-share-${listing.id}`}>
              <Share2 className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Savings disc — bottom right, rotated -8deg */}
          {savingsPct && savingsPct > 0 && isActive && (
            <div className="absolute z-10" style={{ right: 13, bottom: -20 }}
              data-testid={`savings-disc-${listing.id}`}>
              <div style={{
                width: 50, height: 50, borderRadius: "50%",
                background: "linear-gradient(135deg,#059669,#0d9488)", color: "#fff",
                display: "grid", placeItems: "center", transform: "rotate(-8deg)",
                boxShadow: "0 8px 20px -6px rgba(5,150,105,0.6)", border: "3px solid #fff", lineHeight: 1,
              }}>
                <div className="text-center">
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{savingsPct}%</div>
                  <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.06em" }}>OFF</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Card body ─────────────────────────────────────────── */}
        <div className="p-4 flex-1 flex flex-col gap-3" style={{ paddingTop: savingsPct && isActive ? 28 : 16 }}>

          {/* Category + countdown row */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">{listing.category}</span>
            <span className={cn(
              "flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full",
              countdown.urgent
                ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                : "bg-muted text-muted-foreground"
            )}>
              <Clock className="w-3 h-3" /> {isExpired ? "Expired" : countdown.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors" style={{ letterSpacing: "-0.02em" }}>
            {listing.title}
          </h3>

          {/* Urgency signal — only X spots left */}
          {isActive && slotsLeft > 0 && slotsLeft <= 3 && (
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11.5, fontWeight:700, color:"#e23744", background:"#fff1f2", borderRadius:8, padding:"3px 8px", width:"fit-content" }}
              data-testid={`urgency-spots-${listing.id}`}>
              🔥 Only {slotsLeft} spot{slotsLeft === 1 ? "" : "s"} left!
            </div>
          )}

          {/* Slot meter */}
          <SlotMeter filled={listing.filledSlots} total={listing.totalSlots} />

          {/* Progress stats + price */}
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[13.5px] font-semibold">
              <span className="text-primary font-bold" style={{ fontSize: 17 }}>{listing.filledSlots}</span>
              <span className="text-muted-foreground font-medium"> in ·{" "}</span>
              {slotsLeft > 0
                ? <><span className="font-bold">{slotsLeft}</span> <span className="text-muted-foreground text-[12px]">to unlock</span></>
                : <span className="text-emerald-600 font-bold text-[12px]">Full!</span>
              }
            </span>
            {(listing as any).pricePerSlot && (
              <span className="flex items-baseline gap-1.5" data-testid={`price-${listing.id}`}>
                <span className="text-[20px] font-extrabold text-primary" style={{ letterSpacing: "-0.02em" }}>
                  ${((listing as any).pricePerSlot / 100).toFixed(0)}
                </span>
                {(listing as any).marketPrice && (
                  <span className="text-[12px] text-muted-foreground line-through">
                    ${((listing as any).marketPrice / 100).toFixed(0)}
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Viewer count + "ends soon" urgency chip row */}
          {isActive && ((listing as any).viewCount > 2 || (countdown.urgent && differenceInHours(new Date(listing.expiresAt), new Date()) < 6)) && (
            <div className="flex items-center gap-2 flex-wrap">
              {(listing as any).viewCount > 2 && (
                <span className="flex items-center gap-1 text-[10.5px] text-muted-foreground" data-testid={`viewers-${listing.id}`}>
                  <Users className="w-3 h-3" /> {(listing as any).viewCount} viewing
                </span>
              )}
              {countdown.urgent && differenceInHours(new Date(listing.expiresAt), new Date()) < 6 && (
                <span style={{ fontSize:10.5, fontWeight:700, color:"#d97706", background:"#fffbeb", borderRadius:8, padding:"2px 6px" }}
                  data-testid={`urgency-expiry-${listing.id}`}>
                  ⏰ Ends soon
                </span>
              )}
            </div>
          )}

          {/* Creator + trust row */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-border/40 mt-auto">
            {(listing as any).creator && (
              <RankBadge rank={computeRank((listing as any).creator)} size="sm" />
            )}
            {creatorVerified && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-full"
                    data-testid={`badge-creator-verified-${listing.id}`}>
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Identity-verified organiser</TooltipContent>
              </Tooltip>
            )}
            {(listing as any).creator?.rating > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground" data-testid={`rating-creator-${listing.id}`}>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {((listing as any).creator.rating as number).toFixed(1)}
              </span>
            )}
            {listing.location && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground ml-auto truncate max-w-[100px]">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{listing.location}</span>
              </span>
            )}
            {isActive && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
                    !listing.location && "ml-auto",
                    riskLevel === "low"
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                      : riskLevel === "medium"
                      ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
                      : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800"
                  )} data-testid={`badge-risk-${listing.id}`}>
                    {riskLevel === "low" ? <ShieldCheck className="w-3 h-3" /> : riskLevel === "medium" ? <ShieldQuestion className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {riskLevel === "low" ? "Low risk" : riskLevel === "medium" ? "Med risk" : "Higher risk"}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {riskLevel === "low" ? "Well-established group" : riskLevel === "medium" ? "Group building momentum" : "Verify before joining"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
