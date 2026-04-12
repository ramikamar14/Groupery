import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Users,
  Calendar,
  Package,
  Globe,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { Listing } from "@shared/schema";

export type ListingWithCreator = Listing & {
  creator?: { firstName?: string; lastName?: string; profileImageUrl?: string; email?: string };
  tags?: { tag: string }[];
};

type PastStatus = "expired" | "completed" | "cancelled";

const CATEGORY_STYLES: Record<string, string> = {
  physical: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  digital: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  offer: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

function progressBarClass(status: PastStatus) {
  if (status === "completed") return "bg-accent";
  if (status === "cancelled") return "bg-rose-400 dark:bg-rose-500";
  return "bg-slate-400 dark:bg-slate-500";
}

export function PastListingCard({ listing }: { listing: ListingWithCreator }) {
  const { t } = useTranslation();
  const fillPct = listing.totalSlots > 0 ? Math.round((listing.filledSlots / listing.totalSlots) * 100) : 0;
  const status = listing.status as PastStatus;
  const creatorName = listing.creator
    ? [listing.creator.firstName, listing.creator.lastName].filter(Boolean).join(" ") ||
      listing.creator.email ||
      t("pastArchive.unknownCreator")
    : t("pastArchive.unknownCreator");
  const initials =
    listing.creator?.firstName?.[0] || listing.creator?.lastName?.[0] || creatorName[0]?.toUpperCase() || "?";

  const cat = listing.category;
  const catStyle = CATEGORY_STYLES[cat] ?? "bg-muted text-muted-foreground";

  const statusConfig = {
    expired: {
      label: t("listing.expired"),
      icon: Clock,
      style: "bg-slate-800/70 text-slate-200",
    },
    completed: {
      label: t("listing.complete"),
      icon: CheckCircle2,
      style: "bg-emerald-700/80 text-emerald-100",
    },
    cancelled: {
      label: t("listing.cancelled"),
      icon: XCircle,
      style: "bg-rose-700/80 text-rose-100",
    },
  } as const;

  const sc = statusConfig[status] ?? statusConfig.expired;
  const StatusIcon = sc.icon;

  const endedDate = listing.expiresAt ? format(new Date(listing.expiresAt), "MMM d, yyyy") : "—";

  const categoryIcon =
    cat === "digital" ? <Globe className="w-2.5 h-2.5 inline mr-0.5" /> : cat === "offer" ? <Tag className="w-2.5 h-2.5 inline mr-0.5" /> : <Package className="w-2.5 h-2.5 inline mr-0.5" />;

  const catLabel =
    cat === "physical" ? t("home.physical") : cat === "digital" ? t("home.digital") : t("home.offer");

  return (
    <Link href={`/listings/${listing.id}`} className="block h-full">
      <article
        className="group bg-card border border-border rounded-xl overflow-hidden opacity-80 hover:opacity-100 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md hover:border-accent/25 flex flex-col h-full"
        data-testid={`card-expired-listing-${listing.id}`}
      >
        <div className="relative h-36 overflow-hidden shrink-0 bg-muted">
          <img
            src={listing.imageUrl || "https://placehold.co/600x400?text=Grouperry"}
            alt={listing.title}
            className="w-full h-full object-cover grayscale-[45%] group-hover:grayscale-[15%] transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          <div className="absolute top-2 left-2">
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", catStyle)}>
              {categoryIcon}
              {catLabel}
            </span>
          </div>

          <div className="absolute top-2 right-2">
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5", sc.style)}>
              <StatusIcon className="w-2.5 h-2.5 shrink-0" />
              {sc.label}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 text-card-foreground">{listing.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{listing.description}</p>

          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {t("pastArchive.slotsLine", { filled: listing.filledSlots, total: listing.totalSlots })}
            </span>
            <span
              className={cn(
                "font-semibold",
                status === "completed" ? "text-accent" : status === "cancelled" ? "text-rose-500" : "text-muted-foreground"
              )}
            >
              {fillPct}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className={cn("h-1.5 rounded-full transition-all", progressBarClass(status))} style={{ width: `${fillPct}%` }} />
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3 mb-3">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>
              {status === "completed"
                ? t("pastArchive.endedCompleted", { date: endedDate })
                : status === "cancelled"
                  ? t("pastArchive.endedCancelled", { date: endedDate })
                  : t("pastArchive.endedExpired", { date: endedDate })}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-border/50 mt-auto">
            <Avatar className="w-5 h-5 shrink-0">
              <AvatarImage src={listing.creator?.profileImageUrl ?? undefined} />
              <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{creatorName}</span>
            {listing.tags && listing.tags.length > 0 && (
              <div className="ml-auto flex gap-1 flex-wrap justify-end">
                {listing.tags.slice(0, 2).map((tg) => (
                  <span key={tg.tag} className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-medium">
                    {tg.tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function PastStatChip({
  count,
  label,
  variant,
}: {
  count: number;
  label: string;
  variant: "total" | "expired" | "completed" | "cancelled";
}) {
  const styles = {
    total: "border-border text-foreground bg-background",
    expired: "border-slate-300 text-slate-600 bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:bg-slate-800/40",
    completed:
      "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:bg-emerald-900/20",
    cancelled: "border-rose-300 text-rose-600 bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:bg-rose-900/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium",
        styles[variant]
      )}
    >
      <span className="font-bold text-sm tabular-nums">{count}</span>
      {label}
    </span>
  );
}

export { PastStatChip };
