import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiscoverCardListing } from "./mapListing";
import { DiscoverListingCard } from "./DiscoverListingCard";

interface Props {
  title: string;
  icon: ReactNode;
  listings: DiscoverCardListing[];
  joinLabel: string;
}

export function DiscoverDiscoverySection({ title, icon, listings, joinLabel }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [listings.length]);

  if (listings.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "p-2 rounded-full border border-border transition-all",
              canScrollLeft ? "hover:bg-secondary hover:border-primary/30" : "opacity-30 cursor-not-allowed",
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "p-2 rounded-full border border-border transition-all",
              canScrollRight ? "hover:bg-secondary hover:border-primary/30" : "opacity-30 cursor-not-allowed",
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {listings.map((listing) => (
          <DiscoverListingCard key={listing.id} listing={listing} compact joinLabel={joinLabel} />
        ))}
      </div>
    </section>
  );
}
