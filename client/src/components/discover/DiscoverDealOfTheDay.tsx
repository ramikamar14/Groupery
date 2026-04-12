import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, CheckCircle, Flame } from "lucide-react";
import type { DiscoverCardListing } from "./mapListing";
import { fillRatio } from "./mapListing";

interface Props {
  listing: DiscoverCardListing;
  description: string;
  joinLabel: string;
  badgeDeal: string;
  saveBadgeText: string;
  joinedLabel: string;
  filledLabel: string;
}

export function DiscoverDealOfTheDay({
  listing,
  description,
  joinLabel,
  badgeDeal,
  saveBadgeText,
  joinedLabel,
  filledLabel,
}: Props) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = listing.endsAt.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [listing.endsAt]);

  const pct = fillRatio(listing);
  const savings =
    listing.originalPrice > 0 && listing.groupPrice > 0
      ? Math.round((1 - listing.groupPrice / listing.originalPrice) * 100)
      : 0;

  return (
    <div className="relative rounded-3xl overflow-hidden mb-8 group">
      <div className="absolute inset-0">
        <img src={listing.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
      </div>

      <div className="relative p-6 sm:p-8 min-h-[320px] sm:min-h-[380px] flex flex-col justify-end">
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge className="bg-accent text-accent-foreground border-0 rounded-full px-3 py-1 font-semibold">
            <Flame className="w-3.5 h-3.5 mr-1" />
            {badgeDeal}
          </Badge>
          {savings > 0 && (
            <Badge className="bg-green-500 text-white border-0 rounded-full px-3 py-1 font-semibold">{saveBadgeText}</Badge>
          )}
        </div>

        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-3">
          <Clock className="w-4 h-4 text-accent" />
          <div className="flex items-center gap-1 font-mono text-white font-semibold text-sm">
            <span className="bg-white/20 rounded-lg px-2 py-1">{String(timeLeft.hours).padStart(2, "0")}</span>
            <span>:</span>
            <span className="bg-white/20 rounded-lg px-2 py-1">{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span>:</span>
            <span className="bg-white/20 rounded-lg px-2 py-1">{String(timeLeft.seconds).padStart(2, "0")}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 text-balance">{listing.title}</h2>
            <p className="text-white/80 text-sm sm:text-base max-w-xl line-clamp-3">{description}</p>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white/30">
              <AvatarImage src={listing.seller.avatar} alt="" />
              <AvatarFallback>{listing.seller.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{listing.seller.name}</span>
                {listing.seller.verified && <CheckCircle className="w-4 h-4 text-primary" />}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">
                  <Users className="w-4 h-4 inline mr-1" />
                  {joinedLabel
                    .replace("{{filled}}", String(listing.spotsFilled))
                    .replace("{{total}}", String(listing.spotsTotal))}
                </span>
                <span className="text-accent font-medium">{filledLabel.replace("{{pct}}", String(Math.round(pct)))}</span>
              </div>
              <Progress value={pct} className="h-2.5 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
            </div>

            <div className="flex items-center gap-4">
              {listing.groupPrice > 0 && (
                <div className="text-right">
                  {listing.originalPrice > listing.groupPrice && (
                    <div className="text-white/50 line-through text-sm">${listing.originalPrice}</div>
                  )}
                  <div className="text-2xl sm:text-3xl font-bold text-white">${listing.groupPrice}</div>
                </div>
              )}
              <Button
                size="lg"
                className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity px-6 sm:px-8 font-semibold"
                asChild
              >
                <Link href={`/listings/${listing.id}`}>{joinLabel}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
