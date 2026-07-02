export type ListingSort = "newest" | "endingSoon" | "almostFull" | "biggestSavings";

export const LISTING_SORTS: ListingSort[] = ["newest", "endingSoon", "almostFull", "biggestSavings"];

type SortableListing = {
  createdAt?: string | Date | null;
  expiresAt?: string | Date | null;
  filledSlots?: number;
  totalSlots?: number;
  pricePerSlot?: number | null;
  marketPrice?: number | null;
};

function toTime(d: string | Date | null | undefined): number {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : 0;
}

function fillRatio(l: SortableListing): number {
  const total = l.totalSlots ?? 0;
  if (total <= 0) return 0;
  return (l.filledSlots ?? 0) / total;
}

function savingsPct(l: SortableListing): number {
  const price = l.pricePerSlot ?? 0;
  const market = l.marketPrice ?? 0;
  if (price <= 0 || market <= price) return 0;
  return 1 - price / market;
}

/** Client-side sort for listing grids. Returns a new array; never mutates. */
export function sortListings<T extends SortableListing>(listings: T[], sort: ListingSort): T[] {
  const copy = [...listings];
  switch (sort) {
    case "endingSoon":
      return copy.sort((a, b) => toTime(a.expiresAt) - toTime(b.expiresAt));
    case "almostFull":
      return copy.sort((a, b) => fillRatio(b) - fillRatio(a));
    case "biggestSavings":
      return copy.sort((a, b) => savingsPct(b) - savingsPct(a));
    case "newest":
    default:
      return copy.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
  }
}
