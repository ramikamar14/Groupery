import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CheckCircle, Megaphone, PlusCircle, UserPlus } from "lucide-react";

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  user_joined: <UserPlus className="w-4 h-4 text-green-500" />,
  listing_created: <PlusCircle className="w-4 h-4 text-blue-500" />,
  group_completed: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  announcement_posted: <Megaphone className="w-4 h-4 text-amber-500" />,
};

function getActivityMessage(entry: any, t: TFunction): string {
  const actorName = entry.actor?.firstName || entry.actor?.username || t("home.activitySomeone", "Someone");
  const listingTitle =
    entry.metadata?.listingTitle || entry.metadata?.title || entry.listing?.title || t("home.activityAListing", "a listing");
  switch (entry.type) {
    case "user_joined":
      return t("home.activityJoined", { actor: actorName, listing: listingTitle, defaultValue: `${actorName} joined "${listingTitle}"` });
    case "listing_created":
      return t("home.activityCreated", { actor: actorName, listing: listingTitle, defaultValue: `${actorName} created "${listingTitle}"` });
    case "group_completed":
      return t("home.activityCompleted", { listing: listingTitle, defaultValue: `"${listingTitle}" is now complete` });
    case "announcement_posted":
      return t("home.activityAnnouncement", {
        actor: actorName,
        listing: listingTitle,
        defaultValue: `${actorName} posted an update in "${listingTitle}"`,
      });
    default:
      return t("home.activityGeneric", { defaultValue: "New activity" });
  }
}

function formatTimeAgo(dateStr: string, t: TFunction): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t("home.timeJustNow", "just now");
  if (minutes < 60) return t("home.timeMinutesAgo", { minutes, defaultValue: `${minutes}m ago` });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("home.timeHoursAgo", { hours, defaultValue: `${hours}h ago` });
  const days = Math.floor(hours / 24);
  return t("home.timeDaysAgo", { days, defaultValue: `${days}d ago` });
}

export function ActivityFeedSection() {
  const { t } = useTranslation();
  const { data: feed, isLoading } = useQuery<any[]>({
    queryKey: ["activity-feed"],
    queryFn: async () => {
      const res = await fetch("/api/activity-feed?limit=10", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="mb-8" data-testid="section-activity-feed">
        <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          {t("home.activityFeed", "Activity")}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!feed || feed.length === 0) return null;

  return (
    <div className="mb-8" data-testid="section-activity-feed">
      <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        {t("home.activityFeed", "Activity")}
      </h2>
      <div className="space-y-2">
        {feed.map((entry: any) => {
          const timeAgo = entry.createdAt ? formatTimeAgo(entry.createdAt, t) : "";
          return (
            <div key={entry.id} className="flex items-center gap-3 p-2 rounded-md" data-testid={`activity-item-${entry.id}`}>
              <div className="flex-shrink-0">
                {entry.actor ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.actor.profileImageUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {(entry.actor.firstName?.[0] || entry.actor.username?.[0] || "?").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    {ACTIVITY_ICONS[entry.type] || <Activity className="w-4 h-4 text-muted-foreground" />}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {entry.listingId ? (
                  <Link href={`/listings/${entry.listingId}`} data-testid={`activity-link-${entry.id}`}>
                    <span className="text-sm hover:underline cursor-pointer">{getActivityMessage(entry, t)}</span>
                  </Link>
                ) : (
                  <span className="text-sm">{getActivityMessage(entry, t)}</span>
                )}
              </div>
              <div className="flex-shrink-0 flex items-center gap-1">
                {ACTIVITY_ICONS[entry.type] || null}
                <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
