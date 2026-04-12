import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, Users, MessageSquare, CheckCircle, Clock, AlertCircle, Gift, Shield } from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const notificationConfig: Record<string, { icon: any; bgClass: string; iconClass: string }> = {
  join: {
    icon: Users,
    bgClass: "bg-blue-100 dark:bg-blue-950/60",
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  message: {
    icon: MessageSquare,
    bgClass: "bg-teal-100 dark:bg-teal-950/60",
    iconClass: "text-teal-600 dark:text-teal-400",
  },
  complete: {
    icon: CheckCircle,
    bgClass: "bg-green-100 dark:bg-green-950/60",
    iconClass: "text-green-600 dark:text-green-400",
  },
  expire: {
    icon: Clock,
    bgClass: "bg-amber-100 dark:bg-amber-950/60",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  verification: {
    icon: Shield,
    bgClass: "bg-[#001F3F]/10 dark:bg-[#001F3F]/30",
    iconClass: "text-[#001F3F] dark:text-teal-300",
  },
  warning: {
    icon: AlertCircle,
    bgClass: "bg-rose-100 dark:bg-rose-950/60",
    iconClass: "text-rose-600 dark:text-rose-400",
  },
  reward: {
    icon: Gift,
    bgClass: "bg-emerald-100 dark:bg-emerald-950/60",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
};

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

function NotificationItem({
  notification,
  onMarkRead,
  isPending,
}: {
  notification: any;
  onMarkRead: (id: string) => void;
  isPending: boolean;
}) {
  const { t } = useTranslation();
  const config = notificationConfig[notification.type] || {
    icon: Bell,
    bgClass: "bg-muted",
    iconClass: "text-muted-foreground",
  };
  const Icon = config.icon;
  const isUnread = !notification.isRead;

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-2xl border transition-all",
        isUnread
          ? "bg-primary/5 border-primary/15 dark:bg-primary/10"
          : "bg-card border-border/50 opacity-70 hover:opacity-100"
      )}
      data-testid={`notification-item-${notification.id}`}
    >
      <div className={cn("p-2.5 rounded-xl shrink-0 mt-0.5", config.bgClass)}>
        <Icon className={cn("w-5 h-5", config.iconClass)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className={cn("font-semibold text-sm leading-snug", !isUnread && "text-muted-foreground")}>
            {notification.title}
          </h3>
          {isUnread && (
            <span className="mt-0.5 w-2 h-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
          {notification.relatedListingId && (
            <Link
              href={`/listings/${notification.relatedListingId}`}
              className="text-primary hover:underline font-medium"
            >
              {t("notifications.viewListing")} →
            </Link>
          )}
        </div>
      </div>

      {isUnread && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 h-8 w-8 p-0 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"
          onClick={() => onMarkRead(notification.id)}
          disabled={isPending}
          title={t("notifications.markAsRead")}
          data-testid={`button-mark-read-${notification.id}`}
        >
          <CheckCircle className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
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
                  <span className="font-medium text-foreground">{unreadCount}</span>{" "}
                  {t("notifications.unread")}
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
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">{t("notifications.noNotifications")}</p>
            <p className="text-sm mt-1">{t("notifications.noNotificationsHint")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(({ key, items }) => (
              <div key={key}>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  {t(`notifications.${key}`)}
                </h2>
                <div className="space-y-2">
                  {items.map((n: any) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onMarkRead={(id) => markReadMutation.mutate(id)}
                      isPending={markReadMutation.isPending}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
