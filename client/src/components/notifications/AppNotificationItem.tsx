import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Users, MessageSquare, Clock, AlertCircle, Gift, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const notificationConfig: Record<string, { icon: typeof Bell; bgClass: string; iconClass: string }> = {
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

export function AppNotificationItem({
  notification,
  onMarkRead,
  isPending,
}: {
  notification: { id: string; type?: string; title?: string; message?: string; createdAt: string; isRead?: boolean; relatedListingId?: number | null };
  onMarkRead: (id: string) => void;
  isPending: boolean;
}) {
  const { t } = useTranslation();
  const config = notificationConfig[notification.type || ""] || {
    icon: Bell,
    bgClass: "bg-muted",
    iconClass: "text-muted-foreground",
  };
  const Icon = config.icon;
  const isUnread = !notification.isRead;

  return (
    <div
      className={cn(
        "group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200",
        isUnread
          ? "bg-primary/[0.04] border-primary/15 dark:bg-primary/10 shadow-sm"
          : "bg-card border-border/60 opacity-80 hover:opacity-100 hover:border-accent/25"
      )}
      data-testid={`notification-item-${notification.id}`}
    >
      <div
        className={cn(
          "p-2.5 rounded-xl shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-105",
          config.bgClass
        )}
      >
        <Icon className={cn("w-5 h-5", config.iconClass)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className={cn("font-semibold text-sm leading-snug", !isUnread && "text-muted-foreground")}>
            {notification.title}
          </h3>
          {isUnread && <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" aria-hidden />}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{notification.message}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
          {notification.relatedListingId != null && (
            <Link
              href={`/listings/${notification.relatedListingId}`}
              className="text-accent font-medium hover:underline"
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
          className="shrink-0 h-8 w-8 p-0 rounded-full hover:bg-accent/15 text-muted-foreground hover:text-accent"
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
