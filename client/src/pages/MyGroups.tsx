import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ListingCard } from "@/components/ListingCard";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, Plus, PlusCircle, Crown, UserCheck, CreditCard, Star, Package, Share2, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "active" | "completed" | "expired";

function getNextAction(listing: any, tab: "created" | "joined" | "all", isCreator: boolean) {
  const isFull = listing.filledSlots >= listing.totalSlots;
  const status = listing.status;
  if (isCreator || tab === "created") {
    if (status === "active" && isFull) return { key: "collectPayments", icon: CreditCard, color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800" };
    if (status === "active" && !isFull) return { key: "shareToFill", icon: Share2, color: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-800" };
    if (status === "completed") return { key: "markDeliveries", icon: Package, color: "text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-300 dark:bg-teal-950/50 dark:border-teal-800" };
  } else {
    if (status === "active" && listing.paymentMethod) return { key: "sendPayment", icon: CreditCard, color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800" };
    if (status === "active") return { key: "awaitingUpdates", icon: Zap, color: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-800" };
    if (status === "completed") return { key: "leaveReview", icon: Star, color: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-950/50 dark:border-yellow-800" };
  }
  return null;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
  completed: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800",
  expired: "bg-muted text-muted-foreground border-border",
};

function EmptyState({ tab, status }: { tab: "created" | "joined"; status: StatusFilter }) {
  const { t } = useTranslation();

  const messages = {
    created: {
      all: { title: t("myGroups.noGroupsCreated"), desc: t("myGroups.noGroupsCreatedDesc"), cta: t("myGroups.createListing"), href: "/create", icon: Crown },
      active: { title: t("myGroups.noActiveCreated"), desc: t("myGroups.noActiveCreatedDesc"), cta: t("myGroups.createListing"), href: "/create", icon: Crown },
      completed: { title: t("myGroups.noCompletedCreated"), desc: t("myGroups.noCompletedCreatedDesc"), cta: t("myGroups.createListing"), href: "/create", icon: Crown },
      expired: { title: t("myGroups.noExpiredCreated"), desc: t("myGroups.noExpiredCreatedDesc"), cta: t("myGroups.createListing"), href: "/create", icon: Crown },
    },
    joined: {
      all: { title: t("myGroups.noGroupsJoined"), desc: t("myGroups.noGroupsJoinedDesc"), cta: t("myGroups.browseListing"), href: "/", icon: UserCheck },
      active: { title: t("myGroups.noActiveJoined"), desc: t("myGroups.noActiveJoinedDesc"), cta: t("myGroups.browseListing"), href: "/", icon: UserCheck },
      completed: { title: t("myGroups.noCompletedJoined"), desc: t("myGroups.noCompletedJoinedDesc"), cta: t("myGroups.browseListing"), href: "/", icon: UserCheck },
      expired: { title: t("myGroups.noExpiredJoined"), desc: t("myGroups.noExpiredJoinedDesc"), cta: t("myGroups.browseListing"), href: "/", icon: UserCheck },
    },
  };

  const msg = messages[tab][status];
  const Icon = msg.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 bg-card rounded-3xl border border-dashed border-border text-center px-8">
      <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-xl font-bold mb-2">{msg.title}</h3>
      <p className="text-muted-foreground max-w-xs mb-6 leading-relaxed">{msg.desc}</p>
      <Button asChild size="sm" className="gap-2">
        <Link href={msg.href}>
          <PlusCircle className="w-4 h-4" />
          {msg.cta}
        </Link>
      </Button>
    </div>
  );
}

function StatusPills({ value, onChange }: { value: StatusFilter; onChange: (v: StatusFilter) => void }) {
  const { t } = useTranslation();
  const statusLabels: Record<StatusFilter, string> = {
    all: t("myGroups.all"),
    active: t("myGroups.active"),
    completed: t("myGroups.completed"),
    expired: t("myGroups.expired"),
  };
  return (
    <div className="flex gap-2 flex-wrap">
      {(["all", "active", "completed", "expired"] as StatusFilter[]).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium border transition-all",
            value === s
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
          )}
        >
          {statusLabels[s]}
        </button>
      ))}
    </div>
  );
}

function ListingGrid({
  listings,
  tab,
  status,
}: {
  listings: any[];
  tab: "created" | "joined";
  status: StatusFilter;
}) {
  const { t } = useTranslation();
  const filtered = listings.filter((l) => status === "all" || l.status === status);

  if (filtered.length === 0) {
    return <EmptyState tab={tab} status={status} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((listing: any) => {
        const isCreator = tab === "created";
        const nextAction = getNextAction(listing, tab, isCreator);
        return (
          <div key={listing.id} className="relative">
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                  tab === "created"
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                )}
              >
                {tab === "created" ? <Crown className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                {tab === "created" ? t("myGroups.organiser") : t("myGroups.member")}
              </span>
              {nextAction && (
                <Link href={`/listings/${listing.id}`}>
                  <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer hover:opacity-80 transition-opacity", nextAction.color)} data-testid={`badge-next-action-${listing.id}`}>
                    <nextAction.icon className="w-3 h-3" />
                    {t(`myGroups.${nextAction.key}`)}
                  </span>
                </Link>
              )}
            </div>
            <ListingCard listing={listing} />
          </div>
        );
      })}
    </div>
  );
}

