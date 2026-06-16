import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Trophy } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

interface CompletedListing {
  id: number;
  title: string;
  category: string;
  filledSlots: number;
  totalSlots: number;
  pricePerSlot?: number | null;
  marketPrice?: number | null;
  updatedAt?: string;
  creator?: { firstName?: string | null; businessName?: string | null };
}

function savingsPct(listing: CompletedListing): number {
  const group = listing.pricePerSlot && listing.pricePerSlot > 0 ? listing.pricePerSlot : null;
  const market = listing.marketPrice && listing.marketPrice > 0 ? listing.marketPrice : null;
  if (!group || !market || market <= group) return 0;
  return Math.round((1 - group / market) * 100);
}

function CompletedChip({ listing }: { listing: CompletedListing }) {
  const pct = savingsPct(listing);
  const ago = listing.updatedAt
    ? formatDistanceToNowStrict(new Date(listing.updatedAt), { addSuffix: true })
    : null;

  return (
    <Link href={`/listings/${listing.id}`}>
      <div
        className="flex-shrink-0 w-60 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 cursor-pointer hover:shadow-md transition-shadow"
        data-testid={`completed-chip-${listing.id}`}
      >
        <div className="flex items-start gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{listing.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
          <span className="font-medium text-emerald-700 dark:text-emerald-400">
            {listing.filledSlots}/{listing.totalSlots} members
          </span>
          {pct > 0 && (
            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full">
              {pct}% saved
            </span>
          )}
          {ago && <span>{ago}</span>}
        </div>
      </div>
    </Link>
  );
}

export function RecentlyCompletedSection() {
  const { data } = useQuery<CompletedListing[]>({
    queryKey: ["discover-recently-completed"],
    queryFn: async () => {
      const res = await fetch("/api/listings?limit=80", { credentials: "include" });
      if (!res.ok) return [];
      const all: CompletedListing[] = await res.json();
      return all.filter((l: any) => l.status === "completed").slice(0, 8);
    },
    staleTime: 5 * 60_000,
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="mb-8" data-testid="section-recently-completed">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h2 className="font-display text-lg font-semibold">Recently Completed</h2>
      </div>
      <div
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {data.map((listing) => (
          <CompletedChip key={listing.id} listing={listing} />
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Real completed deals — proof the loop works.
      </p>
    </section>
  );
}
