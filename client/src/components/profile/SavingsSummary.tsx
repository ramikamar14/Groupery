import { useQuery } from "@tanstack/react-query";
import { TrendingDown, ShoppingBag, Star, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MyGroup {
  id: number;
  listingId: number;
  status: string;
  joinedAt: string;
  listing?: {
    title: string;
    originalPrice?: number;
    discountedPrice?: number;
    currentPrice?: number;
    price?: number;
    status: string;
  };
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function SavingsSummary({ userId }: { userId?: string | number }) {
  const { t } = useTranslation();

  const { data: groups = [] } = useQuery<MyGroup[]>({
    queryKey: ["/api/my-groups"],
    staleTime: 60_000,
  });

  if (groups.length === 0) return null;

  const completed = groups.filter(g => g.listing?.status === "completed");
  const totalSaved = completed.reduce((sum, g) => {
    const orig = g.listing?.originalPrice ?? 0;
    const disc = g.listing?.discountedPrice ?? g.listing?.currentPrice ?? g.listing?.price ?? orig;
    return sum + Math.max(0, orig - disc);
  }, 0);

  const avgDiscount = completed.length > 0
    ? completed.reduce((sum, g) => {
        const orig = g.listing?.originalPrice ?? 0;
        const disc = g.listing?.discountedPrice ?? g.listing?.currentPrice ?? g.listing?.price ?? orig;
        return sum + (orig > 0 ? ((orig - disc) / orig) * 100 : 0);
      }, 0) / completed.length
    : 0;

  const stats = [
    {
      icon: ShoppingBag,
      color: "text-primary",
      bg: "bg-primary/8",
      label: t("profile.totalDeals", "Deals joined"),
      value: groups.length.toString(),
    },
    {
      icon: TrendingDown,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      label: t("profile.totalSaved", "Total saved"),
      value: totalSaved > 0 ? fmt(totalSaved) : "—",
    },
    {
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      label: t("profile.avgDiscount", "Avg discount"),
      value: avgDiscount > 0 ? `${Math.round(avgDiscount)}%` : "—",
    },
    {
      icon: Zap,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/30",
      label: t("profile.dealsCompleted", "Completed"),
      value: completed.length.toString(),
    },
  ];

  return (
    <div className="mb-4" data-testid="savings-summary">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
        <TrendingDown className="w-4 h-4 text-emerald-600" />
        {t("profile.savingsTitle", "Your savings")}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map(({ icon: Icon, color, bg, label, value }) => (
          <div key={label} className={`flex flex-col items-center p-3 ${bg} rounded-xl text-center border border-border/40`}>
            <Icon className={`w-4 h-4 ${color} mb-1`} />
            <span className="text-base font-bold leading-tight">{value}</span>
            <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
