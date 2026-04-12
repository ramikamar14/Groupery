import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, BellOff } from "lucide-react";
import { isToday, isYesterday, isThisWeek } from "date-fns";
import { useTranslation } from "react-i18next";
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
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/25 py-16 px-6 text-center text-muted-foreground">
            <BellOff className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium text-foreground">{t("notifications.noNotifications")}</p>
            <p className="text-sm mt-1 max-w-sm mx-auto">{t("notifications.noNotificationsHint")}</p>
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
