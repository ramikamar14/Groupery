import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Monitor, Package, Ticket, Zap, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DiscoverCardListing } from "./mapListing";
import { fillRatio } from "./mapListing";

interface Props {
  listing: DiscoverCardListing;
  compact?: boolean;
  joinLabel: string;
}

export function DiscoverListingCard({ listing, compact = false, joinLabel }: Props) {
  const { t } = useTranslation();
  const pct = fillRatio(listing);
  const savings =
    listing.originalPrice > 0 && listing.groupPrice > 0
      ? Math.round((1 - listing.groupPrice / listing.originalPrice) * 100)
      : 0;
  const isFillingFast = pct >= 80;

  const categoryIcon = {
    physical: <Package className="w-3.5 h-3.5" />,
    digital: <Monitor className="w-3.5 h-3.5" />,
    offer: <Ticket className="w-3.5 h-3.5" />,
  }[listing.category];

  const showPrices = listing.groupPrice > 0;

  return (
    <div
      className={cn(
        "group bg-card rounded-3xl border border-border overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30",
        compact ? "flex-shrink-0 w-[280px]" : "w-full",
      )}
    >
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={listing.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm border-0 text-xs gap-1">
              {categoryIcon}
              {listing.category}
            </Badge>
            {isFillingFast && (
              <Badge className="bg-accent text-accent-foreground border-0 text-xs">
                <Zap className="w-3 h-3 mr-0.5" />
                {t("discover.fastBadge")}
              </Badge>
            )}
          </div>

          {savings > 0 && (
            <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0 text-xs font-semibold">-{savings}%</Badge>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/listings/${listing.id}`}>
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-2">{listing.title}</h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-5 h-5">
            <AvatarImage src={listing.seller.avatar} alt="" />
            <AvatarFallback className="text-[10px]">{listing.seller.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground truncate">{listing.seller.name}</span>
          {listing.seller.verified && <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />}
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("discover.slotsJoined", { filled: listing.spotsFilled, total: listing.spotsTotal })}
            </span>
            <span className="text-primary font-medium">{pct}%</span>
          </div>
          <Progress value={pct} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            {showPrices ? (
              <>
                <span className="text-lg font-bold text-foreground">${listing.groupPrice}</span>
                {listing.originalPrice > listing.groupPrice && (
                  <span className="text-sm text-muted-foreground line-through">${listing.originalPrice}</span>
                )}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">View deal</span>
            )}
          </div>
          <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-sm h-8 px-4 shrink-0" asChild>
            <Link href={`/listings/${listing.id}`}>{joinLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
