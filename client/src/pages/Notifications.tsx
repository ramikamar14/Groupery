import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, BellOff, Search, Plus } from "lucide-react";
import { isToday, isYesterday, isThisWeek } from "date-fns";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { AppNotificationItem } from "@/components/notifications/AppNotificationItem";
import { NotificationDateGroup } from "@/components/notifications/NotificationDateGroup";

type DateKey = "today" | "yesterday" | "thisWeek" | "earlier";

function getDateKey(dateStr: string): DateKey {
  const d = new Date(dateStr);
  if (isToday(d)) return "today";
  if (isYesterday(d)) return "yesterday";
  if (isThisWeek(d)) return "thisWeek";
  return "earlier";
}

function groupByDate(notifications: any[]) {
  const groups: Record<DateKey, any[]> = { today: [], yesterday: [], thisWeek: [], earlier: [] };
  const order: DateKey[] = ["today", "yesterday", "thisWeek", "earlier"];

  for (const n of notifications) {
    const key = getDateKey(n.createdAt);
    groups[key].push(n);
  }

  return order.filter((k) => groups[k].length > 0).map((k) => ({ key: k, items: groups[k] }));
}

export default function Notifications() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read-all", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const groups = groupByDate(notifications);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">{t("notifications.title")}</h1>
            <p className="text-muted-foreground mt-0.5">
              {unreadCount > 0 ? (
                <>
                  <span className="font-medium text-foreground">{unreadCount}</span> {t("notifications.unread")}
                </>
              ) : (
                t("notifications.allCaughtUp")
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              {markAllReadMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("notifications.markAllRead")
              )}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-violet-200 dark:border-violet-800/40 bg-gradient-to-b from-violet-50/60 to-transparent dark:from-violet-950/20 py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mx-auto mb-5">
              <BellOff className="w-8 h-8 text-violet-500" />
            </div>
            <p className="font-bold text-lg text-foreground mb-1">{t("notifications.noNotifications")}</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-7">{t("notifications.noNotificationsHint")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="sm" className="rounded-full gap-2 bg-primary hover:bg-primary/90">
                <Link href="/"><Search className="w-4 h-4" /> Browse Deals</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full gap-2">
                <Link href="/create"><Plus className="w-4 h-4" /> Create a Deal</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(({ key, items }) => (
              <NotificationDateGroup key={key} dateKey={key}>
                {items.map((n: any) => (
                  <AppNotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={(id) => markReadMutation.mutate(id)}
                    isPending={markReadMutation.isPending}
                  />
                ))}
              </NotificationDateGroup>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
