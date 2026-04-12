import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Search, Package, Globe, Calendar, Users } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Listing } from "@shared/schema";

type ListingWithCreator = Listing & {
  creator?: { firstName?: string; lastName?: string; profileImageUrl?: string; email?: string };
  tags?: { tag: string }[];
};

const CATEGORY_LABELS: Record<string, string> = {
  physical: "Physical",
  digital: "Digital",
  offer: "Offer",
};

const CATEGORY_COLORS: Record<string, string> = {
  physical: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  digital: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  offer: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

function ExpiredListingCard({ listing }: { listing: ListingWithCreator }) {
  const fillPct = listing.totalSlots > 0 ? Math.round((listing.filledSlots / listing.totalSlots) * 100) : 0;
  const creatorName = listing.creator
    ? [listing.creator.firstName, listing.creator.lastName].filter(Boolean).join(" ") || listing.creator.email || "Unknown"
    : "Unknown";

  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden opacity-75 hover:opacity-90 transition-opacity" data-testid={`card-expired-listing-${listing.id}`}>
      {listing.imageUrl && (
        <div className="relative h-36 bg-muted overflow-hidden">
          <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover grayscale-[40%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-2 left-2">
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", CATEGORY_COLORS[listing.category])}>
              {CATEGORY_LABELS[listing.category]}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-900/70 text-slate-200 border border-slate-700/50">
              <Clock className="w-2.5 h-2.5 inline mr-0.5 -mt-px" />
              Expired
            </span>
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">{listing.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {listing.filledSlots}/{listing.totalSlots} filled
            </span>
            <span className="font-medium">{fillPct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        {listing.expiresAt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <Calendar className="w-3 h-3" />
            Expired {formatDistanceToNow(new Date(listing.expiresAt), { addSuffix: true })}
            <span className="text-muted-foreground/60 ml-1">({format(new Date(listing.expiresAt), "MMM d, yyyy")})</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
          <Avatar className="w-5 h-5">
            <AvatarImage src={listing.creator?.profileImageUrl ?? undefined} />
            <AvatarFallback className="text-[10px]">{creatorName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{creatorName}</span>
          {listing.tags && listing.tags.length > 0 && (
            <div className="ml-auto flex gap-1 flex-wrap justify-end">
              {listing.tags.slice(0, 2).map(t => (
                <span key={t.tag} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{t.tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExpiredListings() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: allListings = [], isLoading } = useQuery<ListingWithCreator[]>({
    queryKey: ["/api/listings"],
  });

  const expired = allListings.filter(l =>
    l.status === "expired" || l.status === "completed" || l.status === "cancelled"
  );

  const filtered = expired.filter(l => {
    if (category !== "all" && l.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const statusCounts = {
    expired: expired.filter(l => l.status === "expired").length,
    completed: expired.filter(l => l.status === "completed").length,
    cancelled: expired.filter(l => l.status === "cancelled").length,
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold font-display">Past Listings</h1>
          </div>
          <p className="text-muted-foreground text-sm">Browse the history of all expired, completed and cancelled group buys.</p>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Badge variant="outline" className="text-xs">
              {expired.length} total past listings
            </Badge>
            {statusCounts.expired > 0 && (
              <Badge variant="outline" className="text-xs text-slate-500">
                {statusCounts.expired} expired
              </Badge>
            )}
            {statusCounts.completed > 0 && (
              <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200">
                {statusCounts.completed} completed
              </Badge>
            )}
            {statusCounts.cancelled > 0 && (
              <Badge variant="outline" className="text-xs text-rose-500">
                {statusCounts.cancelled} cancelled
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search past listings..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-search-expired"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-category-expired">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No past listings found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {search || category !== "all" ? "Try adjusting your filters." : "Once group buys expire or complete, they'll appear here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(l => (
              <ExpiredListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
