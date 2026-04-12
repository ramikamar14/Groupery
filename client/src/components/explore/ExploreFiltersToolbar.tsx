import type { ReactNode } from "react";
import type { useExploreListingsPage } from "@/hooks/use-explore-listings-page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Search,
  Loader2,
  MapPin,
  X,
  Zap,
  Globe,
  Languages,
  User,
  Store,
  Clock,
  BookmarkPlus,
  Tag,
  SlidersHorizontal,
} from "lucide-react";
import { EXPLORE_COUNTRIES, EXPLORE_LANGUAGES } from "@/lib/explore-filters-data";

export type ExploreListingsPageState = ReturnType<typeof useExploreListingsPage>;

export function ExploreFiltersToolbar({
  titleBlock,
  ...p
}: ExploreListingsPageState & { titleBlock: ReactNode }) {
  const {
    t,
    user,
    searchInput,
    searchContainerRef,
    category,
    setCategory,
    sellerType,
    setSellerType,
    country,
    setCountry,
    language,
    setLanguage,
    fillingFast,
    setFillingFast,
    selectedTag,
    setSelectedTag,
    userLocation,
    setUserLocation,
    isLocating,
    recentSearches,
    showSuggestions,
    setShowSuggestions,
    showRecentSearches,
    setShowRecentSearches,
    isFiltering,
    popularTags,
    saveSearchMutation,
    suggestions,
    handleSearchInputChange,
    handleSelectSuggestion,
    handleSearchKeyDown,
    clearRecentSearch,
    handleGetLocation,
    clearLocation,
    activeFilterCount,
  } = p;

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">{titleBlock}</div>

        <div className="relative w-full sm:w-72" ref={searchContainerRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Input
            placeholder={t("home.search")}
            className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-all"
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onFocus={() => {
              if (searchInput.length >= 2) setShowSuggestions(true);
              else if (recentSearches.length > 0) setShowRecentSearches(true);
            }}
            onKeyDown={handleSearchKeyDown}
            data-testid="input-search"
            autoComplete="off"
          />
          {showSuggestions && suggestions && suggestions.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md z-50 max-h-60 overflow-y-auto"
              data-testid="search-suggestions"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted cursor-pointer flex items-center gap-2"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(suggestion);
                  }}
                  data-testid={`suggestion-item-${index}`}
                >
                  <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
          {showRecentSearches && !showSuggestions && recentSearches.length > 0 && searchInput.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md z-50" data-testid="recent-searches">
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Recent searches</div>
              {recentSearches.map((query, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted cursor-pointer group" data-testid={`recent-search-${index}`}>
                  <button
                    type="button"
                    className="flex items-center gap-2 flex-1 text-left"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(query);
                    }}
                  >
                    <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{query}</span>
                  </button>
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                    onMouseDown={(e) => clearRecentSearch(query, e)}
                    data-testid={`clear-recent-${index}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2" data-testid="segment-tabs">
        <Button
          type="button"
          onClick={() => setSellerType(undefined)}
          variant={sellerType === undefined ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          data-testid="segment-all"
        >
          {t("home.all")}
        </Button>
        <Button
          type="button"
          onClick={() => setSellerType(sellerType === "individual" ? undefined : "individual")}
          variant={sellerType === "individual" ? "default" : "outline"}
          size="sm"
          className="rounded-full flex items-center gap-1.5"
          data-testid="segment-individuals"
        >
          <User className="w-3.5 h-3.5" />
          {t("home.individuals")}
        </Button>
        <Button
          type="button"
          onClick={() => setSellerType(sellerType === "vendor" ? undefined : "vendor")}
          variant={sellerType === "vendor" ? "default" : "outline"}
          size="sm"
          className="rounded-full flex items-center gap-1.5"
          data-testid="segment-businesses"
        >
          <Store className="w-3.5 h-3.5" />
          {t("home.businesses")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => setCategory(undefined)}
          variant={category === undefined ? "default" : "secondary"}
          size="sm"
          className="rounded-full"
          data-testid="filter-all"
        >
          {t("home.all")}
        </Button>
        {[
          { key: "physical", label: t("home.physical") },
          { key: "digital", label: t("home.digital") },
          { key: "offer", label: t("home.offer") },
        ].map((cat) => (
          <Button
            key={cat.key}
            type="button"
            onClick={() => setCategory(cat.key as "physical" | "digital" | "offer")}
            variant={category === cat.key ? "default" : "secondary"}
            size="sm"
            className="rounded-full"
            data-testid={`filter-${cat.key}`}
          >
            {cat.label}
          </Button>
        ))}

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant={activeFilterCount > 0 ? "default" : "outline"}
              size="sm"
              className="rounded-full ml-auto sm:ml-0"
              data-testid="button-open-filters"
            >
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              {t("home.filters")}
              {activeFilterCount > 0 && (
                <span className="ml-1.5 bg-background/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{activeFilterCount}</span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                {t("home.filters")}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("home.sellerType")}</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => setSellerType(sellerType === "individual" ? undefined : "individual")}
                    variant={sellerType === "individual" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full flex-1"
                    data-testid="filter-individual"
                  >
                    <User className="w-4 h-4 mr-1" />
                    {t("home.individuals")}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setSellerType(sellerType === "vendor" ? undefined : "vendor")}
                    variant={sellerType === "vendor" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full flex-1"
                    data-testid="filter-vendor"
                  >
                    <Store className="w-4 h-4 mr-1" />
                    {t("home.shops")}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("home.country")}</p>
                <Select value={country || "all"} onValueChange={(v) => setCountry(v === "all" ? undefined : v)}>
                  <SelectTrigger data-testid="filter-country">
                    <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={t("home.country")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("home.allCountries")}</SelectItem>
                    {EXPLORE_COUNTRIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("home.language")}</p>
                <Select value={language || "all"} onValueChange={(v) => setLanguage(v === "all" ? undefined : v)}>
                  <SelectTrigger data-testid="filter-language">
                    <Languages className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={t("home.language")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("home.allLanguages")}</SelectItem>
                    {EXPLORE_LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("home.quickFilters")}</p>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={() => setFillingFast(!fillingFast)}
                    variant={fillingFast ? "default" : "outline"}
                    size="sm"
                    className="rounded-full justify-start"
                    data-testid="filter-filling-fast"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    {t("home.fillingFast")}
                  </Button>
                  {userLocation ? (
                    <Button type="button" variant="outline" size="sm" onClick={clearLocation} className="rounded-full justify-start" data-testid="button-clear-location">
                      <MapPin className="w-4 h-4 mr-1 text-green-500" />
                      {t("home.nearby")}
                      <X className="w-3 h-3 ml-auto" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="rounded-full justify-start"
                      data-testid="button-nearby"
                    >
                      {isLocating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <MapPin className="w-4 h-4 mr-1" />}
                      {isLocating ? t("home.locating") : t("home.nearby")}
                    </Button>
                  )}
                </div>
              </div>

              {popularTags && popularTags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("home.filterTags")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {popularTags.slice(0, 15).map((pt) => (
                      <button
                        key={pt.tag}
                        type="button"
                        onClick={() => setSelectedTag(selectedTag === pt.tag ? undefined : pt.tag)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selectedTag === pt.tag ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:border-primary/50"}`}
                        data-testid={`button-tag-filter-${pt.tag}`}
                      >
                        {pt.tag}
                        <span className="ml-1 opacity-60">({pt.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isFiltering && user && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full"
                  onClick={() => saveSearchMutation.mutate()}
                  disabled={saveSearchMutation.isPending}
                  data-testid="button-save-search"
                >
                  {saveSearchMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <BookmarkPlus className="w-4 h-4 mr-1" />
                  )}
                  {t("home.saveSearch", "Save This Search")}
                </Button>
              )}

              {activeFilterCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive"
                  onClick={() => {
                    setSellerType(undefined);
                    setCountry(undefined);
                    setLanguage(undefined);
                    setFillingFast(false);
                    setUserLocation(null);
                    setSelectedTag(undefined);
                  }}
                  data-testid="button-clear-filters"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear all filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {(selectedTag || fillingFast || userLocation) && (
        <div className="flex flex-wrap items-center gap-2" data-testid="active-filters">
          {selectedTag && (
            <Badge variant="default" className="text-xs rounded-full" data-testid={`active-tag-filter-${selectedTag}`}>
              <Tag className="w-3 h-3 mr-1" />
              {selectedTag}
              <button type="button" onClick={() => setSelectedTag(undefined)} className="ml-1" data-testid="button-clear-tag-filter">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {fillingFast && (
            <Badge variant="default" className="text-xs rounded-full bg-amber-500 hover:bg-amber-500" data-testid="active-filling-fast">
              <Zap className="w-3 h-3 mr-1" />
              Filling Fast
              <button type="button" onClick={() => setFillingFast(false)} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {userLocation && (
            <Badge variant="default" className="text-xs rounded-full bg-green-600 hover:bg-green-600" data-testid="active-nearby">
              <MapPin className="w-3 h-3 mr-1" />
              Nearby
              <button type="button" onClick={() => setUserLocation(null)} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
