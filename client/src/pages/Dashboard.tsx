import { useMemo } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, ShoppingBag, Bell, Loader2, Plus, Compass, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

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

  const fillPct = (listing: ListingRow) =>
    listing.totalSlots > 0 ? Math.round((listing.filledSlots / listing.totalSlots) * 100) : 0;

  const statusConfig = (listing: ListingRow) => {
    if (listing.status === "completed") return { color: "text-green-600 dark:text-green-400", bg: "bg-green-500", icon: CheckCircle2 };
    if (listing.status === "expired") return { color: "text-muted-foreground", bg: "bg-muted-foreground", icon: AlertCircle };
    if (listing.filledSlots >= listing.totalSlots) return { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", icon: Clock };
    return { color: "text-primary", bg: "bg-primary", icon: Users };
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-balance">
              {t("dashboard.welcomeBack", { name: displayName })}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("dashboard.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="rounded-full gap-1.5" asChild>
              <Link href="/"><Compass className="w-3.5 h-3.5" />{t("nav.explore")}</Link>
            </Button>
            <Button size="sm" className="rounded-full gap-1.5" asChild>
              <Link href="/create"><Plus className="w-3.5 h-3.5" />{t("nav.create")}</Link>
            </Button>
          </div>
        </div>

        {loadingGroups ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Active Groups */}
              <Card className="border-primary/15 dark:border-primary/25">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("dashboard.statActiveGroups")}</p>
                      <p className="text-3xl font-bold font-display tabular-nums leading-none">{activeGroupsCount}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-4.5 h-4.5 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {myGroups.length} {t("dashboard.totalGroups", "total groups")}
                  </p>
                </CardContent>
              </Card>

              {/* Items Purchased */}
              <Card className="border-primary/15 dark:border-primary/25">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("dashboard.statItemsPurchased")}</p>
                      <p className="text-3xl font-bold font-display tabular-nums leading-none">{itemsPurchased}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{t("dashboard.completedDeals", "completed deals")}</p>
                </CardContent>
              </Card>

              {/* Notifications — full width on 2-col, normal on 3-col */}
              <Card className={cn("border-primary/15 dark:border-primary/25 col-span-2 lg:col-span-1", unreadCount > 0 && "border-amber-300 dark:border-amber-700")}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("dashboard.statPending")}</p>
                      <p className={cn("text-3xl font-bold font-display tabular-nums leading-none", unreadCount > 0 ? "text-amber-600 dark:text-amber-400" : "")}>{unreadCount}</p>
                    </div>
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", unreadCount > 0 ? "bg-amber-500/10" : "bg-muted")}>
                      <Bell className={cn("w-4.5 h-4.5", unreadCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
                    </div>
                  </div>
                  <Link href="/notifications" className="text-xs text-primary hover:underline mt-2 inline-block">
                    {t("dashboard.viewNotifications", "View notifications")} →
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* My Groups */}
            <Card className="border-primary/15 dark:border-primary/25">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="font-display text-base">{t("dashboard.myGroups", "My Groups")}</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground" asChild>
                  <Link href="/my-groups">{t("dashboard.viewAll", "View all")} <ChevronRight className="w-3 h-3" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentRows.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t("dashboard.emptyActivity")}</p>
                    <Button asChild size="sm" className="rounded-full">
                      <Link href="/">{t("dashboard.emptyActivityCta")}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRows.map((item) => {
                      const pct = fillPct(item);
                      const { color, bg, icon: StatusIcon } = statusConfig(item);
                      return (
                        <Link
                          key={item.id}
                          href={`/listings/${item.id}`}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group -mx-1"
                        >
                          <div className={cn("mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0", `${bg}/10`)}>
                            <StatusIcon className={cn("w-3.5 h-3.5", color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-sm leading-snug group-hover:text-primary transition-colors line-clamp-1">{item.title}</p>
                              <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 whitespace-nowrap">{activityTime(item)}</span>
                            </div>
                            <p className={cn("text-xs mt-0.5", color)}>{activitySubtitle(item)}</p>
                            {item.status === "active" && item.totalSlots > 0 && (
                              <div className="mt-1.5 flex items-center gap-2">
                                <Progress value={pct} className="h-1 flex-1 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
                                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{item.filledSlots}/{item.totalSlots}</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
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
