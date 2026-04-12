import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ListingCard } from "@/components/ListingCard";
import { AISuggestionsBanner } from "@/components/explore/AISuggestionsBanner";
import { ReferralBanner } from "@/components/explore/ReferralBanner";
import { ActivityFeedSection } from "@/components/explore/ActivityFeedSection";
import { useExploreListingsPage } from "@/hooks/use-explore-listings-page";
import { ExploreFiltersToolbar } from "@/components/explore/ExploreFiltersToolbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  X,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  ArrowRight,
  Users,
  Package,
  BadgePercent,
  Star,
  Flame,
} from "lucide-react";

function DealOfTheDaySkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 bg-card">
      <div className="h-56 sm:h-72 w-full">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function DealOfTheDay() {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState("");

  const { data: deal, isLoading } = useQuery<any>({
    queryKey: ["/api/discover/deal-of-the-day"],
    queryFn: async () => {
      const res = await fetch("/api/discover/deal-of-the-day");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 5 * 60_000,
  });

  // Countdown to midnight UTC (when deal rotates)
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setUTCHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) return <DealOfTheDaySkeleton />;
  if (!deal) return null;

  const filledPct = deal.totalSlots > 0 ? Math.round((deal.filledSlots / deal.totalSlots) * 100) : 0;
  const spotsLeft = deal.totalSlots - deal.filledSlots;
  const isAlmostFull = filledPct >= 70;
  const isUrgent = filledPct >= 90 || spotsLeft <= 3;

  const savings = deal.pricePerSlot && deal.marketPrice
    ? Math.round(((deal.marketPrice - deal.pricePerSlot) / deal.marketPrice) * 100)
    : null;

  const categoryEmoji: Record<string, string> = {
    physical: "📦", digital: "💻", offer: "🎟️",
  };

  return (
    <div className="mb-8" data-testid="deal-of-the-day-section">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-sm">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display leading-none">Deal of the Day</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Rotates in <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">{timeLeft}</span></p>
          </div>
        </div>
        <Link href={`/listings/${deal.id}`}>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
            View deal <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Card */}
      <Link href={`/listings/${deal.id}`} className="block group">
        <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5" data-testid={`deal-of-day-card-${deal.id}`}>
          {/* Image hero */}
          <div className="relative h-52 sm:h-72 bg-muted overflow-hidden">
            {deal.imageUrl ? (
              <img
                src={deal.imageUrl}
                alt={deal.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center">
                <span className="text-6xl">{categoryEmoji[deal.category] ?? "🛒"}</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md" data-testid="badge-deal-of-day">
                <Star className="w-3 h-3" /> Deal of the Day
              </span>
              {savings !== null && savings > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-md" data-testid="badge-savings">
                  Save {savings}%
                </span>
              )}
              {isUrgent && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-md animate-pulse" data-testid="badge-urgent">
                  🔥 {spotsLeft <= 3 ? `Only ${spotsLeft} left!` : "Almost full"}
                </span>
              )}
            </div>

            {/* Bottom content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
                {deal.category === "physical" ? "Physical" : deal.category === "digital" ? "Digital" : "Offer"} · {deal.location || deal.country || "Online"}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight line-clamp-2" data-testid="text-deal-title">{deal.title}</h3>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{deal.description}</p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-foreground">{deal.filledSlots} of {deal.totalSlots} spots filled</span>
                <span className={`font-bold ${isUrgent ? "text-red-600 dark:text-red-400" : isAlmostFull ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`} data-testid="text-fill-pct">{filledPct}% full</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isUrgent ? "bg-red-500" : isAlmostFull ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(filledPct, 100)}%` }}
                  data-testid="progress-bar-fill"
                />
              </div>
              {spotsLeft > 0 && (
                <p className={`text-[11px] mt-1 font-medium ${isUrgent ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} data-testid="text-spots-left">
                  {isUrgent ? `⚡ Only ${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} remaining!` : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} still available`}
                </p>
              )}
            </div>

            {/* Price + CTA row */}
            <div className="flex items-center justify-between gap-3">
              <div>
                {deal.pricePerSlot ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-display text-primary" data-testid="text-price">
                      ${(deal.pricePerSlot / 100).toFixed(0)}
                    </span>
                    {deal.marketPrice && (
                      <span className="text-sm text-muted-foreground line-through">${(deal.marketPrice / 100).toFixed(0)}</span>
                    )}
                    <span className="text-xs text-muted-foreground">/ person</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Price on request</span>
                )}
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                  By <span className="font-medium text-foreground">{deal.creator?.firstName} {deal.creator?.lastName}</span>
                  {deal.creator?.verificationStatus === "verified" && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold border border-blue-300/30">
                      <CheckCircle className="w-2.5 h-2.5" /> ID
                    </span>
                  )}
                  {deal.creator?.reliabilityScore !== undefined && deal.creator.reliabilityScore >= 70 && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-300/30">
                      <Star className="w-2.5 h-2.5" /> Trusted
                    </span>
                  )}
                  {deal.creator?.completedParticipations !== undefined && deal.creator.completedParticipations > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      · {deal.creator.completedParticipations} deals
                    </span>
                  )}
                </p>
              </div>
              <Button size="sm" className="gap-1.5 shrink-0 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white border-0 shadow-sm" data-testid="button-view-deal">
                <Zap className="w-3.5 h-3.5" /> Join Deal
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function DiscoverySectionSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="min-w-[280px] flex-shrink-0">
          <Skeleton className="h-[200px] w-full rounded-2xl mb-3" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function DiscoverySection({ title, icon, queryKey, endpoint }: { title: string, icon: React.ReactNode, queryKey: string, endpoint: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: sectionListings, isLoading } = useQuery<any[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60000,
  });

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8" data-testid={`section-${queryKey}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            {icon}
            {title}
          </h2>
        </div>
        <DiscoverySectionSkeleton />
      </div>
    );
  }

  if (!sectionListings || sectionListings.length === 0) return (
    <div className="mb-8" data-testid={`section-${queryKey}-empty`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          {icon}
          {title}
        </h2>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="min-w-[240px] flex-shrink-0 p-4 rounded-2xl border border-dashed border-border/50 bg-muted/20 flex items-center justify-center h-[160px]">
            <div className="text-center">
              <div className="text-2xl mb-1">✨</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mb-8" data-testid={`section-${queryKey}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full border border-border hover:bg-secondary transition-colors"
            aria-label="Scroll left"
            data-testid={`button-scroll-left-${queryKey}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full border border-border hover:bg-secondary transition-colors"
            aria-label="Scroll right"
            data-testid={`button-scroll-right-${queryKey}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
          {sectionListings.map((listing: any) => (
            <div key={listing.id} className="min-w-[280px] max-w-[300px] flex-shrink-0 snap-start">
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

export default function Home() {
  const explore = useExploreListingsPage({ basePath: "/explore" });
  const {
    t,
    user,
    search,
    isFiltering,
    platformStats,
    allListings,
    listings,
    isLoading,
    error,
    isFetching,
    page,
    setPage,
    listingsPageSize,
    clearAllFilters,
  } = explore;

  return (
    <Layout>
      <AISuggestionsBanner />
      <ReferralBanner />

      {/* Hero section — only shown when not filtering */}
      {!isFiltering && !user && (
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/15 p-8 text-center overflow-hidden relative" data-testid="hero-banner">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">{t("home.heroPlatform")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-3">{t("home.heroTitle")}</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
              {t("home.heroDesc")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-primary" />
                <span>{t("home.heroFeature1")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <span>{t("home.heroFeature2")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4 text-primary" />
                <span>{t("home.heroFeature3")}</span>
              </div>
            </div>
            <Link href="/api/login">
              <Button size="lg" className="px-8 shadow-lg shadow-primary/25" data-testid="button-hero-cta">
                {t("home.heroCta")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Platform stats bar */}
      {!isFiltering && platformStats && (platformStats.activeListings > 0 || platformStats.totalMembers > 0) && (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-6 py-3 px-4 rounded-2xl bg-muted/40 border border-border/50 text-sm" data-testid="stats-bar">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="w-4 h-4 text-primary" />
            <span>
              <strong className="text-foreground font-semibold">{platformStats.activeListings}</strong>
              {" "}active {platformStats.activeListings === 1 ? "deal" : "deals"}
            </span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>
              <strong className="text-foreground font-semibold">{platformStats.totalMembers}</strong>
              {" "}{platformStats.totalMembers === 1 ? "member" : "members"}
            </span>
          </div>
        </div>
      )}

      <ExploreFiltersToolbar
        {...explore}
        titleBlock={
          user ? (
            <>
              <h1 className="text-2xl font-display font-bold">
                {(() => {
                  const hour = new Date().getHours();
                  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
                  const firstName = (user as any).firstName;
                  return firstName ? `${greeting}, ${firstName}` : t("home.title");
                })()}
              </h1>
              <p className="text-sm text-muted-foreground">{t("home.subtitle")}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold">{t("home.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("home.subtitle")}</p>
            </>
          )
        }
      />

      {!isFiltering && (
        <div className="mb-8">
          <DealOfTheDay />
          <DiscoverySection
            title={t("home.trending", "Trending")}
            icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
            queryKey="discover-trending"
            endpoint="/api/discover/trending"
          />
          <DiscoverySection
            title={t("home.endingSoon", "Ending Soon")}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            queryKey="discover-expiring"
            endpoint="/api/discover/expiring-soon"
          />
          <DiscoverySection
            title={t("home.recentlyAdded", "Recently Added")}
            icon={<Sparkles className="w-5 h-5 text-blue-500" />}
            queryKey="discover-recent"
            endpoint="/api/discover/recent"
          />
          <DiscoverySection
            title={t("home.nearCompletion", "Filling Up Fast")}
            icon={<Flame className="w-5 h-5 text-rose-500" />}
            queryKey="discover-near-completion"
            endpoint="/api/discover/near-completion"
          />
          <ActivityFeedSection />
        </div>
      )}

      {isFiltering && (
        <>
          {isLoading && page === 1 ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center p-12 bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive">
              {t("common.error")}
            </div>
          ) : allListings.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-3xl border border-dashed border-border space-y-4" data-testid="no-results-state">
              <div className="text-5xl mb-2">🔍</div>
              <h3 className="text-xl font-bold font-display">{t("home.noListings", "No deals found")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">{t("home.noListingsHint", "Try adjusting your search or filters.")}</p>
              {search && (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p className="font-medium">Try:</p>
                  <ul className="list-none"><li>· Different or shorter keywords</li><li>· Removing some filters</li></ul>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button variant="outline" onClick={clearAllFilters} data-testid="button-clear-filters">
                  Clear all filters
                </Button>
                <Link href="/create"><Button data-testid="button-create-deal-empty">Create a Deal</Button></Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allListings.map((listing: any) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              {listings && listings.length === listingsPageSize && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={isFetching} data-testid="button-load-more">
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {t("home.loadMore", "Load More")}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {!isFiltering && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold">{t("home.allListings", "All Listings")}</h2>
          </div>
          {isLoading && page === 1 ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : allListings.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-3xl border border-dashed border-border space-y-4" data-testid="no-results-state">
              <div className="text-5xl mb-2">🔍</div>
              <h3 className="text-xl font-bold font-display">{t("home.noListings", "No deals found")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">{t("home.noListingsHint", "Try adjusting your search or filters.")}</p>
              {search && (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p className="font-medium">Try:</p>
                  <ul className="list-none"><li>· Different or shorter keywords</li><li>· Removing some filters</li></ul>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button variant="outline" onClick={clearAllFilters} data-testid="button-clear-filters">
                  Clear all filters
                </Button>
                <Link href="/create"><Button data-testid="button-create-deal-empty">Create a Deal</Button></Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allListings.map((listing: any) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              {listings && listings.length === listingsPageSize && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={isFetching} data-testid="button-load-more">
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {t("home.loadMore", "Load More")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Layout>
  );
}
