import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import { useListings, LISTINGS_PAGE_SIZE } from "@/hooks/use-listings";
import { useTranslation } from "react-i18next";

export function useExploreListingsPage(options?: { basePath?: string }) {
  const basePath = options?.basePath ?? "/";
  const { t } = useTranslation();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchInput, 300);
  const [category, setCategory] = useState<"physical" | "digital" | "offer" | undefined>(undefined);
  const [sellerType, setSellerType] = useState<"individual" | "vendor" | undefined>(undefined);
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [fillingFast, setFillingFast] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [page, setPage] = useState(1);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("grouperry-recent-searches") || "[]");
    } catch {
      return [];
    }
  });
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        localStorage.setItem("grouperry-pending-referral", ref);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    const pendingRef = localStorage.getItem("grouperry-pending-referral");
    if (!pendingRef || pendingRef === (user as any).id) return;
    localStorage.removeItem("grouperry-pending-referral");
    fetch("/api/referrals/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ referrerId: pendingRef }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.created) {
          queryClient.invalidateQueries({ queryKey: ["/api/referrals/stats"] });
        }
      })
      .catch(() => {});
  }, [user]);

  const { toast } = useToast();

  const { data: popularTags } = useQuery<{ tag: string; count: number }[]>({
    queryKey: ["/api/tags/popular"],
    queryFn: () => fetch("/api/tags/popular").then((r) => r.json()),
    staleTime: 300000,
  });

  const { data: platformStats } = useQuery<{ activeListings: number; totalMembers: number }>({
    queryKey: ["/api/stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
    staleTime: 60000,
  });

  const isFiltering = !!(
    search ||
    category ||
    sellerType ||
    country ||
    language ||
    fillingFast ||
    userLocation ||
    selectedTag
  );

  const saveSearchMutation = useMutation({
    mutationFn: async () => {
      const filters: any = {};
      if (category) filters.category = category;
      if (sellerType) filters.sellerType = sellerType;
      if (country) filters.country = country;
      if (language) filters.language = language;
      if (fillingFast) filters.fillingFast = true;
      return apiRequest("POST", "/api/saved-searches", {
        query: search || null,
        filters,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-searches"] });
      toast({
        title: t("home.searchSaved", "Search Saved"),
        description: t("home.searchSavedDesc", "You'll be notified when new matching listings appear."),
      });
    },
    onError: (err: any) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    },
  });

  const { data: suggestions } = useQuery<string[]>({
    queryKey: ["/api/search/suggestions", `?q=${encodeURIComponent(debouncedQuery)}`],
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim() || query.length < 2) return;
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem("grouperry-recent-searches", JSON.stringify(updated));
    } catch {}
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    setSearch(value);
    setShowSuggestions(value.length >= 2);
    setShowRecentSearches(value.length === 0);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setSearch(suggestion);
    setShowSuggestions(false);
    setShowRecentSearches(false);
    saveRecentSearch(suggestion);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchInput.trim()) {
      saveRecentSearch(searchInput.trim());
      setShowSuggestions(false);
      setShowRecentSearches(false);
    }
  };

  const clearRecentSearch = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== query);
    setRecentSearches(updated);
    try {
      localStorage.setItem("grouperry-recent-searches", JSON.stringify(updated));
    } catch {}
  };

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        setSearch(q);
        setSearchInput(q);
      }
      const cat = params.get("category");
      if (cat) setCategory(cat as any);
      const st = params.get("sellerType");
      if (st) setSellerType(st as any);
      const co = params.get("country");
      if (co) setCountry(co);
      const la = params.get("language");
      if (la) setLanguage(la);
      const ff = params.get("fillingFast");
      if (ff === "1") setFillingFast(true);
      const tag = params.get("tag");
      if (tag) setSelectedTag(tag);
    } catch {}
  }, []);

  const filtersKey = JSON.stringify({ search, category, sellerType, country, language, fillingFast, selectedTag });
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (sellerType) params.set("sellerType", sellerType);
    if (country) params.set("country", country);
    if (language) params.set("language", language);
    if (fillingFast) params.set("fillingFast", "1");
    if (selectedTag) params.set("tag", selectedTag);
    const qs = params.toString();
    const newUrl = qs ? `${basePath}?${qs}` : basePath;
    const expectedSearch = qs ? `?${qs}` : "";
    if (window.location.pathname !== basePath || window.location.search !== expectedSearch) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [filtersKey, basePath]);

  const allFiltersKey = JSON.stringify({
    search,
    category,
    sellerType,
    country,
    language,
    fillingFast,
    selectedTag,
    userLocation,
  });
  useEffect(() => {
    setPage(1);
    setAllListings([]);
  }, [allFiltersKey]);

  const { data: listings, isLoading, error, isFetching } = useListings({
    search,
    category,
    sellerType,
    country,
    language,
    fillingFast: fillingFast || undefined,
    tag: selectedTag,
    lat: userLocation?.lat,
    lng: userLocation?.lng,
    radius: userLocation ? 0.1 : undefined,
    page,
  });

  useEffect(() => {
    if (!listings) return;
    if (page === 1) {
      setAllListings(listings);
    } else {
      setAllListings((prev) => {
        const existingIds = new Set(prev.map((l: any) => l.id));
        const newItems = listings.filter((l: any) => !existingIds.has(l.id));
        return [...prev, ...newItems];
      });
    }
  }, [listings, page]);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: t("common.error"), description: t("home.geolocationNotSupported"), variant: "destructive" });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
        toast({ title: t("home.locationFound"), description: t("home.showingNearby") });
      },
      (err) => {
        setIsLocating(false);
        toast({
          title: t("home.locationError"),
          description: err.message || "Could not get your location.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [toast, t]);

  const clearLocation = () => {
    setUserLocation(null);
  };

  const activeFilterCount =
    [country, language, fillingFast ? "fill" : null, userLocation ? "loc" : null, selectedTag].filter(Boolean).length +
    (sellerType ? 1 : 0);

  const clearAllFilters = () => {
    setSearch("");
    setSearchInput("");
    setCategory(undefined);
    setSellerType(undefined);
    setCountry(undefined);
    setLanguage(undefined);
    setFillingFast(false);
    setSelectedTag(undefined);
    setUserLocation(null);
  };

  return {
    t,
    user,
    search,
    setSearch,
    searchInput,
    searchContainerRef,
    debouncedQuery,
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
    page,
    setPage,
    allListings,
    recentSearches,
    showSuggestions,
    setShowSuggestions,
    showRecentSearches,
    setShowRecentSearches,
    isFiltering,
    popularTags,
    platformStats,
    saveSearchMutation,
    suggestions,
    listings,
    isLoading,
    error,
    isFetching,
    handleSearchInputChange,
    handleSelectSuggestion,
    handleSearchKeyDown,
    clearRecentSearch,
    handleGetLocation,
    clearLocation,
    activeFilterCount,
    clearAllFilters,
    listingsPageSize: LISTINGS_PAGE_SIZE,
  };
}
