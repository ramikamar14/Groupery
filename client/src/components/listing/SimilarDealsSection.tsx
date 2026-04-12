import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function SimilarDealsSection({ currentListingId, category }: { currentListingId: number; category: string }) {
  const { t } = useTranslation();

  const { data: allListings = [] } = useQuery<any[]>({
    queryKey: ["/api/listings", { category }],
    queryFn: () => fetch(`/api/listings?category=${category}&limit=6`).then(r => r.json()),
    staleTime: 60000,
  });

  const similar = allListings.filter((l: any) => l.id !== currentListingId && l.status === "active").slice(0, 3);

  if (similar.length === 0) return null;

  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-6" data-testid="section-similar-deals">
      <h3 className="font-bold font-display text-lg mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Similar Deals
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {similar.map((l: any) => {
          const pct = Math.round((l.filledSlots / l.totalSlots) * 100);
          return (
            <a key={l.id} href={`/listings/${l.id}`} className="block group p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all" data-testid={`similar-deal-${l.id}`}>
              {l.imageUrl && (
                <div className="aspect-[16/9] rounded-lg overflow-hidden mb-2">
                  <img src={l.imageUrl} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{l.title}</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{l.filledSlots}/{l.totalSlots}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      pct >= 95 ? "bg-destructive" : pct >= 75 ? "bg-amber-500" : "bg-primary"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
