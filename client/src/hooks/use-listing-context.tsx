import { createContext, useContext, useState } from "react";

interface ListingCtx {
  id?: number;
  title?: string;
  category?: string;
  slotsLeft?: number;
  totalSlots?: number;
  expiresAt?: string;
  location?: string;
  pricePerSlot?: number | null;
  marketPrice?: number | null;
}

interface ListingContextValue {
  listingCtx: ListingCtx | null;
  setListingCtx: (ctx: ListingCtx | null) => void;
}

const ListingContext = createContext<ListingContextValue>({
  listingCtx: null,
  setListingCtx: () => {},
});

export function ListingContextProvider({ children }: { children: React.ReactNode }) {
  const [listingCtx, setListingCtx] = useState<ListingCtx | null>(null);
  return (
    <ListingContext.Provider value={{ listingCtx, setListingCtx }}>
      {children}
    </ListingContext.Provider>
  );
}

export function useListingContext() {
  return useContext(ListingContext);
}
