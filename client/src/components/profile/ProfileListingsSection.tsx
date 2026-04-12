import { Users, Tag, ArrowUpRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { Listing } from "@shared/schema";
function listingStatusClass(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    case "completed":
      return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    case "expired":
      return "bg-amber-100 dark:bg-amber-900/25 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "cancelled":
      return "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function ProfileListingMiniCard({ listing }: { listing: Listing }) {
  const { t } = useTranslation();
  const groupCents = listing.pricePerSlot ?? 0;
  const marketCents = listing.marketPrice ?? groupCents;
  const price = groupCents / 100;
  const original = Math.max(marketCents, groupCents) / 100;
  const discount =
    marketCents > 0 && marketCents > groupCents ? Math.round((1 - groupCents / marketCents) * 100) : 0;
  const fillPct = Math.min(100, Math.round((listing.filledSlots / Math.max(1, listing.totalSlots)) * 100));

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="group overflow-hidden border-border hover:border-accent/40 hover:shadow-md transition-all duration-200 h-full">
        <div className="relative h-36 bg-muted overflow-hidden">
          <img
            src={listing.imageUrl || "https://placehold.co/600x400?text=Grouperry"}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <div className="absolute top-2 left-2">
              <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize", listingStatusClass(listing.status))}>
              {listing.status}
            </span>
          </div>
        </div>
        <CardContent className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            {listing.category || t("home.all")}
          </div>
          <h4 className="text-sm font-semibold text-foreground leading-tight mb-2 line-clamp-2">{listing.title}</h4>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-base font-bold text-accent">{groupCents > 0 ? `$${price.toFixed(2)}` : "—"}</span>
            {original > price && (
              <span className="text-xs text-muted-foreground line-through">${original.toFixed(2)}</span>
            )}
          </div>
          <div className="mb-1.5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {t("profile.slotsFilled", { filled: listing.filledSlots, total: listing.totalSlots })}
              </span>
              <span>{fillPct}%</span>
            </div>
            <Progress value={fillPct} className="h-1.5 bg-muted" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProfileListingsSection({
  listings,
  loading,
}: {
  listings: Listing[];
  loading: boolean;
}) {
  const { t } = useTranslation();
  const preview = listings.slice(0, 4);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Tag className="w-4 h-4 text-accent" />
          {t("profile.myListings")}
          <Badge variant="secondary" className="text-xs font-medium">
            {listings.length}
          </Badge>
        </CardTitle>
        {listings.length > 0 && (
          <Button variant="ghost" size="sm" className="text-accent hover:text-accent text-xs h-7 gap-1 shrink-0" asChild>
            <Link href="/my-groups">
              {t("profile.viewAllListings")}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t("profile.noListings")}</p>
            <Link href="/create">
              <Button variant="ghost" className="mt-2" data-testid="link-create-listing">
                {t("profile.createFirstListing")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {preview.map((listing) => (
              <ProfileListingMiniCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
