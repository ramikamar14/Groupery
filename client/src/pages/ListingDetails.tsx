import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { useListing, useJoinListing, useLeaveListing, useUpdateListingStatus } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import { useListingContext } from "@/hooks/use-listing-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Users, MapPin, CheckCircle2, AlertCircle, Flag, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Share2, Star, CheckCircle, Award, Trophy, Shield, ShieldCheck, Tag, Clock, Zap, PartyPopper, Info, Package, Truck, TrendingUp, CreditCard, Copy, CheckCheck, Monitor, Edit2, Eye, PlusCircle, Gift, BadgeCheck, RefreshCcw, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow, differenceInHours, differenceInDays, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { track } from "@/lib/analytics";
import confetti from "canvas-confetti";
import { ChatInterface } from "@/components/listing/ChatInterface";
import { ParticipantsManagement } from "@/components/listing/ParticipantsManagement";
import { ReviewSection } from "@/components/listing/ReviewSection";
import { AnnouncementsSection } from "@/components/listing/AnnouncementsSection";
import { SimilarDealsSection } from "@/components/listing/SimilarDealsSection";
import { EditHistorySection } from "@/components/listing/EditHistorySection";
import { MilestoneTracker } from "@/components/listing/MilestoneTracker";
import { DealProofSection } from "@/components/listing/DealProofSection";
import { DisputeButton } from "@/components/listing/DisputeButton";
import { api } from "@shared/routes";

/** Momentum-style segmented slot meter for the detail page */
function SlotMeterDetail({ filled, total }: { filled: number; total: number }) {
  const cells = Math.min(total, 20);
  const filledCells = total > 20 ? Math.round((filled / total) * 20) : filled;
  return (
    <div style={{ display:"flex", gap:5 }}>
      {Array.from({ length: cells }).map((_, i) => {
        const isFilled = i < filledCells;
        const isNext = i === filledCells;
        return (
          <div key={i} style={{
            flex:1, height:20, borderRadius:7,
            transition:`all 0.45s cubic-bezier(0.2,0.8,0.2,1)`,
            transitionDelay:`${i*30}ms`,
            background: isFilled ? "linear-gradient(180deg,#8b5cf6,#6d28d9)" : isNext ? "#fff" : "#ede9fe",
            border: isNext ? "1.5px dashed #c4b5fd" : "1.5px solid transparent",
            boxShadow: isFilled ? "0 3px 8px -2px rgba(109,40,217,0.5)" : "none",
          }} />
        );
      })}
    </div>
  );
}

