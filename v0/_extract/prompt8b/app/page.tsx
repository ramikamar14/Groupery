"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Search,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Package,
  Globe,
  Tag,
  ArchiveX,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "expired" | "completed" | "cancelled";
type Category = "physical" | "digital" | "offer";

interface Listing {
  id: number;
  title: string;
  description: string;
  category: Category;
  status: Status;
  filledSlots: number;
  totalSlots: number;
  expiredAt: string;
  imageUrl: string;
  creator: { name: string; avatar?: string; initials: string };
  tags: string[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const LISTINGS: Listing[] = [
  {
    id: 1,
    title: "Premium Wireless Headphones — Sony WH-1000XM5 Group Buy",
    description:
      "30% off retail price for the industry-leading noise-cancelling headphones. Group of 20 needed.",
    category: "physical",
    status: "expired",
    filledSlots: 14,
    totalSlots: 20,
    expiredAt: "Jan 15, 2025",
    imageUrl: "/images/listing-electronics.jpg",
    creator: { name: "Rami A.", initials: "RA" },
    tags: ["electronics", "audio"],
  },
  {
    id: 2,
    title: "Artisan Organic Food Box — Monthly Subscription",
    description:
      "Local farm produce, cold-pressed oils, honey, and herbal teas delivered to your door.",
    category: "physical",
    status: "completed",
    filledSlots: 30,
    totalSlots: 30,
    expiredAt: "Feb 28, 2025",
    imageUrl: "/images/listing-food.jpg",
    creator: { name: "Sara M.", initials: "SM" },
    tags: ["food", "organic", "subscription"],
  },
  {
    id: 3,
    title: "Notion Pro Lifetime License — Group Discount",
    description:
      "Get lifetime access to Notion Pro at 40% off by joining this group of 50 members.",
    category: "digital",
    status: "completed",
    filledSlots: 50,
    totalSlots: 50,
    expiredAt: "Mar 10, 2025",
    imageUrl: "/images/listing-software.jpg",
    creator: { name: "Leo K.", initials: "LK" },
    tags: ["software", "productivity"],
  },
  {
    id: 4,
    title: "Premium Home Gym Starter Kit — Resistance & Free Weights",
    description:
      "Complete home fitness package: resistance bands, dumbbells, and kettlebell at wholesale pricing.",
    category: "physical",
    status: "cancelled",
    filledSlots: 7,
    totalSlots: 25,
    expiredAt: "Dec 20, 2024",
    imageUrl: "/images/listing-fitness.jpg",
    creator: { name: "Hana J.", initials: "HJ" },
    tags: ["fitness", "equipment"],
  },
  {
    id: 5,
    title: "Europe Backpack Trip — Shared Accommodation Deal",
    description:
      "Group booking for hostels across 6 European cities. Save 35% vs individual booking.",
    category: "offer",
    status: "expired",
    filledSlots: 9,
    totalSlots: 16,
    expiredAt: "Nov 30, 2024",
    imageUrl: "/images/listing-travel.jpg",
    creator: { name: "Omar F.", initials: "OF" },
    tags: ["travel", "europe", "accommodation"],
  },
  {
    id: 6,
    title: "Design Books Bundle — Prestige Set of 8 Hardcovers",
    description:
      "Curated collection of top design and typography books shipped directly from the publisher.",
    category: "physical",
    status: "completed",
    filledSlots: 40,
    totalSlots: 40,
    expiredAt: "Jan 5, 2025",
    imageUrl: "/images/listing-books.jpg",
    creator: { name: "Nour T.", initials: "NT" },
    tags: ["books", "design", "education"],
  },
  {
    id: 7,
    title: "Adobe Creative Cloud — Annual Group License",
    description:
      "Unlock Creative Cloud All Apps plan at a reduced group rate for indie designers and studios.",
    category: "digital",
    status: "cancelled",
    filledSlots: 3,
    totalSlots: 15,
    expiredAt: "Oct 15, 2024",
    imageUrl: "/images/listing-software.jpg",
    creator: { name: "Rami A.", initials: "RA" },
    tags: ["software", "design", "creative"],
  },
  {
    id: 8,
    title: "Smart Home Starter Bundle — Matter Protocol Devices",
    description:
      "Smart plugs, bulbs, and a hub compatible with Apple Home, Google Home, and Alexa.",
    category: "physical",
    status: "expired",
    filledSlots: 18,
    totalSlots: 30,
    expiredAt: "Feb 1, 2025",
    imageUrl: "/images/listing-electronics.jpg",
    creator: { name: "Sara M.", initials: "SM" },
    tags: ["electronics", "smart-home"],
  },
  {
    id: 9,
    title: "Weekend Yoga Retreat — Mountain Getaway Package",
    description:
      "Two-night all-inclusive yoga and wellness retreat in the mountains for a group of 12.",
    category: "offer",
    status: "completed",
    filledSlots: 12,
    totalSlots: 12,
    expiredAt: "Mar 22, 2025",
    imageUrl: "/images/listing-travel.jpg",
    creator: { name: "Hana J.", initials: "HJ" },
    tags: ["wellness", "travel", "retreat"],
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<Category, string> = {
  physical:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  digital:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  offer:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  physical: <Package className="w-2.5 h-2.5 inline mr-0.5" />,
  digital: <Globe className="w-2.5 h-2.5 inline mr-0.5" />,
  offer: <Tag className="w-2.5 h-2.5 inline mr-0.5" />,
};

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: React.ReactNode; style: string }
> = {
  expired: {
    label: "Expired",
    icon: <Clock className="w-2.5 h-2.5 inline mr-0.5" />,
    style: "bg-slate-800/70 text-slate-200",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5" />,
    style: "bg-emerald-700/80 text-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="w-2.5 h-2.5 inline mr-0.5" />,
    style: "bg-rose-700/80 text-rose-100",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBadge({
  count,
  label,
  variant,
}: {
  count: number;
  label: string;
  variant: "total" | "expired" | "completed" | "cancelled";
}) {
  const styles = {
    total:
      "border-border text-foreground bg-background",
    expired:
      "border-slate-300 text-slate-500 bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:bg-slate-800/40",
    completed:
      "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:bg-emerald-900/20",
    cancelled:
      "border-rose-300 text-rose-600 bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:bg-rose-900/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium",
        styles[variant]
      )}
    >
      <span className="font-bold text-sm">{count}</span>
      {label}
    </span>
  );
}

function ProgressBar({ pct, status }: { pct: number; status: Status }) {
  const barColor =
    status === "completed"
      ? "bg-accent"
      : status === "cancelled"
      ? "bg-rose-400 dark:bg-rose-500"
      : "bg-slate-400 dark:bg-slate-500";

  return (
    <div className="w-full bg-muted rounded-full h-1.5">
      <div
        className={cn("h-1.5 rounded-full transition-all", barColor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const fillPct = Math.round((listing.filledSlots / listing.totalSlots) * 100);
  const status = STATUS_CONFIG[listing.status];
  const catLabel =
    listing.category.charAt(0).toUpperCase() + listing.category.slice(1);

  return (
    <article className="group bg-card border border-border rounded-xl overflow-hidden opacity-75 hover:opacity-100 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col">
      {/* Image */}
      <div className="relative h-36 overflow-hidden shrink-0">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-[20%] transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-semibold",
              CATEGORY_STYLES[listing.category]
            )}
          >
            {CATEGORY_ICONS[listing.category]}
            {catLabel}
          </span>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-semibold",
              status.style
            )}
          >
            {status.icon}
            {status.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 text-card-foreground">
          {listing.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {listing.description}
        </p>

        {/* Fill progress */}
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {listing.filledSlots}/{listing.totalSlots} slots
          </span>
          <span
            className={cn(
              "font-semibold",
              listing.status === "completed"
                ? "text-accent"
                : listing.status === "cancelled"
                ? "text-rose-500"
                : "text-muted-foreground"
            )}
          >
            {fillPct}%
          </span>
        </div>
        <ProgressBar pct={fillPct} status={listing.status} />

        {/* Expiry */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3 mb-3">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>
            {listing.status === "completed"
              ? "Completed"
              : listing.status === "cancelled"
              ? "Cancelled"
              : "Expired"}{" "}
            — {listing.expiredAt}
          </span>
        </div>

        {/* Creator + tags */}
        <div className="flex items-center gap-2 pt-3 border-t border-border/50 mt-auto">
          <Avatar className="w-5 h-5 shrink-0">
            {listing.creator.avatar && (
              <AvatarImage src={listing.creator.avatar} />
            )}
            <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">
              {listing.creator.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {listing.creator.name}
          </span>
          <div className="ml-auto flex gap-1 flex-wrap justify-end">
            {listing.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <ArchiveX className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-base mb-1">No listings found</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {query
          ? `No past listings match "${query}". Try adjusting your search or filters.`
          : "No past listings match the selected filters."}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PastListingsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return LISTINGS.filter((l) => {
      const matchesSearch =
        !search ||
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase()) ||
        l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === "all" || l.category === category;
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, category, statusFilter]);

  const counts = useMemo(
    () => ({
      total: LISTINGS.length,
      expired: LISTINGS.filter((l) => l.status === "expired").length,
      completed: LISTINGS.filter((l) => l.status === "completed").length,
      cancelled: LISTINGS.filter((l) => l.status === "cancelled").length,
    }),
    []
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Top nav bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm text-foreground tracking-tight">
              Grouperry
            </span>
          </div>
          <span className="text-border">|</span>
          <span className="text-xs text-muted-foreground font-medium">
            Past Listings
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              Past Listings
            </h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Archive of all expired, completed, and cancelled group buys.
          </p>

          {/* Stat badges */}
          <div className="flex flex-wrap gap-2">
            <StatBadge count={counts.total} label="total" variant="total" />
            <StatBadge
              count={counts.expired}
              label="expired"
              variant="expired"
            />
            <StatBadge
              count={counts.completed}
              label="completed"
              variant="completed"
            />
            <StatBadge
              count={counts.cancelled}
              label="cancelled"
              variant="cancelled"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-7">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search past listings..."
              className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-card border-border text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Category filter */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-40 bg-card border-border text-foreground">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {(search || category !== "all" || statusFilter !== "all") && (
          <p className="text-xs text-muted-foreground mb-4">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            of {LISTINGS.length} listings
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length > 0 ? (
            filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <EmptyState query={search} />
          )}
        </div>
      </div>
    </main>
  );
}