export default function MyGroups() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [createdStatus, setCreatedStatus] = useState<StatusFilter>("all");
  const [joinedStatus, setJoinedStatus] = useState<StatusFilter>("all");

  const { data: myGroups = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/my-groups"],
  });

  const created = myGroups.filter((l) => l.creatorId === user?.id);
  const joined = myGroups.filter((l) => l.creatorId !== user?.id);

  const activeCreated = created.filter((l) => l.status === "active").length;
  const activeJoined = joined.filter((l) => l.status === "active").length;

  return (
    <Layout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">{t("nav.myGroups")}</h1>
          <p className="text-muted-foreground mt-1">
            {myGroups.length === 0
              ? t("myGroups.emptySubtitle")
              : myGroups.length === 1
                ? t("myGroups.groupStats", { count: myGroups.length, created: created.length, joined: joined.length })
                : t("myGroups.groupStatsPlural", { count: myGroups.length, created: created.length, joined: joined.length })}
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5 shrink-0">
          <Link href="/create">
            <Plus className="w-4 h-4" />
            {t("myGroups.createBtn")}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center h-64 items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : myGroups.length === 0 ? (
        <EmptyState tab="joined" status="all" />
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6 h-auto p-1 gap-1">
            <TabsTrigger value="all" className="gap-2 rounded-lg">
              <Users className="w-4 h-4" />
              {t("myGroups.all")}
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-4 min-w-4">
                {myGroups.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="created" className="gap-2 rounded-lg">
              <Crown className="w-4 h-4" />
              {t("myGroups.organised")}
              <Badge
                variant="secondary"
                className={cn(
                  "ml-1 text-xs px-1.5 py-0 h-4 min-w-4",
                  activeCreated > 0 && "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                )}
              >
                {created.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="joined" className="gap-2 rounded-lg">
              <UserCheck className="w-4 h-4" />
              {t("myGroups.joined")}
              <Badge
                variant="secondary"
                className={cn(
                  "ml-1 text-xs px-1.5 py-0 h-4 min-w-4",
                  activeJoined > 0 && "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                )}
              >
                {joined.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {myGroups.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((listing: any) => {
                  const isCreator = listing.creatorId === user?.id;
                  const nextAction = getNextAction(listing, isCreator ? "created" : "joined", isCreator);
                  return (
                    <div key={listing.id} className="relative">
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                            isCreator
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                          )}
                        >
                          {isCreator ? <Crown className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          {isCreator ? t("myGroups.organiser") : t("myGroups.member")}
                        </span>
                        {nextAction && (
                          <Link href={`/listings/${listing.id}`}>
                            <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer hover:opacity-80 transition-opacity", nextAction.color)} data-testid={`badge-next-action-all-${listing.id}`}>
                              <nextAction.icon className="w-3 h-3" />
                              {t(`myGroups.${nextAction.key}`)}
                            </span>
                          </Link>
                        )}
                      </div>
                      <ListingCard listing={listing} />
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="created" className="space-y-4">
            {created.length > 0 && (() => {
              const totalParticipants = created.reduce((sum, l) => sum + (l.filledSlots || 0), 0);
              const totalSlots = created.reduce((sum, l) => sum + (l.totalSlots || 0), 0);
              const fillRate = totalSlots > 0 ? Math.round((totalParticipants / totalSlots) * 100) : 0;
              const completedGroups = created.filter((l) => l.status === "completed").length;
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="organizer-analytics">
                  <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-primary" data-testid="stat-total-groups">{created.length}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t("myGroups.totalGroups")}</p>
                  </div>
                  <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-primary" data-testid="stat-total-participants">{totalParticipants}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t("myGroups.totalMembers")}</p>
                  </div>
                  <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="stat-fill-rate">{fillRate}%</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t("myGroups.fillRate")}</p>
                  </div>
                  <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="stat-completed">{completedGroups}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t("myGroups.completedStat")}</p>
                  </div>
                </div>
              );
            })()}
            <StatusPills value={createdStatus} onChange={setCreatedStatus} />
            <ListingGrid listings={created} tab="created" status={createdStatus} />
          </TabsContent>

          <TabsContent value="joined" className="space-y-4">
            <StatusPills value={joinedStatus} onChange={setJoinedStatus} />
            <ListingGrid listings={joined} tab="joined" status={joinedStatus} />
          </TabsContent>
        </Tabs>
      )}
    </Layout>
  );
}
