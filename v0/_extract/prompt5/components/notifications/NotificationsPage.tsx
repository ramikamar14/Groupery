"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationGroup } from "./NotificationGroup";
import type { Notification } from "./NotificationItem";

const INITIAL_NOTIFICATIONS: Notification[] = [
  // TODAY
  {
    id: "1",
    type: "join",
    title: "New member joined",
    message: 'Ahmed joined your "Electronics Group Buy"',
    timestamp: "2 minutes ago",
    listingLabel: "Electronics Group Buy",
    read: false,
  },
  {
    id: "2",
    type: "message",
    title: "New message in group",
    message: 'Sara posted in "Winter Jackets Collective" – "Has anyone confirmed the sizes?"',
    timestamp: "41 minutes ago",
    listingLabel: "Winter Jackets Collective",
    read: false,
  },
  {
    id: "3",
    type: "reward",
    title: "You earned a reward!",
    message: "You received 50 Grouperry points for completing your first group buy.",
    timestamp: "1 hour ago",
    read: false,
  },
  // YESTERDAY
  {
    id: "4",
    type: "complete",
    title: "Group buy completed",
    message: 'Your group "Organic Coffee Beans" reached 100% and is now confirmed.',
    timestamp: "Yesterday, 3:15 PM",
    listingLabel: "Organic Coffee Beans",
    read: true,
  },
  {
    id: "5",
    type: "verification",
    title: "Identity verified",
    message: "Your organiser account has been successfully verified. You can now host group buys.",
    timestamp: "Yesterday, 11:08 AM",
    read: true,
  },
  // THIS WEEK
  {
    id: "6",
    type: "expire",
    title: "Listing expiring soon",
    message: 'Your "Home Appliances Bundle" closes in 24 hours – 3 spots remaining.',
    timestamp: "Mon, 9:00 AM",
    listingLabel: "Home Appliances Bundle",
    read: true,
  },
  {
    id: "7",
    type: "join",
    title: "2 new members joined",
    message: 'Layla and Omar joined your "Fitness Equipment Bulk".',
    timestamp: "Sun, 6:30 PM",
    listingLabel: "Fitness Equipment Bulk",
    read: true,
  },
  // EARLIER
  {
    id: "8",
    type: "warning",
    title: "Payment issue detected",
    message: "A member in your group failed to complete payment. Review your group.",
    timestamp: "Mar 28",
    listingLabel: "Kitchen Gadgets Group",
    read: true,
  },
  {
    id: "9",
    type: "complete",
    title: "Order shipped",
    message: 'Items from "Kitchen Gadgets Group" have been dispatched. Track your delivery.',
    timestamp: "Mar 25",
    listingLabel: "Kitchen Gadgets Group",
    read: true,
  },
];

function groupNotifications(notifications: Notification[]) {
  // For demo purposes, use index-based bucketing that matches the timestamps above
  const today = notifications.filter((_, i) => i < 3);
  const yesterday = notifications.filter((_, i) => i >= 3 && i < 5);
  const thisWeek = notifications.filter((_, i) => i >= 5 && i < 7);
  const earlier = notifications.filter((_, i) => i >= 7);
  return { today, yesterday, thisWeek, earlier };
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const { today, yesterday, thisWeek, earlier } = groupNotifications(notifications);
  const isEmpty = notifications.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav bar */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-accent-foreground" />
          </div>
          <span className="font-semibold text-foreground tracking-tight text-lg">Grouperry</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-balance leading-tight">
              Notifications
            </h1>
            {unreadCount > 0 ? (
              <p className="text-muted-foreground mt-1 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                  {unreadCount} unread
                </span>
              </p>
            ) : (
              <p className="text-muted-foreground mt-1 text-sm">All caught up</p>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="shrink-0 border-border text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification groups */}
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            <NotificationGroup label="Today" notifications={today} onMarkRead={markRead} />
            <NotificationGroup label="Yesterday" notifications={yesterday} onMarkRead={markRead} />
            <NotificationGroup label="This Week" notifications={thisWeek} onMarkRead={markRead} />
            <NotificationGroup label="Earlier" notifications={earlier} onMarkRead={markRead} />
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <BellOff className="w-8 h-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground text-lg">You&apos;re all caught up</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-xs text-pretty">
          No new notifications right now. Check back when your groups have activity.
        </p>
      </div>
    </div>
  );
}