export default function ListingDetails() {
  const [match, params] = useRoute("/listings/:id");
  const id = parseInt(params?.id || "0");
  const { user } = useAuth();
  const { t } = useTranslation();
  const { setListingCtx } = useListingContext();
  
  const { data: listing, isLoading } = useListing(id);
  const { toast } = useToast();
  const joinMutation = useJoinListing();
  const leaveMutation = useLeaveListing();
  
  useEffect(() => {
    if (id) {
      fetch(`/api/listings/${id}/view`, { method: "POST", credentials: "include" }).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (listing) {
      setListingCtx({
        id: listing.id,
        title: listing.title,
        category: listing.category,
        slotsLeft: listing.totalSlots - listing.filledSlots,
        totalSlots: listing.totalSlots,
        expiresAt: listing.expiresAt,
        location: listing.location ?? undefined,
        pricePerSlot: (listing as any).pricePerSlot ?? null,
        marketPrice: (listing as any).marketPrice ?? null,
      });
    }
    return () => setListingCtx(null);
  }, [listing, setListingCtx]);

  // SEO: dynamic page title + Open Graph meta for listing pages
  useEffect(() => {
    // Snapshot original meta content (hoisted so the cleanup can restore it) to
    // avoid leaking this listing's title/description/image onto other SPA pages.
    const originalMeta: Array<{ el: HTMLMetaElement; prev: string | null }> = [];
    if (listing) {
      const price = (listing as any).pricePerSlot
        ? ` — $${((listing as any).pricePerSlot / 100).toFixed(0)}/person`
        : "";
      const slots = `${listing.totalSlots - listing.filledSlots} slots left`;
      document.title = `${listing.title}${price} · ${slots} | Grouperry`;

      const setMeta = (name: string, content: string, prop?: boolean) => {
        const selector = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let el = document.querySelector(selector) as HTMLMetaElement;
        if (!el) {
          el = document.createElement("meta");
          prop ? el.setAttribute("property", name) : el.setAttribute("name", name);
          document.head.appendChild(el);
        }
        originalMeta.push({ el, prev: el.getAttribute("content") });
        el.setAttribute("content", content);
      };

      const desc = listing.description
        ? listing.description.slice(0, 155) + (listing.description.length > 155 ? "…" : "")
        : `Join this group deal on Grouperry. ${listing.totalSlots} slots, ${listing.filledSlots} filled.`;

      setMeta("description", desc);
      setMeta("og:title", listing.title, true);
      setMeta("og:description", desc, true);
      setMeta("og:type", "product", true);
      if ((listing as any).imageUrl) setMeta("og:image", (listing as any).imageUrl, true);

      // Canonical URL
      const canonicalHref = `${window.location.origin}/listings/${listing.id}`;
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", canonicalHref);

      // JSON-LD structured data (Product + Offer) for rich search results
      const priceCents = (listing as any).pricePerSlot ?? 0;
      const slotsLeft = listing.totalSlots - listing.filledSlots;
      const ratingCount = (listing as any).creator?.ratingCount ?? 0;
      const ratingValue = (listing as any).creator?.rating ?? 0;
      const ld: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: desc,
        ...((listing as any).imageUrl ? { image: (listing as any).imageUrl } : {}),
        offers: {
          "@type": "Offer",
          url: canonicalHref,
          priceCurrency: "USD",
          price: (priceCents / 100).toFixed(2),
          availability:
            slotsLeft > 0 && listing.status === "active"
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      };
      if (ratingCount > 0 && ratingValue > 0) {
        ld.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: Number(ratingValue).toFixed(1),
          reviewCount: ratingCount,
        };
      }
      let ldScript = document.getElementById("listing-jsonld") as HTMLScriptElement | null;
      if (!ldScript) {
        ldScript = document.createElement("script");
        ldScript.id = "listing-jsonld";
        ldScript.type = "application/ld+json";
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(ld);
    }
    return () => {
      document.title = "Grouperry — Group Buying, Made Simple";
      // Restore meta tags to their pre-listing values (or clear if newly added)
      for (const { el, prev } of originalMeta) {
        if (prev === null) el.removeAttribute("content");
        else el.setAttribute("content", prev);
      }
      document.getElementById("listing-jsonld")?.remove();
      document.querySelector('link[rel="canonical"]')?.remove();
    };
  }, [listing]);

  const { data: creatorReliability } = useQuery<{ score: number; badges: string[] }>({
    queryKey: ["/api/users", listing?.creatorId, "reliability"],
    queryFn: async () => {
      if (!listing?.creatorId) return null;
      const res = await fetch(`/api/users/${listing.creatorId}/reliability`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!listing?.creatorId,
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationFiredRef = useRef(false);
  const [showJoinCoach, setShowJoinCoach] = useState(false);
  const prevParticipantRef = useRef(false);
  const isCreator = user?.id === listing?.creatorId;
  const isParticipant = listing?.participants?.some((p: any) => p.userId === user?.id);
  const isCoOrganizer = listing?.participants?.some((p: any) => p.userId === user?.id && p.role === "co-organizer");
  const canManage = isCreator || isCoOrganizer;
  const isFull = listing?.filledSlots >= listing?.totalSlots;
  const isExpired = listing?.status === "expired" || (listing?.expiresAt && new Date(listing.expiresAt) < new Date());
  const isActive = listing?.status === "active" && !isExpired;
  const isCompleted = listing?.status === "completed";
  const canChat = isParticipant || isCreator;

  const { data: waitlistData } = useQuery<{ count: number; isOnWaitlist: boolean; position: number | null }>({
    queryKey: ["/api/listings", id, "waitlist"],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${id}/waitlist`, { credentials: "include" });
      if (!res.ok) return { count: 0, isOnWaitlist: false, position: null };
      return res.json();
    },
    enabled: !!listing && isFull && !isParticipant && !isCreator && isActive,
    refetchInterval: 30000,
  });

  const joinWaitlistMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/listings/${id}/waitlist`, {});
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", id, "waitlist"] });
      toast({ title: t("listing.waitlistJoined", "Added to waitlist"), description: t("listing.waitlistJoinedDesc", "You'll be notified when a slot opens.") });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const leaveWaitlistMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/listings/${id}/waitlist`, {});
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", id, "waitlist"] });
      toast({ title: t("listing.waitlistLeft", "Left waitlist") });
    },
  });

  const [presenceSessionId] = useState(() => {
    const k = "grouperry_sid";
    let sid = sessionStorage.getItem(k);
    if (!sid) { sid = Math.random().toString(36).slice(2); sessionStorage.setItem(k, sid); }
    return sid;
  });

  const { data: presenceData } = useQuery<{ viewing: number }>({
    queryKey: ["/api/listings", id, "presence"],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${id}/presence`, { credentials: "include" });
      if (!res.ok) return { viewing: 0 };
      return res.json();
    },
    enabled: !!id && isActive,
    refetchInterval: 20_000,
  });

  useEffect(() => {
    if (!id || !isActive) return;
    const ping = () => {
      fetch(`/api/listings/${id}/presence/ping`, {
        method: "POST",
        headers: { "x-session-id": presenceSessionId },
        credentials: "include",
      }).catch(() => {});
    };
    ping();
    const timer = setInterval(ping, 15_000);
    return () => clearInterval(timer);
  }, [id, isActive, presenceSessionId]);

  useEffect(() => {
    if (!listing || !user) return;
    const nowParticipant = listing.participants?.some((p: any) => p.userId === user.id);
    if (!prevParticipantRef.current && nowParticipant) {
      setShowJoinCoach(true);
    }
    prevParticipantRef.current = !!nowParticipant;
  }, [listing, user]);

  useEffect(() => {
    if (!listing || celebrationFiredRef.current) return;
    const isGroupComplete = listing.filledSlots >= listing.totalSlots;
    const celebrationKey = `celebration-seen-${id}`;
    const alreadySeen = localStorage.getItem(celebrationKey);
    if (isGroupComplete && !alreadySeen) {
      setShowCelebration(true);
      celebrationFiredRef.current = true;
      localStorage.setItem(celebrationKey, "true");
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ["#7c3aed", "#6d28d9", "#a78bfa", "#059669", "#f59e0b"],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ["#7c3aed", "#6d28d9", "#a78bfa", "#059669", "#f59e0b"],
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      setTimeout(() => setShowCelebration(false), 8000);
    }
  }, [listing, id]);

  const { data: escrowData, refetch: refetchEscrow } = useQuery<{ escrow: { id: string; status: string; amount?: number } | null }>({
    queryKey: ["/api/listings", id, "escrow"],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${id}/escrow`, { credentials: "include" });
      if (!res.ok) return { escrow: null };
      return res.json();
    },
    enabled: !!user && !!isParticipant && !isCreator,
    staleTime: 60_000,
  });

  const releaseEscrowMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/listings/${id}/escrow/release`, { method: "POST", credentials: "include" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Funds released", description: "Payment has been released to the seller." });
      refetchEscrow();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!listing) return <Layout><div className="text-center py-10">{t("listing.notFound")}</div></Layout>;

  const allImages = buildImageList(listing);

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] lg:grid-cols-3 gap-6 lg:gap-8 h-full">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/50">
            <ImageGallery images={allImages} title={listing.title} category={listing.category} status={listing.status} />

            {(isCompleted || isFull) && (
              <div
                style={{
                  margin:"24px 24px 0",
                  padding:"14px 20px",
                  borderRadius:16,
                  display:"flex",
                  alignItems:"center",
                  gap:14,
                  background: showCelebration ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "#f5f3ff",
                  border: showCelebration ? "none" : "1px solid #c4b5fd",
                  transition:"all 0.4s",
                }}
                data-testid="banner-completion"
              >
                <div style={{ fontSize:28, flexShrink:0 }}>{showCelebration ? "🎉" : "✅"}</div>
                <div>
                  <p style={{ fontWeight:800, fontSize:15, color: showCelebration ? "#fff" : "#4c1d95", margin:0 }}>
                    {showCelebration ? "🎊 Group complete — price unlocked!" : t("listing.groupCompleteStatic")}
                  </p>
                  <p style={{ fontSize:12, color: showCelebration ? "rgba(255,255,255,0.85)" : "#7c3aed", margin:"2px 0 0" }}>
                    {t("listing.allSlotsFilled", { slots: listing.totalSlots })}
                  </p>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">{listing.title}</h1>

              {/* Organiser recovery banner — expired without filling */}
              {isExpired && isCreator && listing.filledSlots < listing.totalSlots && (
                <div className="mb-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-4" data-testid="banner-expired-organiser">
                  <p className="font-bold text-amber-900 dark:text-amber-100 text-sm mb-1">This deal expired without filling.</p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-300/70 mb-3">
                    {listing.filledSlots} of {listing.totalSlots} slots filled. You can extend the deadline to give it more time, or share it to bring in the remaining members.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="border-amber-400 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200"
                      onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied", description: "Share it to revive interest." }); }}
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share to revive
                    </Button>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => document.querySelector<HTMLButtonElement>('[data-testid="button-extend-deadline"]')?.click()}
                    >
                      <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Extend deadline
                    </Button>
                  </div>
                </div>
              )}

              {/* Urgency badge — shown when very few slots or hours left */}
              {isActive && (() => {
                const slotsLeft = listing.totalSlots - listing.filledSlots;
                const hoursLeft = differenceInHours(new Date(listing.expiresAt), new Date());
                const pct = listing.totalSlots > 0 ? Math.round((listing.filledSlots / listing.totalSlots) * 100) : 0;
                const showUrgency = (slotsLeft <= 3 && slotsLeft > 0) || (hoursLeft <= 9 && hoursLeft > 0);
                if (!showUrgency) return null;
                return (
                  <div
                    data-testid="badge-urgency"
                    className="gp-chip gp-chip-live mb-3"
                    style={{ display:"inline-flex", background:"linear-gradient(90deg,var(--red-c),#b91c1c)", color:"#fff", fontWeight:700, fontSize:12, padding:"5px 12px", borderRadius:999, gap:6 }}
                  >
                    🔥 {pct}% full{hoursLeft > 0 && hoursLeft <= 9 ? ` · ${hoursLeft}h left` : ""}
                    {slotsLeft <= 3 && slotsLeft > 0 ? ` · ${slotsLeft} spot${slotsLeft === 1 ? "" : "s"} left` : ""}
                  </div>
                );
              })()}

              {/* Share row */}
              <ShareRow listing={listing} />

              {/* Price / savings hero box (Momentum style) */}
              {(listing as any).pricePerSlot && (
                <div
                  data-testid="price-display"
                  style={{ background:"#f5f3ff", border:"1px solid #ede9fe", borderRadius:16, padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}
                >
                  <div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                      <span style={{ fontSize:32, fontWeight:800, color:"#6d28d9", letterSpacing:"-0.03em", lineHeight:1 }}>
                        ${((listing as any).pricePerSlot / 100).toFixed(2)}
                      </span>
                      <span style={{ fontSize:14, color:"#9ca3af", fontWeight:500 }}>/slot</span>
                      {(listing as any).marketPrice && (
                        <span style={{ fontSize:14, color:"#9ca3af", textDecoration:"line-through" }}>
                          ${((listing as any).marketPrice / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {(listing as any).marketPrice && (listing as any).marketPrice > (listing as any).pricePerSlot && (
                      <div style={{ fontSize:12, color:"#059669", fontWeight:700, marginTop:4 }}>
                        You save ${(((listing as any).marketPrice - (listing as any).pricePerSlot) / 100).toFixed(2)} per slot with this group
                      </div>
                    )}
                  </div>
                  {(listing as any).marketPrice && (listing as any).marketPrice > (listing as any).pricePerSlot && (
                    <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#059669,#0d9488)", color:"#fff", display:"grid", placeItems:"center", transform:"rotate(-8deg)", boxShadow:"0 8px 20px -6px rgba(5,150,105,0.5)", border:"3px solid #fff", lineHeight:1, flexShrink:0 }}>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:14, fontWeight:800 }}>
                          {Math.round((1 - (listing as any).pricePerSlot / (listing as any).marketPrice) * 100)}%
                        </div>
                        <div style={{ fontSize:7.5, fontWeight:700, letterSpacing:"0.06em" }}>OFF</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-6">
                <div className="flex items-center" data-testid="text-slots-filled">
                  <Users className="w-4 h-4 mr-2" />
                  {listing.filledSlots} / {listing.totalSlots} {t("listing.slotsFilled")}
                </div>
                {listing.viewCount > 0 && (
                  <div className="flex items-center" data-testid="text-view-count">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {listing.viewCount} {t("listing.views")}
                  </div>
                )}
                {listing.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {listing.location}
                  </div>
                )}
                <div className={cn(
                  "flex items-center font-medium",
                  (() => {
                    const hoursLeft = differenceInHours(new Date(listing.expiresAt), new Date());
                    if (hoursLeft < 0) return "text-gray-500";
                    if (hoursLeft < 24) return "text-destructive";
                    if (hoursLeft < 72) return "text-amber-600 dark:text-amber-400";
                    return "text-muted-foreground font-normal";
                  })()
                )} data-testid="text-expiry-countdown">
                  <Clock className="w-4 h-4 mr-2" />
                  {(() => {
                    const now = new Date();
                    const expiry = new Date(listing.expiresAt);
                    const minsLeft = differenceInMinutes(expiry, now);
                    if (minsLeft <= 0) return t("listing.expired");
                    const hoursLeft = differenceInHours(expiry, now);
                    if (hoursLeft < 1) return t("listing.minsLeft", { count: minsLeft });
                    if (hoursLeft < 24) return t("listing.hoursLeft", { count: hoursLeft });
                    const daysLeft = differenceInDays(expiry, now);
                    if (daysLeft <= 2) return t("listing.daysLeft", { count: daysLeft });
                    return format(expiry, "MMM d, yyyy");
                  })()}
                </div>
              </div>

              <p className="text-lg leading-relaxed mb-4">{listing.description}</p>

              {listing.tags && listing.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6" data-testid="listing-tags">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {listing.tags.map((t: any) => (
                    <Badge key={t.id || t.tag} variant="secondary" className="text-xs" data-testid={`tag-badge-${t.tag}`}>
                      {t.tag}
                    </Badge>
                  ))}
                </div>
              )}

              {listing.creator && (
                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl mb-6" data-testid="creator-info">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={listing.creator.profileImageUrl || undefined} />
                    <AvatarFallback>{listing.creator.firstName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{listing.creator.firstName} {listing.creator.lastName}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {creatorReliability?.badges?.includes("verified") && (
                        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-950/50">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t("listing.verified")}
                        </Badge>
                      )}
                      {creatorReliability?.badges?.includes("trusted") && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/50">
                          <Award className="w-3 h-3 mr-1" />
                          {t("listing.trusted")}
                        </Badge>
                      )}
                      {creatorReliability?.badges?.includes("top_organizer") && (
                        <Badge variant="outline" className="border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-950/50">
                          <Trophy className="w-3 h-3 mr-1" />
                          {t("listing.topOrganizer")}
                        </Badge>
                      )}
                      {creatorReliability && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer" data-testid="text-creator-reliability">
                              <Shield className="w-3 h-3" />
                              {creatorReliability.score}/100 {t("listing.reliability")}
                              <Info className="w-3 h-3 opacity-60" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-4 space-y-3" side="top">
                            <div>
                              <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> {t("listing.reliabilityScore")}</h4>
                              <p className="text-xs text-muted-foreground">{t("listing.reliabilityDesc")}</p>
                            </div>
                            <div className="space-y-2">
                              {[
                                { label: t("listing.completionRate"), desc: t("listing.completionRateDesc"), icon: CheckCircle },
                                { label: t("listing.memberReviews"), desc: t("listing.memberReviewsDesc"), icon: Star },
                                { label: t("listing.activityHistory"), desc: t("listing.activityHistoryDesc"), icon: TrendingUp },
                                { label: t("listing.responseRate"), desc: t("listing.responseRateDesc"), icon: Zap },
                              ].map(({ label, desc, icon: Icon }) => (
                                <div key={label} className="flex items-start gap-2.5">
                                  <Icon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold">{label}</p>
                                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", creatorReliability.score >= 80 ? "bg-emerald-500" : creatorReliability.score >= 60 ? "bg-amber-500" : "bg-destructive")} style={{ width: `${creatorReliability.score}%` }} />
                            </div>
                            <p className="text-[10px] text-center text-muted-foreground">Score: {creatorReliability.score}/100 · {creatorReliability.score >= 80 ? t("listing.excellent") : creatorReliability.score >= 60 ? t("listing.good") : t("listing.buildingTrust")}</p>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Who has joined — participant avatars */}
              {listing.participants && listing.participants.length > 0 && (
                <div className="flex items-center gap-3 mb-4" data-testid="panel-participants">
                  <div className="flex -space-x-2 shrink-0">
                    {listing.participants.slice(0, 5).map((p: any) => (
                      <Avatar key={p.userId} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={p.user?.profileImageUrl} />
                        <AvatarFallback className="text-xs">{p.user?.firstName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                    ))}
                    {listing.participants.length > 5 && (
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        +{listing.participants.length - 5}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{listing.participants.length}</span>{" "}
                    {listing.participants.length === 1 ? t("listing.personJoined", "person has joined") : t("listing.peopleJoined", "people have joined")}
                    {listing.participants.filter((p: any) => p.user?.verificationStatus === "verified").length > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {" · "}{listing.participants.filter((p: any) => p.user?.verificationStatus === "verified").length} {t("listing.verified", "verified")}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4" data-testid="trust-badges">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30">
                  <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{t("listing.coordinationPlatform")}</p>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/70 mt-0.5 leading-relaxed">{t("listing.coordinationPlatformDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30">
                  <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">{t("listing.trustedGroup")}</p>
                    <p className="text-[11px] text-blue-700/80 dark:text-blue-400/70 mt-0.5 leading-relaxed">{t("listing.trustedGroupDesc")}</p>
                  </div>
                </div>
              </div>

              {/* Group Trust Signals */}
              {(() => {
                const participants = listing.participants ?? [];
                const verifiedParticipants = participants.filter((p: any) => p.user?.verificationStatus === "verified").length;
                const totalParticipants = participants.length;
                const fillPct = listing.totalSlots > 0 ? Math.round((listing.filledSlots / listing.totalSlots) * 100) : 0;
                const creatorScore = creatorReliability?.score ?? 50;
                const trustScore = Math.min(100, Math.round(
                  (creatorReliability?.badges?.includes("verified") ? 20 : 0) +
                  (fillPct * 0.5) +
                  (totalParticipants > 0 ? (verifiedParticipants / totalParticipants) * 20 : 0) +
                  Math.min(creatorScore * 0.1, 10)
                ));
                const trustLabel = trustScore >= 70 ? t("listing.trustHigh", "High trust") : trustScore >= 45 ? t("listing.trustMedium", "Building trust") : t("listing.trustLow", "Low trust");
                const trustColor = trustScore >= 70 ? "bg-emerald-500" : trustScore >= 45 ? "bg-amber-500" : "bg-red-500";
                return (
                  <div className="mb-6 p-3 rounded-xl border border-border/60 bg-secondary/30 space-y-2.5" data-testid="panel-group-trust">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground/80">{t("listing.groupTrust", "Group trust")}</p>
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", trustScore >= 70 ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400" : trustScore >= 45 ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400" : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400")} data-testid="text-trust-label">{trustLabel}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", trustColor)} style={{ width: `${trustScore}%` }} data-testid="bar-trust-score" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span data-testid="text-verified-participants">
                        <CheckCircle2 className="w-3 h-3 inline mr-0.5 text-emerald-500" />
                        {verifiedParticipants} {t("listing.verifiedParticipants", "verified")} / {totalParticipants} {t("listing.participants", "members")}
                      </span>
                      <span>{fillPct}% {t("listing.filled", "filled")}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Momentum slot meter */}
              <div className="mb-6" data-testid="slot-meter-detail">
                <div className="flex justify-between mb-3 font-medium text-sm items-center">
                  <span className="font-semibold" style={{ color:"#191320" }}>
                    <span style={{ color:"#6d28d9", fontWeight:800, fontSize:18 }}>{listing.filledSlots}</span>
                    {" "}joined · {listing.totalSlots - listing.filledSlots > 0
                      ? <><span style={{ fontWeight:800 }}>{listing.totalSlots - listing.filledSlots}</span> <span style={{ color:"#9b95a6", fontSize:13 }}>to unlock</span></>
                      : <span style={{ color:"#059669", fontWeight:800 }}>Group complete!</span>}
                  </span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {/* Live viewer count chip */}
                    {(presenceData?.viewing ?? 0) > 1 && (
                      <span
                        data-testid="chip-viewing-now"
                        style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600, color:"#6d28d9", background:"#ede9fe", borderRadius:999, padding:"2px 8px", whiteSpace:"nowrap" }}
                      >
                        👁 {presenceData!.viewing} viewing
                      </span>
                    )}
                    <span style={{ fontSize:13, fontWeight:700, color:"#6d28d9", background:"#ede9fe", borderRadius:999, padding:"2px 10px" }}>
                      {Math.round((listing.filledSlots / listing.totalSlots) * 100)}%
                    </span>
                  </div>
                </div>
                <SlotMeterDetail filled={listing.filledSlots} total={listing.totalSlots} />
                {(() => {
                  const slotsLeft = listing.totalSlots - listing.filledSlots;
                  const pct = (listing.filledSlots / listing.totalSlots) * 100;
                  if (slotsLeft > 0 && slotsLeft <= 3 && isActive) {
                    return (
                      <p className="text-xs font-semibold mt-2 flex items-center gap-1" style={{ color:"#e23744" }} data-testid="text-spots-left">
                        🔥 Only {slotsLeft} spot{slotsLeft === 1 ? "" : "s"} left — grab yours before it's gone!
                      </p>
                    );
                  }
                  if (slotsLeft > 0 && pct >= 60 && isActive) {
                    return (
                      <p className="text-xs font-semibold text-amber-600 mt-2 flex items-center gap-1" data-testid="text-spots-left">
                        <Zap className="w-3 h-3" />
                        {t("listing.onlySpotsLeft", { count: slotsLeft })}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Trust badge chips */}
              <TrustBadgeRow listing={listing} />

              {/* Money protection strip — mode-aware */}
              {isActive && (() => {
                const isProtected = !!(listing as any).escrowEnabled;
                if (isProtected) {
                  return (
                    <div className="mb-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3 space-y-1.5" data-testid="panel-money-protection">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Protected Deal — funds held in escrow
                      </p>
                      <div className="space-y-0.5 text-[11px] text-emerald-700/80 dark:text-emerald-400/70">
                        <p>✓ {t("listing.protectionPoint1", "Funds are held until the deal completes")}</p>
                        <p>✓ {t("listing.protectionPoint2", "Full refund if the group doesn't fill")}</p>
                        <p>✓ {t("listing.protectionPoint3", "ID-verified creators · dispute window after delivery")}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="mb-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 space-y-1.5" data-testid="panel-direct-deal">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      Direct Deal — settle directly with the organiser
                    </p>
                    <div className="space-y-0.5 text-[11px] text-amber-700/80 dark:text-amber-400/70">
                      <p>• Payment is arranged between you and the organiser outside Grouperry.</p>
                      <p>• Only commit if you trust the organiser. Check their verification status.</p>
                      <p>• If something goes wrong, use our dispute window for support.</p>
                    </div>
                  </div>
                );
              })()}

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-3">
                {!user && isActive && (
                  <a
                    href="/api/login"
                    data-testid="button-sign-in-to-join"
                    style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"#fff", fontWeight:700, fontSize:16, padding:"14px 32px", borderRadius:999, textDecoration:"none", boxShadow:"0 8px 24px -6px rgba(109,40,217,0.5)", border:"none", cursor:"pointer", whiteSpace:"nowrap" }}
                  >
                    <Zap className="w-5 h-5" style={{ flexShrink:0 }} /> Sign in to Lock in Your Spot
                  </a>
                )}

                {user && isActive && !isParticipant && !isCreator && !isFull && (
                  <CommitDialog
                    listing={listing}
                    trigger={
                      <button
                        data-testid="button-join"
                        style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"#fff", fontWeight:700, fontSize:16, padding:"14px 32px", borderRadius:999, boxShadow:"0 8px 24px -6px rgba(109,40,217,0.5)", border:"none", cursor:"pointer", whiteSpace:"nowrap" }}
                      >
                        <Zap className="w-5 h-5" style={{ flexShrink:0 }} /> Lock in My Spot
                        {(listing as any).pricePerSlot && (
                          <span style={{ background:"rgba(255,255,255,0.2)", borderRadius:999, padding:"2px 10px", fontSize:14 }}>
                            ${((listing as any).pricePerSlot / 100).toFixed(2)}
                          </span>
                        )}
                      </button>
                    }
                    onJustCompleted={() => { celebrationFiredRef.current = false; }}
                  />
                )}

                {isActive && isParticipant && !isCreator && (
                  <>
                    <Button
                      size="lg"
                      variant="secondary"
                      disabled
                      className="w-full md:w-auto px-8 pointer-events-none opacity-90"
                      data-testid="button-joined-state"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" /> {t("listing.joinedStatus")}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="lg"
                          className="w-full md:w-auto text-destructive border-destructive/50 hover:bg-destructive/10"
                          disabled={leaveMutation.isPending}
                          data-testid="button-leave"
                        >
                          {leaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("listing.leave")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("listing.leaveConfirmTitle", "Leave this group?")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("listing.leaveConfirmDesc", "Your slot will be freed up for someone else. You can rejoin if slots are still available.")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => leaveMutation.mutate(listing.id)}
                          >
                            {t("listing.leave")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <ReportCreatorButton listing={listing} />
                  </>
                )}

                {isCreator && isActive && (
                  <ListingAdminControls listing={listing} />
                )}
                
                {isFull && isActive && !isParticipant && !isCreator && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                      <span>{t("listing.groupFull")}</span>
                    </div>
                    {waitlistData?.isOnWaitlist ? (
                      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          {t("listing.waitlistPosition", "You're #{{position}} on the waitlist", { position: waitlistData.position })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          onClick={() => leaveWaitlistMutation.mutate()}
                          disabled={leaveWaitlistMutation.isPending}
                          data-testid="button-leave-waitlist"
                        >
                          {t("listing.waitlistLeave", "Leave waitlist")}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full md:w-auto border-amber-400 text-amber-700 hover:bg-amber-50"
                        onClick={() => joinWaitlistMutation.mutate()}
                        disabled={joinWaitlistMutation.isPending}
                        data-testid="button-join-waitlist"
                      >
                        {joinWaitlistMutation.isPending
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : t("listing.joinWaitlist", "Join Waitlist")}
                        {waitlistData && waitlistData.count > 0 && (
                          <span className="ml-2 text-xs opacity-70">({waitlistData.count} waiting)</span>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {user && <SaveButton listingId={listing.id} />}
                <ShareButton listing={listing} />
              </div>

              {/* Coordinate via in-app chat — no phone reveal for privacy */}
              {user && (isParticipant || isCreator) && (
                <div className="mb-4 flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20" data-testid="panel-chat-cta">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t("listing.contactViaChat", "Coordinate in the group chat")}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t("listing.contactViaChatDesc", "Message the creator and all participants directly in the Chat tab below.")}</p>
                  </div>
                </div>
              )}

              {/* Escrow status — shown to participants with an active escrow */}
              {isParticipant && !isCreator && escrowData?.escrow && (
                <div className="mb-4 rounded-xl border border-border/50 bg-card p-3" data-testid="panel-escrow-status">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold">Escrow #{escrowData.escrow.id}</span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium capitalize",
                        escrowData.escrow.status === "released" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
                        escrowData.escrow.status === "refunded" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      )}>
                        {escrowData.escrow.status}
                      </span>
                    </div>
                    {isCompleted && escrowData.escrow.status !== "released" && escrowData.escrow.status !== "refunded" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => releaseEscrowMutation.mutate()}
                        disabled={releaseEscrowMutation.isPending}
                        data-testid="button-release-escrow"
                      >
                        {releaseEscrowMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm receipt & release"}
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    {escrowData.escrow.status === "released"
                      ? "Payment released to the seller."
                      : escrowData.escrow.status === "refunded"
                      ? "You have been refunded."
                      : "Funds are held in escrow until you confirm receipt after delivery."}
                  </p>
                </div>
              )}

              {/* Dispute / report a problem — for participants who committed */}
              {isParticipant && !isCreator && (
                <DisputeButton listingId={listing.id} />
              )}

              {/* What happens next timeline — shown to non-participants */}
              {isActive && !isParticipant && !isCreator && (
                <div className="mb-4 pt-4 border-t border-border/40" data-testid="panel-what-happens-next">
                  <p className="text-xs font-semibold text-foreground/70 mb-3">{t("listing.whatHappensNext", "What happens next")}</p>
                  <div className="space-y-2">
                    {[
                      t("listing.stepJoin", "You commit to the deal"),
                      t("listing.stepFills", "Group fills up"),
                      t("listing.stepPay", "Everyone pays their share"),
                      t("listing.stepCreator", "Creator fulfils the order"),
                      t("listing.stepConfirm", "You confirm receipt → funds released"),
                    ].map((label, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold", i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                          {i + 1}
                        </div>
                        <span className={cn("text-xs", i === 0 ? "font-medium text-foreground" : "text-muted-foreground")}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post-join coach mark */}
              {showJoinCoach && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl flex gap-3 items-start" data-testid="banner-post-join-coach">
                  <PartyPopper className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-800 dark:text-green-200 text-sm">{t("listing.joinedCoachTitle")}</p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">{t("listing.joinedCoachDesc")}</p>
                  </div>
                  <button onClick={() => setShowJoinCoach(false)} className="text-green-600/60 hover:text-green-600 shrink-0 mt-0.5" data-testid="button-close-coach">
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Social proof */}
              {isActive && (
                <div className="mb-4 flex items-center gap-3 flex-wrap" data-testid="social-proof">
                  {listing.participants && listing.participants.length > 0 && (
                    <div className="flex -space-x-2">
                      {listing.participants.slice(0, 4).map((p: any) => (
                        <Avatar key={p.id} className="h-7 w-7 border-2 border-background">
                          <AvatarImage src={p.user?.profileImageUrl} />
                          <AvatarFallback className="text-[10px]">{p.user?.firstName?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{listing.filledSlots}</span> {t("listing.personJoined", { count: listing.filledSlots })}
                    </span>
                    {(listing as any).joinedToday > 0 && (
                      <Badge variant="outline" className="text-xs h-5 px-1.5 text-green-700 border-green-300 bg-green-50 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800" data-testid="badge-joined-today">
                        {t("listing.joinedToday", { count: (listing as any).joinedToday })}
                      </Badge>
                    )}
                    {(listing as any).viewsToday > 3 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid="text-views-today">
                        <TrendingUp className="w-3 h-3 text-orange-500" />
                        {t("listing.viewingToday", { count: (listing as any).viewsToday })}
                      </span>
                    )}
                    {(presenceData?.viewing ?? 0) > 1 && (
                      <span className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1 font-medium" data-testid="text-viewing-now">
                        <Eye className="w-3 h-3" />
                        {presenceData!.viewing} {t("listing.viewingNow", "viewing now")}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Live activity feed — shows recent joins as dopamine ticker */}
              {isActive && listing.participants && listing.participants.length > 0 && (
                <LiveActivityFeed participants={listing.participants} slotsLeft={listing.totalSlots - listing.filledSlots} />
              )}

              {/* Safety footnote */}
              <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1" data-testid="text-safety-notice">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {t("listing.safetyText")}
              </p>
            </div>
          </div>

          {/* Distribution Info */}
          {(listing as any).distributionType && (
            <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-5" data-testid="section-distribution">
              <h3 className="font-bold font-display text-base mb-3 flex items-center gap-2">
                {(listing as any).distributionType === "pickup" ? <MapPin className="w-4 h-4 text-primary" /> : (listing as any).distributionType === "digital" ? <Monitor className="w-4 h-4 text-primary" /> : <Truck className="w-4 h-4 text-primary" />}
                {t("listing.distributionMethod")}
              </h3>
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold capitalize">
                  {(listing as any).distributionType}
                </span>
                {(listing as any).distributionDetails && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{(listing as any).distributionDetails}</p>
                )}
              </div>
            </div>
          )}

          {/* Payment Coordination Panel */}
          <PaymentPanel listing={listing} isCreator={isCreator} isParticipant={isParticipant} currentUserId={user?.id} />

          <AnnouncementsSection listing={listing} isCreator={isCreator} canManage={canManage} />

          {user && (isParticipant || isCreator || user.isAdmin) && (
            <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-6" data-testid="section-milestones">
              <MilestoneTracker
                listingId={listing.id}
                isOrganizer={isCreator || canManage}
                isParticipant={isParticipant || isCreator}
              />
            </div>
          )}

          {(isExpired || isCompleted) && user && (isParticipant || isCreator) && (
            <DealProofSection
              listingId={listing.id}
              isCreator={isCreator}
              isParticipant={isParticipant}
              currentUserId={user.id}
            />
          )}

          {(isCreator || user?.isAdmin) && (
            <EditHistorySection listingId={listing.id} />
          )}

          {listing.status === "completed" && user && (isParticipant || isCreator) && (
            <ReviewSection listing={listing} currentUserId={user.id} isCreator={isCreator} />
          )}

          {canManage && listing.participants && listing.participants.length > 0 && (
            <ParticipantsManagement listing={listing} isCreator={isCreator} />
          )}

          {isActive && user && (isParticipant || isCreator) && (
            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 rounded-3xl border border-violet-200/60 dark:border-violet-800/40 p-5" data-testid="section-invite-friends">
              <h3 className="font-bold font-display text-base flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-primary" />
                {t("listing.inviteFriends", "Invite Friends")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {t("listing.inviteFriendsDesc", "Share your personal link — when a friend joins through it, you'll be credited.")}
              </p>
              <div className="flex items-center gap-2 p-2.5 bg-white/80 dark:bg-black/20 rounded-xl border border-violet-200/60 dark:border-violet-700/40 mb-3">
                <span className="flex-1 text-xs font-mono text-muted-foreground truncate select-all">
                  {window.location.origin}/listings/{listing.id}?ref={(user as any)?.id}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 shrink-0"
                  onClick={() => {
                    const url = `${window.location.origin}/listings/${listing.id}?ref=${(user as any)?.id}`;
                    navigator.clipboard.writeText(url).then(() => {
                      toast({ title: t("listing.linkCopied", "Link copied!"), description: t("listing.linkCopiedDesc", "Share it with friends to fill the group.") });
                    });
                  }}
                  data-testid="button-copy-invite-link"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="flex gap-2">
                {typeof navigator.share === "function" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 text-xs"
                    onClick={() => {
                      navigator.share({
                        title: listing.title,
                        text: `Join this group deal on Grouperry: ${listing.title}`,
                        url: `${window.location.origin}/listings/${listing.id}?ref=${(user as any)?.id}`,
                      }).catch(() => {});
                    }}
                    data-testid="button-share-native"
                  >
                    Share via…
                  </Button>
                )}
                <span className="text-xs text-muted-foreground self-center">
                  {listing.totalSlots - listing.filledSlots} slot{listing.totalSlots - listing.filledSlots === 1 ? "" : "s"} left to unlock
                </span>
              </div>
            </div>
          )}

          {isCompleted && user && (isParticipant || isCreator) && (
            <div className="bg-gradient-to-br from-emerald-50 to-violet-50 dark:from-emerald-950/20 dark:to-violet-950/20 rounded-3xl border border-emerald-200/60 dark:border-emerald-800/40 p-5 text-center space-y-3" data-testid="section-post-completion-cta">
              <PartyPopper className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="font-bold font-display text-base">{t("listing.dealDone", "This deal is done!")}</h3>

              <p className="text-xs text-muted-foreground">{t("listing.createNextDeal", "Ready to organize your own group buy?")}</p>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => window.location.href = "/create"}
                data-testid="button-create-own-deal"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                {t("listing.startNewDeal", "Start a new deal")}
              </Button>
            </div>
          )}

          <SimilarDealsSection currentListingId={listing.id} category={listing.category} />
        </div>

        <div className="lg:col-span-1 h-[600px] lg:h-auto flex flex-col gap-4">

          {/* Join Deal widget — shown in sidebar for non-participants on active listings */}
          {isActive && !isParticipant && !isCreator && (
            <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-5 space-y-4" data-testid="sidebar-join-widget">
              <div>
                <h3 className="font-bold font-display text-base mb-1">{t("listing.joinThisDeal", "Join this Deal")}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className={cn(
                    "font-semibold",
                    (() => {
                      const slotsLeft = listing.totalSlots - listing.filledSlots;
                      const pct = (listing.filledSlots / listing.totalSlots) * 100;
                      if (slotsLeft <= 1) return "text-destructive";
                      if (pct >= 75) return "text-amber-600 dark:text-amber-400";
                      return "text-foreground";
                    })()
                  )}>
                    {t("listing.spotsLeftCount", { count: listing.totalSlots - listing.filledSlots })}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {(() => {
                      const hoursLeft = differenceInHours(new Date(listing.expiresAt), new Date());
                      if (hoursLeft <= 0) return t("listing.expired");
                      if (hoursLeft < 24) return t("listing.hoursLeft", { count: hoursLeft });
                      const daysLeft = differenceInDays(new Date(listing.expiresAt), new Date());
                      return t("listing.daysLeft", { count: daysLeft });
                    })()}
                  </span>
                </div>
              </div>

              {/* Slot meter — sidebar */}
              <div>
                <SlotMeterDetail filled={listing.filledSlots} total={listing.totalSlots} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span style={{ color:"#6d28d9", fontWeight:700 }}>{listing.filledSlots} joined</span>
                  <span>{listing.totalSlots - listing.filledSlots} spots left</span>
                </div>
              </div>

              {/* Participant avatars */}
              {listing.participants && listing.participants.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {listing.participants.slice(0, 5).map((p: any) => (
                      <Avatar key={p.id} className="h-7 w-7 border-2 border-background">
                        <AvatarImage src={p.user?.profileImageUrl} />
                        <AvatarFallback className="text-[10px]">{p.user?.firstName?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {t("listing.alreadyIn", { count: listing.filledSlots })}
                  </span>
                </div>
              )}

              {/* Price */}
              {(listing as any).pricePerSlot && (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    ${((listing as any).pricePerSlot / 100).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">{t("listing.perSlot")}</span>
                  {(listing as any).marketPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      ${((listing as any).marketPrice / 100).toFixed(2)}
                    </span>
                  )}
                </div>
              )}

              {/* CTA */}
              {!isFull ? (
                <CommitDialog
                  listing={listing}
                  onJustCompleted={() => { celebrationFiredRef.current = false; }}
                  trigger={
                    <button
                      data-testid="button-join-sidebar"
                      style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"#fff", fontWeight:700, fontSize:15, padding:"13px 24px", borderRadius:999, boxShadow:"0 8px 24px -6px rgba(109,40,217,0.45)", border:"none", cursor:"pointer" }}
                    >
                      <Zap className="w-4 h-4" style={{ flexShrink:0 }} /> Lock in My Spot
                    </button>
                  }
                />
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-300"
                  onClick={() => waitlistData?.isOnWaitlist ? leaveWaitlistMutation.mutate() : joinWaitlistMutation.mutate()}
                  disabled={joinWaitlistMutation.isPending || leaveWaitlistMutation.isPending}
                  data-testid="button-waitlist-sidebar"
                >
                  {waitlistData?.isOnWaitlist
                    ? `#${waitlistData.position} on waitlist — leave`
                    : `Join Waitlist${waitlistData?.count ? ` (${waitlistData.count} waiting)` : ""}`}
                </Button>
              )}

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Your reliability score is affected if you back out after committing.
              </p>
            </div>
          )}

          <div className="bg-card rounded-3xl shadow-sm border border-border/50 flex-1 flex flex-col overflow-hidden" style={{ minHeight: "400px" }}>
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-bold font-display flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {t("listing.chat")}
              </h3>
            </div>

            {canChat ? (
              <ChatInterface listingId={id} currentUserId={user?.id} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mb-4 opacity-20" />
                {!user ? (
                  <>
                    <p className="text-sm mb-3">Sign in to join the conversation</p>
                    <a href="/api/login">
                      <Button size="sm" variant="outline" data-testid="button-signin-to-chat">
                        Sign in
                      </Button>
                    </a>
                  </>
                ) : (
                  <p className="text-sm">{t("listing.chatJoinHint")}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky mobile join bar (U1) with confirmation (P1) */}
      {!user && isActive && (
        <div className="fixed bottom-[4.25rem] left-0 right-0 z-40 md:hidden" style={{ background:"rgba(255,255,255,0.97)", backdropFilter:"blur(12px)", borderTop:"1px solid #ede9fe", padding:"10px 16px" }} data-testid="sticky-signin-bar">
          <a
            href="/api/login"
            data-testid="button-signin-sticky"
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"#fff", fontWeight:700, fontSize:16, padding:"13px 24px", borderRadius:999, textDecoration:"none", boxShadow:"0 8px 24px -6px rgba(109,40,217,0.45)" }}
          >
            <Zap style={{ width:18, height:18, flexShrink:0 }} />
            Sign in to Lock in Your Spot
          </a>
        </div>
      )}
      {user && isActive && !isParticipant && !isCreator && !isFull && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 sm:hidden pb-safe"
          style={{ background:"rgba(255,255,255,0.97)", backdropFilter:"blur(12px)", borderTop:"1px solid #ede9fe", padding:"10px 16px" }}
          data-testid="sticky-join-bar"
        >
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            {/* Price / spots info on the left */}
            <div style={{ lineHeight:1.2 }}>
              {(listing as any).pricePerSlot ? (
                <div style={{ fontWeight:800, fontSize:20, color:"#6d28d9", letterSpacing:"-0.02em" }}>
                  ${((listing as any).pricePerSlot / 100).toFixed(2)}
                  <span style={{ fontSize:12, fontWeight:500, color:"#9b95a6", marginLeft:4 }}>/slot</span>
                </div>
              ) : (
                <div style={{ fontWeight:700, fontSize:15, color:"#191320" }}>Join the Group</div>
              )}
              <div style={{ fontSize:11, fontWeight:600, color:"#e23744", marginTop:2 }}>
                {listing.totalSlots - listing.filledSlots} spot{listing.totalSlots - listing.filledSlots === 1 ? "" : "s"} left
              </div>
            </div>
            {/* Violet gradient Join button on the right */}
            <CommitDialog
              listing={listing}
              onJustCompleted={() => { celebrationFiredRef.current = false; }}
              trigger={
                <button
                  data-testid="button-join-sticky"
                  style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,var(--v-700),var(--v-500))", color:"#fff", fontWeight:700, fontSize:16, height:56, padding:"0 28px", borderRadius:999, boxShadow:"0 8px 24px -6px rgba(109,40,217,0.5)", border:"none", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}
                >
                  <Zap style={{ width:18, height:18, flexShrink:0 }} />
                  Lock in My Spot
                </button>
              }
            />
          </div>
        </div>
      )}
      {user && isActive && !isParticipant && !isCreator && isFull && (
        <div className="fixed bottom-[4.25rem] left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border p-3 md:hidden" data-testid="sticky-waitlist-bar">
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => joinWaitlistMutation.mutate()}
            data-testid="button-join-waitlist-sticky"
          >
            {t("listing.joinWaitlist", "Join Waitlist")}
          </Button>
        </div>
      )}
    </Layout>
  );
}

function buildImageList(listing: any): string[] {
  const images: string[] = [];
  if (listing.imageUrl) {
    images.push(listing.imageUrl);
  }
  if (listing.images && Array.isArray(listing.images)) {
    for (const img of listing.images) {
      const url = img.imageUrl || img;
      if (url && !images.includes(url)) {
        images.push(url);
      }
    }
  }
  if (images.length === 0) {
    images.push("https://placehold.co/600x400?text=Grouperry");
  }
  return images;
}

function ImageGallery({ images, title, category, status }: { images: string[]; title: string; category: string; status: string }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const hasMultiple = images.length > 1;

  return (
    <div className="relative">
      <div className="aspect-video relative bg-muted overflow-hidden">
        <img 
          src={images[currentIndex]} 
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
          data-testid="img-listing-main"
        />
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium capitalize">
          {category}
        </div>
        <div className={cn(
          "absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold shadow-md",
          status === "active" ? 'bg-green-500 text-white' : status === "expired" ? 'bg-gray-500 text-white' : status === "completed" ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
        )}>
          {status === "active" ? t("listing.active") : status === "expired" ? t("listing.expired") : status === "completed" ? t("listing.complete") : status}
        </div>

        {hasMultiple && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={goToPrev}
              data-testid="button-image-prev"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={goToNext}
              data-testid="button-image-next"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5" data-testid="image-indicators">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === currentIndex ? "bg-white w-4" : "bg-white/50"
                  )}
                  onClick={() => setCurrentIndex(idx)}
                  data-testid={`button-image-dot-${idx}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={cn(
                "shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-colors",
                idx === currentIndex ? "border-primary" : "border-transparent opacity-60"
              )}
              onClick={() => setCurrentIndex(idx)}
              data-testid={`button-thumbnail-${idx}`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


function ListingAdminControls({ listing }: { listing: any }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const updateStatus = useUpdateListingStatus();
  const queryClient = useQueryClient();
  const [showExtend, setShowExtend] = useState(false);
  const [newExpiry, setNewExpiry] = useState("");
  const [showPostUpdate, setShowPostUpdate] = useState(false);
  const [updateContent, setUpdateContent] = useState("");

  const extendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ expiresAt: new Date(newExpiry + "T00:00:00") }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id] });
      setShowExtend(false);
      toast({ title: "Deadline extended!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const postUpdateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/listings/${listing.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: updateContent }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id, "updates"] });
      setShowPostUpdate(false);
      setUpdateContent("");
      toast({ title: "Update posted to all participants!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/listings/${listing.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, text: `Join my group deal: ${listing.title}`, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Share it with your network." });
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-green-200 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
          onClick={() => updateStatus.mutate({ id: listing.id, status: "completed" })}
          data-testid="button-complete"
        >
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          {t("listing.markComplete")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExtend(!showExtend)}
          data-testid="button-extend-deadline"
        >
          <Clock className="w-4 h-4 mr-1.5" />
          Extend deadline
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPostUpdate(!showPostUpdate)}
          data-testid="button-post-update"
        >
          Post update
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          data-testid="button-share-creator"
        >
          <Share2 className="w-4 h-4 mr-1.5" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={() => updateStatus.mutate({ id: listing.id, status: "cancelled" })}
          data-testid="button-cancel"
        >
          {t("listing.cancel")}
        </Button>
      </div>

      {showExtend && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
          <Input
            type="date"
            className="flex-1 h-9 text-sm"
            value={newExpiry}
            onChange={(e) => setNewExpiry(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            data-testid="input-new-expiry"
          />
          <Button
            size="sm"
            onClick={() => extendMutation.mutate()}
            disabled={!newExpiry || extendMutation.isPending}
            data-testid="button-confirm-extend"
          >
            {extendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowExtend(false)}>Cancel</Button>
        </div>
      )}

      {showPostUpdate && (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
          <Textarea
            placeholder="Share an update with all participants…"
            className="text-sm min-h-[80px] resize-none"
            value={updateContent}
            onChange={(e) => setUpdateContent(e.target.value)}
            data-testid="input-update-content"
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => { setShowPostUpdate(false); setUpdateContent(""); }}>Cancel</Button>
            <Button
              size="sm"
              onClick={() => postUpdateMutation.mutate()}
              disabled={!updateContent.trim() || postUpdateMutation.isPending}
              data-testid="button-confirm-post-update"
            >
              {postUpdateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post update"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


function ReportCreatorButton({ listing }: { listing: any }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const reportMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/reports", {
        reportedUserId: listing.creatorId,
        listingId: listing.id,
        reason
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("listing.reportSubmitted"), description: t("listing.reportSubmittedDesc") });
      setOpen(false);
      setReason("");
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("listing.failed"), variant: "destructive" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" data-testid="button-report">
          <Flag className="w-4 h-4 mr-1" />
          {t("listing.report")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("listing.reportActivity")}</DialogTitle>
          <DialogDescription>
            {t("listing.reportDialogDesc")}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder={t("listing.reportReasonPlaceholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-h-[100px]"
          data-testid="input-report-reason"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("listing.cancel")}</Button>
          <Button 
            onClick={() => reportMutation.mutate()} 
            disabled={!reason.trim() || reportMutation.isPending}
            variant="destructive"
            data-testid="button-submit-report"
          >
            {reportMutation.isPending ? t("listing.submitting") : t("listing.submitReport")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CommitDialog({ listing, trigger, onSuccess, onJustCompleted }: { listing: any; trigger: React.ReactNode; onSuccess?: () => void; onJustCompleted?: () => void }) {
  const { t } = useTranslation();
  const joinMutation = useJoinListing();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [distPref, setDistPref] = useState<"pickup" | "delivery" | "digital">("pickup");
  const [acknowledged, setAcknowledged] = useState(false);

  // Quick commit mode — skip multi-step for non-escrow commit-only deals
  const isEscrow = !!(listing as any).escrowEnabled;
  const hasPrice = !!((listing as any).pricePerSlot);
  const quickMode = !isEscrow;

  // Fetch sensitive payment fields when user reaches step 2
  const { data: paymentInfo } = useQuery<{ paymentMethod: string | null; paymentDetails: string | null; paymentNotes: string | null }>({
    queryKey: ["/api/listings", listing.id, "payment-info"],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${listing.id}/payment-info`, { credentials: "include" });
      if (!res.ok) return { paymentMethod: null, paymentDetails: null, paymentNotes: null };
      return res.json();
    },
    enabled: open && (step >= 2 || quickMode),
  });

  const totalSteps = quickMode ? 1 : 3;
  const distributionOptions = [
    { value: "pickup" as const, label: t("listing.pickupOption"), icon: MapPin, desc: t("listing.pickupDesc") },
    { value: "delivery" as const, label: t("listing.deliveryOption"), icon: Truck, desc: t("listing.deliveryDesc") },
    { value: "digital" as const, label: t("listing.digitalOption"), icon: Monitor, desc: t("listing.digitalDesc") },
  ];

  const reset = () => { setStep(1); setAcknowledged(false); setDistPref("pickup"); };

  const handleConfirm = () => {
    joinMutation.mutate(listing.id, {
      onSuccess: async (data: any) => {
        try {
          await fetch(`/api/listings/${listing.id}/my-preference`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ distributionPreference: distPref }),
          });
        } catch { /* preference save is best-effort */ }
        queryClient.invalidateQueries({ queryKey: [api.listings.get.path, listing.id] });
        track("deal_commit", { listingId: listing.id, price: (listing as any).pricePerSlot ?? 0 });
        setOpen(false);
        reset();
        if (data?.justCompleted) {
          localStorage.removeItem(`celebration-seen-${listing.id}`);
          onJustCompleted?.();
        }
        onSuccess?.();
      },
    });
  };

  const hasPayment = !!(listing.paymentMethod && paymentInfo?.paymentDetails);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden" data-testid="dialog-commit">
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {quickMode ? "Lock in Your Spot" : step === 1 ? t("listing.receiveItemQuestion") : step === 2 ? t("listing.paymentCommitment") : t("listing.confirmCommitment")}
            </DialogTitle>
            {!quickMode && <span className="text-xs text-muted-foreground font-medium">{t("listing.stepOf", { step, total: totalSteps })}</span>}
          </div>
          <DialogDescription className="sr-only">Commitment flow for joining this group deal</DialogDescription>

          {/* Quick mode: single-step confirm for commit-only (non-escrow) deals */}
          {quickMode && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-border">
                <div style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", padding: "16px 20px" }}>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wide mb-0.5">You're joining</p>
                  <p className="text-white font-bold text-base leading-snug line-clamp-2">{listing.title}</p>
                </div>
                <div className="bg-card p-4 grid grid-cols-2 gap-3">
                  {hasPrice && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Your price</p>
                      <p className="text-xl font-bold text-primary">${((listing as any).pricePerSlot / 100).toFixed(2)}</p>
                      {(listing as any).marketPrice && (
                        <p className="text-xs text-muted-foreground line-through">${((listing as any).marketPrice / 100).toFixed(2)}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Spots left</p>
                    <p className="text-xl font-bold">{listing.totalSlots - listing.filledSlots}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Ends</p>
                    <p className="text-sm font-semibold">{formatDistanceToNow(new Date(listing.expiresAt), { addSuffix: true })}</p>
                  </div>
                </div>
              </div>
              {paymentInfo?.paymentMethod && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("listing.payVia")}</p>
                  <p className="font-bold">{paymentInfo.paymentMethod}</p>
                  {paymentInfo.paymentDetails && <p className="text-sm font-mono text-muted-foreground">{paymentInfo.paymentDetails}</p>}
                  {paymentInfo.paymentNotes && <p className="text-xs text-muted-foreground">{paymentInfo.paymentNotes}</p>}
                </div>
              )}
              <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-200">
                <span className="text-base leading-none mt-0.5">🔒</span>
                <span>No charge right now — you're reserving your spot. Payment is coordinated directly with the organiser once the group is complete.</span>
              </div>
            </div>
          )}

          {/* Step 1: Distribution preference */}
          {!quickMode && step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("listing.letOrganizerKnow")}</p>
              <div className="grid grid-cols-3 gap-2">
                {distributionOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDistPref(opt.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${distPref === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    data-testid={`button-dist-pref-${opt.value}`}
                  >
                    <opt.icon className={`w-4 h-4 mb-1 ${distPref === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                    <p className={`text-xs font-semibold ${distPref === opt.value ? "text-primary" : ""}`}>{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {listing.distributionType && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                  <span className="font-semibold">{t("listing.organiserMethod")}</span> {listing.distributionType} — {listing.distributionDetails || t("listing.noDetails")}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Payment + acknowledgment */}
          {!quickMode && step === 2 && (
            <div className="space-y-3">
              {hasPayment ? (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("listing.payVia")}</p>
                  <p className="font-bold text-lg">{listing.paymentMethod}</p>
                  <p className="text-sm font-mono">{listing.paymentDetails}</p>
                  {listing.paymentNotes && <p className="text-xs text-muted-foreground">{listing.paymentNotes}</p>}
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">{t("listing.noPaymentSet")}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">{t("listing.noPaymentSetDesc")}</p>
                </div>
              )}
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-3 text-xs text-rose-800 dark:text-rose-200">
                {t("listing.reliabilityImpact")}
              </div>
              <label className="flex items-start gap-3 cursor-pointer" data-testid="checkbox-acknowledge">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={e => setAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary cursor-pointer"
                />
                <span className="text-sm text-foreground leading-snug">
                  {t("listing.commitUnderstand")}
                </span>
              </label>
            </div>
          )}

          {/* Step 3: Summary + confirm */}
          {!quickMode && step === 3 && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <p className="font-semibold text-sm">{listing.title}</p>
                {(listing as any).pricePerSlot && (
                  <p className="text-2xl font-bold text-primary">
                    ${((listing as any).pricePerSlot / 100).toFixed(2)}
                    {(listing as any).marketPrice && (
                      <span className="text-sm font-normal text-muted-foreground line-through ml-2">${((listing as any).marketPrice / 100).toFixed(2)}</span>
                    )}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-muted-foreground mb-0.5">{t("listing.distribution")}</p>
                    <p className="font-semibold capitalize">{distPref}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-muted-foreground mb-0.5">{t("listing.payVia")}</p>
                    <p className="font-semibold">{listing.paymentMethod || t("listing.organiserMethod")}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-muted-foreground mb-0.5">{t("listing.spotsLeft")}</p>
                    <p className="font-semibold">{listing.totalSlots - listing.filledSlots} {t("listing.remaining")}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-muted-foreground mb-0.5">{t("listing.expiresIn")}</p>
                    <p className="font-semibold">{formatDistanceToNow(new Date(listing.expiresAt), { addSuffix: true })}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {t("listing.byConfirming")}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-2 pt-1">
            {!quickMode && step > 1 && (
              <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)} data-testid="button-commit-back">
                {t("common.back")}
              </Button>
            )}
            {!quickMode && step < totalSteps ? (
              <Button className="flex-1" onClick={() => setStep(s => s + 1)} data-testid="button-commit-next">
                {t("common.next")}
              </Button>
            ) : (
              <button
                style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, background: joinMutation.isPending ? "#8b5cf6" : "linear-gradient(135deg,#7c3aed,#6d28d9)", color:"#fff", fontWeight:700, fontSize:15, padding:"12px 24px", borderRadius:999, boxShadow:"0 6px 20px -4px rgba(109,40,217,0.45)", border:"none", cursor: joinMutation.isPending ? "not-allowed" : "pointer", flex:1, opacity: (!quickMode && !acknowledged) || joinMutation.isPending ? 0.65 : 1 }}
                onClick={handleConfirm}
                disabled={(!quickMode && !acknowledged) || joinMutation.isPending}
                data-testid="button-commit-confirm"
              >
                {joinMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{t("listing.committing")}</>
                  : <><Zap className="w-4 h-4" />{quickMode ? "Confirm — Lock in My Spot" : t("listing.confirmCommitmentBtn")}</>}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentPanel({ listing, isCreator, isParticipant, currentUserId }: { listing: any; isCreator: boolean; isParticipant: boolean; currentUserId?: string }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const show = isCreator || isParticipant;

  // Fetch sensitive payment fields from the protected endpoint (auth-gated, not in public listing)
  const { data: paymentInfo } = useQuery<{ paymentMethod: string | null; paymentDetails: string | null; paymentNotes: string | null }>({
    queryKey: ["/api/listings", listing.id, "payment-info"],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${listing.id}/payment-info`, { credentials: "include" });
      if (!res.ok) return { paymentMethod: null, paymentDetails: null, paymentNotes: null };
      return res.json();
    },
    enabled: show,
  });

  const [method, setMethod] = useState(listing.paymentMethod || "");
  const [details, setDetails] = useState("");
  const [notes, setNotes] = useState("");

  // Sync form defaults once payment info loads
  useEffect(() => {
    if (paymentInfo) {
      setMethod(paymentInfo.paymentMethod || "");
      setDetails(paymentInfo.paymentDetails || "");
      setNotes(paymentInfo.paymentNotes || "");
    }
  }, [paymentInfo]);

  if (!show) return null;

  const hasPaymentInfo = !!(listing.paymentMethod && paymentInfo?.paymentDetails);

  const savePaymentInfo = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/listings/${listing.id}/payment-info`, { paymentMethod: method, paymentDetails: details, paymentNotes: notes });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id] });
      setEditing(false);
      toast({ title: t("listing.paymentSaved") });
    },
    onError: () => toast({ title: t("common.error"), description: t("listing.failed"), variant: "destructive" }),
  });

  const markPayment = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/listings/${listing.id}/participants/${userId}/payment`, { paymentStatus: status });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id] });
      toast({ title: t("listing.paymentStatusUpdated") });
    },
  });

  const copyToClipboard = () => {
    const pd = paymentInfo?.paymentDetails ?? "";
    const pn = paymentInfo?.paymentNotes;
    navigator.clipboard.writeText(`${listing.paymentMethod}: ${pd}${pn ? `\nNote: ${pn}` : ""}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const myParticipation = listing.participants?.find((p: any) => p.userId === currentUserId);
  const myPaymentStatus = myParticipation?.paymentStatus || "pending";

  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-5 space-y-4" data-testid="section-payment">
      <div className="flex items-center justify-between">
        <h3 className="font-bold font-display text-base flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          {t("listing.paymentPanelTitle")}
        </h3>
        {isCreator && !editing && (
          <Button variant="ghost" size="sm" onClick={() => { setMethod(paymentInfo?.paymentMethod || listing.paymentMethod || ""); setDetails(paymentInfo?.paymentDetails || ""); setNotes(paymentInfo?.paymentNotes || ""); setEditing(true); }} data-testid="button-edit-payment">
            <Edit2 className="w-3.5 h-3.5 mr-1" /> {hasPaymentInfo ? t("common.edit") : t("listing.setUpPayment")}
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("listing.paymentMethodLabel")}</label>
            <select className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm" value={method} onChange={e => setMethod(e.target.value)} data-testid="select-payment-method">
              <option value="">{t("listing.selectMethod")}</option>
              {["PayPal", "Venmo", "Zelle", "CashApp", "Bank Transfer", "Cash", "Other"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("listing.paymentHandle")}</label>
            <Input placeholder="e.g. @yourusername or email@example.com" value={details} onChange={e => setDetails(e.target.value)} className="bg-muted/50" data-testid="input-payment-details" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("listing.additionalNotes")}</label>
            <Input placeholder="e.g. Use Friends & Family, reference: Grouperry" value={notes} onChange={e => setNotes(e.target.value)} className="bg-muted/50" data-testid="input-payment-notes" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => savePaymentInfo.mutate()} disabled={!method || !details || savePaymentInfo.isPending} data-testid="button-save-payment">
              {savePaymentInfo.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t("common.save")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} data-testid="button-cancel-payment">{t("common.cancel")}</Button>
          </div>
        </div>
      ) : hasPaymentInfo ? (
        <div className="space-y-3">
          {/* Show payment info to participants */}
          {(isParticipant || isCreator) && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("listing.payVia")}</span>
                  <p className="font-bold text-lg">{listing.paymentMethod}</p>
                  <p className="text-sm text-foreground font-mono">{paymentInfo?.paymentDetails}</p>
                  {paymentInfo?.paymentNotes && <p className="text-xs text-muted-foreground mt-1">{paymentInfo.paymentNotes}</p>}
                </div>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="shrink-0" data-testid="button-copy-payment">
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? t("listing.copied") : t("listing.copy")}
                </Button>
              </div>
              {isParticipant && !isCreator && (
                <div className={cn("flex items-center gap-2 text-xs font-semibold mt-2 pt-2 border-t border-primary/10",
                  myPaymentStatus === "paid" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                )}>
                  {myPaymentStatus === "paid" ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {t("listing.yourPayment")} {myPaymentStatus === "paid" ? t("listing.paymentConfirmed") : t("listing.paymentPending")}
                </div>
              )}
            </div>
          )}

          {/* Organiser: see all participants payment status */}
          {isCreator && listing.participants && listing.participants.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("listing.memberPayments")}</p>
              {listing.participants.map((p: any) => (
                <div key={p.userId} className="flex items-center justify-between py-1.5 text-sm" data-testid={`payment-status-${p.userId}`}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={p.user?.profileImageUrl} />
                      <AvatarFallback className="text-[10px]">{p.user?.firstName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <span>{p.user?.firstName || t("listing.memberFallback")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                      p.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                    )}>
                      {p.paymentStatus === "paid" ? t("listing.paid") : t("listing.pendingPayment")}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs px-2"
                      onClick={() => markPayment.mutate({ userId: p.userId, status: p.paymentStatus === "paid" ? "pending" : "paid" })}
                      disabled={markPayment.isPending}
                      data-testid={`button-toggle-payment-${p.userId}`}
                    >
                      {p.paymentStatus === "paid" ? t("listing.markPending") : t("listing.markPaid")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          {isCreator ? (
            <p className="text-sm text-muted-foreground">{t("listing.paymentInstructions")}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t("listing.awaitingPaymentInstructions")}</p>
          )}
        </div>
      )}
    </div>
  );
}

function SaveButton({ listingId }: { listingId: number }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: savedStatus } = useQuery({
    queryKey: ["/api/listings", listingId, "saved-status"],
    queryFn: () => fetch(`/api/listings/${listingId}/saved-status`, { credentials: "include" }).then(r => r.json()),
  });

  const isSaved = savedStatus?.saved === true;

  const toggleSave = useMutation({
    mutationFn: async () => {
      const method = isSaved ? "DELETE" : "POST";
      const res = await fetch(`/api/listings/${listingId}/save`, { method, credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listingId, "saved-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-listings"] });
      toast({ title: isSaved ? t("listing.removed") : t("listing.saved"), description: isSaved ? t("listing.removedDesc") : t("listing.savedDesc") });
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => toggleSave.mutate()}
      disabled={toggleSave.isPending}
      className={cn(isSaved && "text-primary border-primary")}
      data-testid="button-save-listing"
    >
      {isSaved ? <BookmarkCheck className="w-4 h-4 mr-1" /> : <Bookmark className="w-4 h-4 mr-1" />}
      {isSaved ? t("listing.saved") : t("listing.save")}
    </Button>
  );
}

function ShareRow({ listing }: { listing: any }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const slotsLeft = (listing.totalSlots ?? 0) - (listing.filledSlots ?? 0);
  const isNearFull = listing.status === "active" && slotsLeft > 0 && slotsLeft <= 3;

  const urgencyText = isNearFull
    ? `Only ${slotsLeft} spot${slotsLeft === 1 ? "" : "s"} left in "${listing.title}" — grab yours before it fills!`
    : `Join this group deal: ${window.location.href}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      toast({ title: "Copied!", description: "Link copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
      track("deal_shared", { listingId: listing.id, channel: "copy", nearFull: isNearFull });
    }).catch(() => {
      toast({ title: "Error", description: "Could not copy link.", variant: "destructive" });
    });
  };

  const handleWhatsApp = () => {
    const text = isNearFull
      ? `${urgencyText} ${window.location.href}`
      : `Join this group deal: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    track("deal_shared", { listingId: listing.id, channel: "whatsapp", nearFull: isNearFull });
  };

  const handleXShare = () => {
    const text = isNearFull
      ? `🔥 ${urgencyText}`
      : `Saving big on "${listing.title}" with a group buy on Grouperry 👇`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text + " " + window.location.href)}`, "_blank", "noopener,noreferrer");
    track("deal_shared", { listingId: listing.id, channel: "x", nearFull: isNearFull });
  };

  return (
    <div className="mb-4" data-testid="share-row">
      {isNearFull && (
        <div
          className="mb-2 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2"
          style={{ background: "linear-gradient(90deg,#fef3c7,#fde68a)", color: "#92400e", border: "1px solid #fcd34d" }}
          data-testid="share-urgency-banner"
        >
          🔥 Only {slotsLeft} spot{slotsLeft === 1 ? "" : "s"} left — share to help this deal fill!
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Share:</span>
        <Button size="sm" variant="outline" onClick={handleCopyLink} data-testid="button-copy-link" className="h-7 px-2.5 text-xs gap-1">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleWhatsApp} data-testid="button-whatsapp-share" className="h-7 px-2.5 text-xs gap-1">
          <Share2 className="w-3.5 h-3.5 text-green-600" />
          WhatsApp
        </Button>
        <Button size="sm" variant="outline" onClick={handleXShare} data-testid="button-x-share" className="h-7 px-2.5 text-xs gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          Post
        </Button>
      </div>
    </div>
  );
}

function TrustBadgeRow({ listing }: { listing: any }) {
  const isEscrowEnabled = !!(listing as any).escrowEnabled;
  const isOrganizerVerified = listing.creator?.verificationStatus === "verified";

  return (
    <div className="flex flex-wrap gap-2 mb-4" data-testid="trust-badge-row">
      {isEscrowEnabled ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" data-testid="badge-escrow">
          <Shield className="w-3 h-3" />
          Escrow Protected
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" data-testid="badge-direct-deal">
          <RefreshCcw className="w-3 h-3" />
          Direct Deal
        </span>
      )}
      {isOrganizerVerified && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" data-testid="badge-organizer-verified">
          <BadgeCheck className="w-3 h-3" />
          Organiser Verified
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400" data-testid="badge-dispute-window">
        <ShieldCheck className="w-3 h-3" />
        Dispute Window
      </span>
    </div>
  );
}

/** Live activity ticker — shows "X just joined" with staggered animation */
function LiveActivityFeed({ participants, slotsLeft }: { participants: any[]; slotsLeft: number }) {
  const [visibleIdx, setVisibleIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  // Build activity messages from participants (most recent first)
  const items = [...participants]
    .filter((p) => p.user?.firstName)
    .slice(-5)
    .reverse()
    .map((p, i) => {
      const name = p.user.firstName + (p.user.lastName ? ` ${p.user.lastName[0]}.` : "");
      const msgs = [
        `${name} just joined this deal 🎉`,
        `${name} locked in their spot`,
        `${name} committed to the group`,
      ];
      return msgs[i % msgs.length];
    });

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setVisibleIdx((prev) => (prev + 1) % items.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div
      style={{ background:"#f5f3ff", border:"1px solid #ede9fe", borderRadius:12, padding:"8px 14px", marginBottom:12, display:"flex", alignItems:"center", gap:10, minHeight:40 }}
      data-testid="live-activity-feed"
    >
      <span style={{ width:8, height:8, borderRadius:"50%", background:"#6d28d9", flexShrink:0, animation:"gp-pulse 1.4s ease-in-out infinite" }} />
      <span
        style={{ fontSize:12.5, fontWeight:600, color:"#4c1d95", flex:1, transition:"opacity 0.3s", opacity: visible ? 1 : 0 }}
      >
        {items[visibleIdx]}
      </span>
      {slotsLeft > 0 && slotsLeft <= 5 && (
        <span style={{ fontSize:11, fontWeight:700, color:"#e23744", background:"#fff1f2", borderRadius:999, padding:"2px 8px", flexShrink:0 }}>
          {slotsLeft} left
        </span>
      )}
    </div>
  );
}

function ShareButton({ listing }: { listing: any }) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/listings/${listing.id}`;
    const shareText = `${listing.title} - ${t("listing.shareText")}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, text: shareText, url: shareUrl });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: t("listing.linkCopied"), description: t("listing.linkCopiedDesc") });
    } catch {
      toast({ title: t("common.error"), description: t("listing.errorCopyLink"), variant: "destructive" });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} data-testid="button-share-listing">
      <Share2 className="w-4 h-4 mr-1" />
      {t("listing.share")}
    </Button>
  );
}




