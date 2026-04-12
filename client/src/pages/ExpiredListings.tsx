import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Search, ArchiveX } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Listing } from "@shared/schema";
import { PastListingCard, PastStatChip, type ListingWithCreator } from "@/components/past-listings/PastListingCard";

export default function ExpiredListings() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: allListings = [], isLoading } = useQuery<ListingWithCreator[]>({
    queryKey: ["/api/listings"],
  });

  const past = useMemo(
    () => allListings.filter((l) => l.status === "expired" || l.status === "completed" || l.status === "cancelled"),
    [allListings]
  );

  const filtered = useMemo(() => {
    return past.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (category !== "all" && l.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const inText = l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
        const inTags = l.tags?.some((tg) => tg.tag.toLowerCase().includes(q)) ?? false;
        if (!inText && !inTags) return false;
      }
      return true;
    });
  }, [past, search, category, statusFilter]);

  const counts = useMemo(
    () => ({
      total: past.length,
      expired: past.filter((l) => l.status === "expired").length,
      completed: past.filter((l) => l.status === "completed").length,
      cancelled: past.filter((l) => l.status === "cancelled").length,
    }),
    [past]
  );

  const filtersActive = Boolean(search.trim() || category !== "all" || statusFilter !== "all");

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-display text-balance">{t("nav.pastListings")}</h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-2xl">{t("pastArchive.subtitle")}</p>

          <div className="flex flex-wrap gap-2">
            <PastStatChip count={counts.total} label={t("pastArchive.statTotal")} variant="total" />
            {counts.expired > 0 && (
              <PastStatChip count={counts.expired} label={t("pastArchive.statExpired")} variant="expired" />
            )}
            {counts.completed > 0 && (
              <PastStatChip count={counts.completed} label={t("pastArchive.statCompleted")} variant="completed" />
            )}
            {counts.cancelled > 0 && (
              <PastStatChip count={counts.cancelled} label={t("pastArchive.statCancelled")} variant="cancelled" />
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t("pastArchive.searchPlaceholder")}
              className="pl-9 bg-card border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-expired"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[11rem] bg-card border-border" data-testid="select-status-expired">
              <SelectValue placeholder={t("pastArchive.filterStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pastArchive.allStatuses")}</SelectItem>
              <SelectItem value="expired">{t("listing.expired")}</SelectItem>
              <SelectItem value="completed">{t("listing.complete")}</SelectItem>
              <SelectItem value="cancelled">{t("listing.cancelled")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[11rem] bg-card border-border" data-testid="select-category-expired">
              <SelectValue placeholder={t("pastArchive.filterCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("home.all")}</SelectItem>
              <SelectItem value="physical">{t("home.physical")}</SelectItem>
              <SelectItem value="digital">{t("home.digital")}</SelectItem>
              <SelectItem value="offer">{t("home.offer")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtersActive && !isLoading && (
          <p className="text-xs text-muted-foreground mb-4">
            {t("pastArchive.showing", { filtered: filtered.length, total: past.length })}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <ArchiveX className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base mb-1">{t("pastArchive.emptyTitle")}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {filtersActive ? t("pastArchive.emptyFiltered") : t("pastArchive.emptyHint")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((l) => (
              <PastListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
