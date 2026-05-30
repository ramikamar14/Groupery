import { useMemo } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { AISuggestionsBanner } from "@/components/explore/AISuggestionsBanner";
import { ReferralBanner } from "@/components/explore/ReferralBanner";
import { ActivityFeedSection } from "@/components/explore/ActivityFeedSection";
import { ExploreFiltersToolbar } from "@/components/explore/ExploreFiltersToolbar";
import { useExploreListingsPage } from "@/hooks/use-explore-listings-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscoverDealOfTheDay } from "@/components/discover/DiscoverDealOfTheDay";
import { DiscoverDiscoverySection } from "@/components/discover/DiscoverDiscoverySection";
import { DiscoverListingCard } from "@/components/discover/DiscoverListingCard";
import { mapListingForDiscover } from "@/components/discover/mapListing";
import type { ListingWithCreator } from "@shared/schema";
import { api } from "@shared/routes";
import { Loader2, TrendingUp, Clock, MapPin, Flame, PackageSearch } from "lucide-react";

function mapDiscoverListings(rows: unknown): ReturnType<typeof mapListingForDiscover>[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => mapListingForDiscover(row as ListingWithCreator));
}

export default function Discover() {
  const { t } = useTranslation();
  const explore = useExploreListingsPage({ basePath: "/" });
  const {
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
    search,
    userLocation,
  } = explore;

  const { data: dealRaw, isLoading: dealLoading } = useQuery({
    queryKey: ["/api/discover/deal-of-the-day"],
    queryFn: async () => {
      const res = await fetch("/api/discover/deal-of-the-day");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 5 * 60_000,
  });

  const dealCard = useMemo(() => {
    if (!dealRaw) return null;
    try {
      return mapListingForDiscover(dealRaw as ListingWithCreator);
    } catch {
      return null;
    }
  }, [dealRaw]);

  const dealSavePct =
    dealCard && dealCard.originalPrice > 0 && dealCard.groupPrice > 0
      ? Math.round((1 - dealCard.groupPrice / dealCard.originalPrice) * 100)
      : 0;

  const { data: trendingRaw } = useQuery({
    queryKey: ["discover-ui-trending"],
    queryFn: async () => {
      const res = await fetch("/api/discover/trending", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: expiringRaw } = useQuery({
    queryKey: ["discover-ui-expiring"],
    queryFn: async () => {
      const res = await fetch("/api/discover/expiring-soon", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: nearCompletionRaw } = useQuery({
    queryKey: ["discover-ui-near-completion"],
    queryFn: async () => {
      const res = await fetch("/api/discover/near-completion", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: nearRaw } = useQuery({
    queryKey: ["discover-ui-near-you", userLocation?.lat, userLocation?.lng],
    queryFn: async () => {
      const url = new URL(api.listings.list.path, window.location.origin);
      url.searchParams.set("lat", String(userLocation!.lat));
      url.searchParams.set("lng", String(userLocation!.lng));
      url.searchParams.set("radius", "0.1");
      url.searchParams.set("page", "1");
      url.searchParams.set("limit", "12");
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userLocation && !isFiltering,
    staleTime: 60_000,
  });

  const trendingCards = useMemo(() => mapDiscoverListings(trendingRaw), [trendingRaw]);
  const expiringCards = useMemo(() => mapDiscoverListings(expiringRaw), [expiringRaw]);
  const nearCompletionCards = useMemo(() => mapDiscoverListings(nearCompletionRaw), [nearCompletionRaw]);
  const nearYouCards = useMemo(() => mapDiscoverListings(nearRaw), [nearRaw]);

  const joinLabel = t("discover.joinDeal");

  const grid = (
    <>
      {isLoading && page === 1 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center p-12 bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive">{t("common.error")}</div>
      ) : allListings.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-3xl border border-dashed border-border/70 space-y-4 px-6" data-testid="no-results-state">
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center">
            <PackageSearch className="w-8 h-8 text-muted-foreground/60" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-display">
              {isFiltering || search
                ? t("home.noListings", "No deals found")
                : t("home.noDealsYet", "No deals yet")}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {isFiltering || search
                ? (search ? t("home.noListingsSearchHint", "Try different keywords or fewer filters.") : t("home.noListingsHint", "Try adjusting your filters."))
                : t("home.noDealsYetHint", "Be the first to start one!")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            {(isFiltering || search) && (
              <Button variant="outline" size="sm" className="rounded-full w-full sm:w-auto" onClick={clearAllFilters} data-testid="button-clear-filters">
                {t("home.clearFilters", "Clear filters")}
              </Button>
            )}
            <Button size="sm" className="rounded-full w-full sm:w-auto" asChild>
              <Link href="/create" data-testid="button-create-deal-empty">
                {isFiltering || search
                  ? t("home.createDeal", "Create a Deal")
                  : t("home.startGroupBuy", "Start a Group Buy")}
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allListings.map((listing: any) => (
              <DiscoverListingCard key={listing.id} listing={mapListingForDiscover(listing as ListingWithCreator)} joinLabel={joinLabel} />
            ))}
          </div>
          {listings && listings.length === listingsPageSize ? (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={isFetching} data-testid="button-load-more">
                {isFetching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t("home.loadMore", "Load More")}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </>
  );

  return (
    <Layout>
      <AISuggestionsBanner />
      <ReferralBanner />

      <ExploreFiltersToolbar
        {...explore}
        titleBlock={
          <div className="space-y-1.5">
            <h1 className="text-2xl font-display font-bold">{t("discover.title")}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-sm text-muted-foreground">{t("discover.subtitle")}</p>
              {!isFiltering && platformStats && (platformStats.activeListings > 0 || platformStats.totalMembers > 0) && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  <strong className="text-foreground">{platformStats.activeListings}</strong> deals ·{" "}
                  <strong className="text-foreground">{platformStats.totalMembers}</strong> members
                </span>
              )}
            </div>
          </div>
        }
      />

      {!isFiltering ? (
        <div className="mb-8 space-y-2">
          {dealLoading ? (
            <Skeleton className="w-full min-h-[320px] rounded-3xl mb-8" />
          ) : dealCard ? (
            <DiscoverDealOfTheDay
              listing={dealCard}
              description={String((dealRaw as any)?.description ?? "")}
              joinLabel={joinLabel}
              badgeDeal={t("discover.dealOfDay")}
              saveBadgeText={dealSavePct > 0 ? t("discover.savePct", { n: dealSavePct }) : ""}
              joinedLabel={t("discover.joinedLine")}
              filledLabel={t("discover.percentFull")}
            />
          ) : null}

          <DiscoverDiscoverySection
            title={t("discover.trending")}
            icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
            listings={trendingCards}
            joinLabel={joinLabel}
          />
          <DiscoverDiscoverySection
            title={t("discover.endingSoon")}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            listings={expiringCards}
            joinLabel={joinLabel}
          />
          {userLocation ? (
            <DiscoverDiscoverySection
              title={t("discover.nearYou")}
              icon={<MapPin className="w-5 h-5 text-green-500" />}
              listings={nearYouCards}
              joinLabel={joinLabel}
            />
          ) : null}
          <DiscoverDiscoverySection
            title={t("discover.fillingFast")}
            icon={<Flame className="w-5 h-5 text-rose-500" />}
            listings={nearCompletionCards}
            joinLabel={joinLabel}
          />
          <ActivityFeedSection />
        </div>
      ) : null}

      {isFiltering ? <div className="mb-10">{grid}</div> : null}

      {!isFiltering ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold">{t("discover.allDeals")}</h2>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs" asChild>
              <Link href="/create">
                <span>+ {t("discover.createDeal", "Create a deal")}</span>
              </Link>
            </Button>
          </div>
          {grid}
        </div>
      ) : null}
    </Layout>
  );
}
