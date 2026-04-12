import type { ListingWithCreator } from "@shared/schema";

const PLACEHOLDER_IMG =
  "https://placehold.co/400x300/e2e8f0/64748b?text=Grouperry";

export type DiscoverCardListing = {
  id: number;
  title: string;
  image: string;
  originalPrice: number;
  groupPrice: number;
  spotsTotal: number;
  spotsFilled: number;
  category: "physical" | "digital" | "offer";
  seller: { name: string; avatar: string; verified: boolean };
  tags: string[];
  endsAt: Date;
  location: string;
};

function centsToUnits(c?: number | null): number | null {
  if (c == null || c <= 0) return null;
  return Math.round(c / 100);
}

export function mapListingForDiscover(l: ListingWithCreator): DiscoverCardListing {
  const group = centsToUnits(l.pricePerSlot);
  const market = centsToUnits(l.marketPrice);
  const originalPrice = market ?? group ?? 0;
  const groupPrice = group ?? originalPrice;

  const c = l.creator;
  const sellerName =
    (c as any)?.businessName?.trim() ||
    [c?.firstName, c?.lastName].filter(Boolean).join(" ").trim() ||
    c?.email?.split("@")[0] ||
    "Seller";

  const avatar =
    c?.profileImageUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sellerName)}`;

  const tags = Array.isArray((l as any).tags)
    ? (l as any).tags.map((t: { name?: string } | string) => (typeof t === "string" ? t : t.name)).filter(Boolean)
    : [];

  return {
    id: l.id,
    title: l.title,
    image: l.imageUrl || PLACEHOLDER_IMG,
    originalPrice,
    groupPrice,
    spotsTotal: l.totalSlots,
    spotsFilled: l.filledSlots,
    category: l.category,
    seller: {
      name: sellerName,
      avatar,
      verified: c?.verificationStatus === "verified",
    },
    tags,
    endsAt: new Date(l.expiresAt),
    location: l.location?.trim() || l.country?.trim() || "Remote",
  };
}

export function fillRatio(l: Pick<DiscoverCardListing, "spotsFilled" | "spotsTotal">): number {
  if (!l.spotsTotal) return 0;
  return Math.min(100, Math.round((l.spotsFilled / l.spotsTotal) * 100));
}
