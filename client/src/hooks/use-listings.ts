import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertListing, Listing } from "@shared/schema";

// Types derived from schema via routes, but for convenience:
// Ideally we import these from shared/schema directly if routes.ts didn't export them cleanly,
// but the prompt says to use routes manifest. 
// Since routes manifest uses z.custom, we rely on the schema types.

export const LISTINGS_PAGE_SIZE = 20;

export function useListings(filters?: { 
  category?: "physical" | "digital" | "offer"; 
  sellerType?: "individual" | "vendor";
  search?: string; 
  lat?: number; 
  lng?: number; 
  radius?: number;
  country?: string;
  language?: string;
  fillingFast?: boolean;
  tag?: string;
  page?: number;
}) {
  const page = filters?.page ?? 1;
  return useQuery({
    queryKey: [api.listings.list.path, { ...filters, page }],
    queryFn: async () => {
      const url = new URL(api.listings.list.path, window.location.origin);
      if (filters?.category) url.searchParams.append("category", filters.category);
      if (filters?.sellerType) url.searchParams.append("sellerType", filters.sellerType);
      if (filters?.search) url.searchParams.append("search", filters.search);
      if (filters?.lat !== undefined) url.searchParams.append("lat", filters.lat.toString());
      if (filters?.lng !== undefined) url.searchParams.append("lng", filters.lng.toString());
      if (filters?.radius !== undefined) url.searchParams.append("radius", filters.radius.toString());
      if (filters?.country) url.searchParams.append("country", filters.country);
      if (filters?.language) url.searchParams.append("language", filters.language);
      if (filters?.fillingFast) url.searchParams.append("fillingFast", "true");
      if (filters?.tag) url.searchParams.append("tag", filters.tag);
      url.searchParams.append("page", String(page));
      url.searchParams.append("limit", String(LISTINGS_PAGE_SIZE));
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch listings");
      return await res.json() as any[];
    },
  });
}

export function useListing(id: number) {
  return useQuery({
    queryKey: [api.listings.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.listings.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch listing");
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertListing & { additionalImages?: string[] }) => {
      const res = await fetch(api.listings.create.path, {
        method: api.listings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create listing");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
      toast({ title: "Success", description: "Listing created successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useJoinListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (listingId: number) => {
      const url = buildUrl(api.listings.join.path, { id: listingId });
      const res = await fetch(url, {
        method: api.listings.join.method,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to join group");
      }
      return await res.json();
    },
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: [api.listings.get.path, String(listingId)] });
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
      toast({ title: "Joined!", description: "You are now part of this group." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useLeaveListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (listingId: number) => {
      const url = buildUrl(api.listings.leave.path, { id: listingId });
      const res = await fetch(url, {
        method: api.listings.leave.method,
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to leave group");
      }
      return await res.json();
    },
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: [api.listings.get.path, String(listingId)] });
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
      toast({ title: "Left Group", description: "You have left the group." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateListingStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: "active" | "completed" | "expired" | "cancelled" }) => {
      const url = buildUrl(api.listings.update.path, { id });
      const res = await fetch(url, {
        method: api.listings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update status");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.listings.get.path, data.id] });
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
      toast({ title: "Updated", description: "Listing status updated." });
    },
  });
}
