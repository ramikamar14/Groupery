"use client";

import { useState } from "react";
import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Gift,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType =
  | "join"
  | "message"
  | "complete"
  | "expire"
  | "verification"
  | "warning"
  | "reward";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  listingLabel?: string;
  read: boolean;
}

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; iconClass: string; bgClass: string }
> = {
  join: {
    icon: Users,
    iconClass: "text-blue-400",
    bgClass: "bg-blue-500/15",
  },
  message: {
    icon: MessageSquare,
    iconClass: "text-teal-400",
    bgClass: "bg-teal-500/15",
  },
  complete: {
    icon: CheckCircle,
    iconClass: "text-emerald-400",
    bgClass: "bg-emerald-500/15",
  },
  expire: {
    icon: Clock,
    iconClass: "text-amber-400",
    bgClass: "bg-amber-500/15",
  },
  verification: {
    icon: Shield,
    iconClass: "text-accent",
    bgClass: "bg-accent/15",
  },
  warning: {
    icon: AlertCircle,
    iconClass: "text-rose-400",
    bgClass: "bg-rose-500/15",
  },
  reward: {
    icon: Gift,
    iconClass: "text-emerald-400",
    bgClass: "bg-emerald-500/15",
  },
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const { icon: Icon, iconClass, bgClass } = typeConfig[notification.type];

  const handleMarkRead = () => {
    setIsMarkingRead(true);
    setTimeout(() => {
      onMarkRead(notification.id);
      setIsMarkingRead(false);
    }, 300);
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300",
        notification.read
          ? "bg-card border-border opacity-70"
          : "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/25"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "p-2.5 rounded-xl shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110",
          bgClass
        )}
      >
        <Icon className={cn("w-5 h-5", iconClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm text-foreground leading-tight">
            {notification.title}
          </h3>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" aria-label="Unread" />
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          {notification.message}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{notification.timestamp}</span>
          {notification.listingLabel && (
            <button className="text-accent font-medium hover:text-accent/80 transition-colors">
              View listing →
            </button>
          )}
        </div>
      </div>

      {/* Mark read button */}
      {!notification.read && (
        <button
          onClick={handleMarkRead}
          disabled={isMarkingRead}
          aria-label="Mark as read"
          className={cn(
            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            "border border-border text-muted-foreground",
            "hover:border-accent hover:text-accent hover:bg-accent/10",
            "transition-all duration-200",
            isMarkingRead && "opacity-50 scale-90"
          )}
        >
          <CheckCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
