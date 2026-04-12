import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ListingCard } from "@/components/ListingCard";
import { Loader2, Bookmark, Search, Trash2, Filter } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SavedListings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: savedItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/user/saved-listings"],
  });

  const { data: savedSearches = [], isLoading: isLoadingSearches } = useQuery<any[]>({
    queryKey: ["/api/saved-searches"],
  });

  const deleteSearchMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/saved-searches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-searches"] });
      toast({ title: t("saved.searchDeleted", "Search Deleted") });
    },
    onError: (err: any) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    },
  });

  const applySearch = (search: any) => {
    const params = new URLSearchParams();
    if (search.query) params.set("search", search.query);
    const filters = search.filters as any || {};
    if (filters.category) params.set("category", filters.category);
    if (filters.country) params.set("country", filters.country);
    if (filters.language) params.set("language", filters.language);
    if (filters.sellerType) params.set("sellerType", filters.sellerType);
    if (filters.fillingFast) params.set("fillingFast", "true");
    setLocation(`/?${params.toString()}`);
  };

  const formatSearchLabel = (search: any) => {
    const parts: string[] = [];
    if (search.query) parts.push(`"${search.query}"`);
    const filters = search.filters as any || {};
    if (filters.category) parts.push(filters.category);
    if (filters.country) parts.push(filters.country);
    if (filters.language) parts.push(filters.language);
    if (filters.sellerType) parts.push(filters.sellerType);
    if (filters.fillingFast) parts.push(t("home.fillingFast", "Filling Fast"));
    return parts.length > 0 ? parts.join(", ") : t("saved.allListings", "All Listings");
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold" data-testid="text-saved-title">{t("saved.title")}</h1>
        <p className="text-muted-foreground">{t("saved.subtitle")}</p>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-6" data-testid="saved-tabs">
          <TabsTrigger value="listings" data-testid="tab-saved-listings">
            <Bookmark className="w-4 h-4 mr-1" />
            {t("saved.savedListings", "Saved Listings")}
          </TabsTrigger>
          <TabsTrigger value="searches" data-testid="tab-saved-searches">
            <Search className="w-4 h-4 mr-1" />
            {t("saved.savedSearches", "Saved Searches")}
            {savedSearches.length > 0 && (
              <Badge variant="secondary" className="ml-1">{savedSearches.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : savedItems.length === 0 ? (
            <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
              <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-xl font-bold font-display text-muted-foreground mb-2" data-testid="text-no-saved">{t("saved.noSaved")}</h3>
              <p className="text-muted-foreground mb-6">{t("saved.noSavedHint")}</p>
              <div className="flex gap-3 justify-center">
                <Link href="/">
                  <Button data-testid="button-browse-deals" variant="default" size="sm">Browse Deals</Button>
                </Link>
                <Link href="/create">
                  <Button data-testid="button-create-deal" variant="outline" size="sm">Start a Group</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedItems.map((item: any) => (
                <ListingCard key={item.id} listing={item.listing} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="searches">
          {isLoadingSearches ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : savedSearches.length === 0 ? (
            <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h3 className="text-xl font-bold font-display text-muted-foreground mb-2" data-testid="text-no-searches">{t("saved.noSearches", "No Saved Searches")}</h3>
              <p className="text-muted-foreground mb-6">{t("saved.noSearchesHint", "Save a search from the home page to get notified about new matching listings.")}</p>
              <Link href="/">
                <Button data-testid="button-search-deals" variant="default" size="sm">Search Deals</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSearches.map((search: any) => (
                <Card key={search.id} className="p-4" data-testid={`saved-search-${search.id}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate" data-testid={`text-search-label-${search.id}`}>
                          {formatSearchLabel(search)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("saved.savedOn", "Saved on")} {new Date(search.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applySearch(search)}
                        data-testid={`button-apply-search-${search.id}`}
                      >
                        <Search className="w-4 h-4 mr-1" />
                        {t("saved.applySearch", "Search")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSearchMutation.mutate(search.id)}
                        disabled={deleteSearchMutation.isPending}
                        data-testid={`button-delete-search-${search.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
