import { useMemo } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShoppingBag, TrendingUp, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type ListingRow = {
  id: number;
  title: string;
  status: string;
  filledSlots: number;
  totalSlots: number;
  creatorId?: string | null;
  updatedAt?: string | Date | null;
  createdAt?: string | Date | null;
};

function parseDate(d: string | Date | null | undefined): Date | null {
  if (!d) return null;
  const x = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(x.getTime()) ? null : x;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: myGroups = [], isLoading: loadingGroups } = useQuery<ListingRow[]>({
    queryKey: ["/api/my-groups"],
  });

  const { data: notifications = [] } = useQuery<Array<{ id: number; isRead: boolean }>>({
    queryKey: ["/api/notifications"],
  });

  const displayName =
    user?.firstName?.trim() ||
    user?.email?.split("@")[0] ||
    t("dashboard.welcomeGeneric");

  const activeGroupsCount = useMemo(
    () => myGroups.filter((l) => l.status === "active").length,
    [myGroups],
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const itemsPurchased = user?.completedParticipations ?? 0;

  const stats = [
    {
      title: t("dashboard.statActiveGroups"),
      value: loadingGroups ? "…" : String(activeGroupsCount),
      icon: Users,
      trend: t("dashboard.trendPlaceholder"),
      trendMuted: true,
    },
    {
      title: t("dashboard.statTotalSavings"),
      value: t("dashboard.savingsPlaceholder"),
      icon: TrendingUp,
      trend: t("dashboard.savingsHint"),
      trendMuted: true,
    },
    {
      title: t("dashboard.statItemsPurchased"),
      value: String(itemsPurchased),
      icon: ShoppingBag,
      trend: t("dashboard.trendPlaceholder"),
      trendMuted: true,
    },
    {
      title: t("dashboard.statPending"),
      value: String(unreadCount),
      icon: Clock,
      trend: t("dashboard.trendPlaceholder"),
      trendMuted: true,
    },
  ];

  const recentRows = useMemo(() => {
    const sorted = [...myGroups].sort((a, b) => {
      const ta = parseDate(a.updatedAt)?.getTime() ?? parseDate(a.createdAt)?.getTime() ?? 0;
      const tb = parseDate(b.updatedAt)?.getTime() ?? parseDate(b.createdAt)?.getTime() ?? 0;
      return tb - ta;
    });
    return sorted.slice(0, 6);
  }, [myGroups]);

  const activitySubtitle = (listing: ListingRow): string => {
    const uid = user?.id;
    if (uid && listing.creatorId === uid) return t("dashboard.organizing");
    if (listing.status === "expired") return t("dashboard.expired");
    if (listing.status === "completed") return t("dashboard.completed");
    if (listing.status === "active") {
      if (listing.filledSlots >= listing.totalSlots) return t("dashboard.readyToOrder");
      const n = Math.max(0, listing.totalSlots - listing.filledSlots);
      return t("dashboard.spotsLeft", { n });
    }
    return t("dashboard.active");
  };

  const activityTime = (listing: ListingRow): string => {
    const d = parseDate(listing.updatedAt) ?? parseDate(listing.createdAt);
    if (!d) return "";
    try {
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return "";
    }
  };

  const loading = loadingGroups;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-balance">
            {t("dashboard.welcomeBack", { name: displayName })}
          </h1>
          <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.title} className="border-primary/15 dark:border-primary/25">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-display">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className={stat.trendMuted ? "text-muted-foreground" : "text-accent font-medium"}>
                        {stat.trend}
                      </span>{" "}
                      {!stat.trendMuted && t("dashboard.trendFromLastMonth")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-primary/15 dark:border-primary/25">
              <CardHeader>
                <CardTitle className="font-display">{t("dashboard.recentActivity")}</CardTitle>
              </CardHeader>
              <CardContent>
                {recentRows.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p className="mb-4">{t("dashboard.emptyActivity")}</p>
                    <Button asChild size="sm">
                      <Link href="/">{t("dashboard.emptyActivityCta")}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentRows.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 gap-4"
                      >
                        <div className="min-w-0">
                          <Link href={`/listings/${item.id}`} className="font-medium text-sm hover:text-primary transition-colors">
                            {item.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">{activitySubtitle(item)}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{activityTime(item)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
