import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import { FirstVisitExplainer } from "@/components/discover/FirstVisitExplainer";
import { SortControl } from "@/components/discover/SortControl";
import { sortListings, type ListingSort } from "@/components/discover/sortListings";
import { ListingGridSkeleton } from "@/components/discover/ListingGridSkeleton";
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
  PackageSearch,
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
            <h2 className="text-lg font-bold font-display leading-none">{t("home.dealOfDay", "Deal of the Day")}</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t("home.rotatesIn", "Rotates in")} <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">{timeLeft}</span></p>
          </div>
        </div>
        <Link href={`/listings/${deal.id}`}>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
            {t("home.viewDeal", "View deal")} <ChevronRight className="w-3.5 h-3.5" aria-hidden />
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
                <Star className="w-3 h-3" aria-hidden /> {t("home.dealOfDay", "Deal of the Day")}
              </span>
              {savings !== null && savings > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-md" data-testid="badge-savings">
                  {t("discover.savePct", { n: savings, defaultValue: "Save {{n}}%" })}
                </span>
              )}
              {isUrgent && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-md animate-pulse" data-testid="badge-urgent">
                  🔥 {spotsLeft <= 3
                    ? t("home.onlyNLeft", { count: spotsLeft, defaultValue: "Only {{count}} left!" })
                    : t("home.almostFull", "Almost full")}
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
                <Zap className="w-3.5 h-3.5" aria-hidden /> {t("home.joinDeal", "Join Deal")}
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

  if (!sectionListings || sectionListings.length === 0) return null;

  return (
    <div className="mb-8" data-testid={`section-${queryKey}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold flex items-center gap-2 tracking-tight">
          {icon}
          {title}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-border/70 bg-card hover:bg-secondary hover:border-border flex items-center justify-center transition-all"
            aria-label="Scroll left"
            data-testid={`button-scroll-left-${queryKey}`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-border/70 bg-card hover:bg-secondary hover:border-border flex items-center justify-center transition-all"
            aria-label="Scroll right"
            data-testid={`button-scroll-right-${queryKey}`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
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

  const [sort, setSort] = useState<ListingSort>("newest");
  const sortedListings = useMemo(() => sortListings(allListings, sort), [allListings, sort]);

  return (
    <Layout>
      <AISuggestionsBanner />
      <ReferralBanner />
      <FirstVisitExplainer />

      {/* Hero section — only shown when not filtering */}
      {!isFiltering && !user && (
        <div className="mb-8 rounded-3xl overflow-hidden relative" data-testid="hero-banner">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,hsl(var(--accent)/0.3),transparent)]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-8 md:p-10 text-center">
            <div className="inline-flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <Users className="w-3.5 h-3.5 text-white/80" />
              <span className="text-xs font-semibold text-white/90 tracking-wide">{t("home.heroPlatform")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 text-white tracking-tight">{t("home.heroTitle")}</h2>
            <p className="text-white/75 text-base md:text-lg mb-6 max-w-md mx-auto leading-relaxed">
              {t("home.heroDesc")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/70 mb-7">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-white/60" />
                <span>{t("home.heroFeature1")}</span>
              </div>
              <span className="text-white/30">·</span>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-white/60" />
                <span>{t("home.heroFeature2")}</span>
              </div>
              <span className="text-white/30">·</span>
              <div className="flex items-center gap-1.5">
                <BadgePercent className="w-3.5 h-3.5 text-white/60" />
                <span>{t("home.heroFeature3")}</span>
              </div>
            </div>
            <Link href="/api/login">
              <Button size="lg" className="px-8 bg-white text-primary hover:bg-white/90 font-semibold shadow-xl shadow-black/20 rounded-full" data-testid="button-hero-cta">
                {t("home.heroCta")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}


      <ExploreFiltersToolbar
        {...explore}
        titleBlock={
          <>
            <h1 className="text-2xl font-display font-bold">{t("home.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("home.subtitle")}</p>
          </>
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
            <ListingGridSkeleton count={6} />
          ) : error ? (
            <div className="text-center p-12 bg-destructive/5 rounded-2xl border border-destructive/20 space-y-3" data-testid="listings-error-state">
              <p className="text-destructive font-medium">{t("common.error")}</p>
              <p className="text-sm text-muted-foreground">{t("discover.errorHint", "We couldn't load deals right now. Check your connection and try again.")}</p>
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.location.reload()} data-testid="button-retry">
                {t("discover.retry", "Try again")}
              </Button>
            </div>
          ) : allListings.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-3xl border border-dashed border-border space-y-4" data-testid="no-results-state">
              <PackageSearch className="w-14 h-14 mx-auto text-muted-foreground/40" aria-hidden />
              <h3 className="text-xl font-bold font-display">{search ? t("home.noListings", "No deals found") : t("home.noDealsYetFull", "No deals yet — be the first to start one!")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">{search ? t("home.noListingsSearchHint", "Try different keywords or fewer filters.") : t("home.noListingsHint", "Try adjusting your search or filters.")}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button variant="outline" onClick={clearAllFilters} data-testid="button-clear-filters">
                  {t("home.clearFilters", "Clear all filters")}
                </Button>
                <Link href="/create"><Button data-testid="button-create-deal-empty">{t("home.startGroupBuy", "Start a Group Buy")}</Button></Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <p className="text-sm text-muted-foreground" data-testid="text-result-count" aria-live="polite">
                  {allListings.length === 1
                    ? t("discover.resultCountOne", "1 deal found")
                    : t("discover.resultCount", { count: allListings.length, defaultValue: "{{count}} deals found" })}
                </p>
                <SortControl value={sort} onChange={setSort} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedListings.map((listing: any) => (
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
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-display font-bold tracking-tight">{t("home.allListings", "All Listings")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{t("home.allListingsSubtitle", "Browse every open group deal")}</p>
            </div>
            <SortControl value={sort} onChange={setSort} />
          </div>
          {isLoading && page === 1 ? (
            <ListingGridSkeleton count={6} />
          ) : allListings.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-3xl border border-dashed border-border space-y-4" data-testid="no-results-state">
              <PackageSearch className="w-14 h-14 mx-auto text-muted-foreground/40" aria-hidden />
              <h3 className="text-xl font-bold font-display">{t("home.noDealsYet", "No deals yet")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">{t("home.noDealsYetHint", "Be the first to start one!")}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link href="/create"><Button data-testid="button-create-deal-empty">{t("home.startGroupBuy", "Start a Group Buy")}</Button></Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedListings.map((listing: any) => (
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
