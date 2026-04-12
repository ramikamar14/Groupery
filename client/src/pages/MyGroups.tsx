import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { MyGroupCard } from "@/components/my-groups/MyGroupCard";
import { StatusPills } from "@/components/my-groups/StatusPills";
import { OrganizerStats } from "@/components/my-groups/OrganizerStats";
import { listingMatchesStatusFilter, type StatusFilter } from "@/components/my-groups/group-utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, Plus, PlusCircle, Crown, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function statusCounts(listings: any[]) {
  return {
    all: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    completed: listings.filter((l) => l.status === "completed").length,
    expired: listings.filter((l) => l.status === "expired" || l.status === "cancelled").length,
  };
}

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

function AllTabFilterEmpty({ status }: { status: StatusFilter }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-card rounded-3xl border border-dashed border-border text-center px-8">
      <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-5">
        <Users className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-xl font-bold mb-2">{t("myGroups.noMatchFilterTitle")}</h3>
      <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">{t("myGroups.noMatchFilterDesc")}</p>
      {status !== "all" && (
        <p className="text-sm text-muted-foreground">{t("myGroups.noMatchFilterHint")}</p>
      )}
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
  const filtered = listings.filter((l) => listingMatchesStatusFilter(l, status));

  if (filtered.length === 0) {
    return <EmptyState tab={tab} status={status} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((listing: any) => (
        <MyGroupCard
          key={listing.id}
          listing={listing}
          role={tab === "created" ? "creator" : "member"}
          tab={tab}
        />
      ))}
    </div>
  );
}

export default function MyGroups() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [createdStatus, setCreatedStatus] = useState<StatusFilter>("all");
  const [joinedStatus, setJoinedStatus] = useState<StatusFilter>("all");
  const [allStatus, setAllStatus] = useState<StatusFilter>("all");

  const { data: myGroups = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/my-groups"],
  });

  const created = myGroups.filter((l) => l.creatorId === user?.id);
  const joined = myGroups.filter((l) => l.creatorId !== user?.id);

  const activeCreated = created.filter((l) => l.status === "active").length;
  const activeJoined = joined.filter((l) => l.status === "active").length;

  const allCounts = useMemo(() => statusCounts(myGroups), [myGroups]);

  const allFiltered = useMemo(
    () => myGroups.filter((l) => listingMatchesStatusFilter(l, allStatus)),
    [myGroups, allStatus]
  );

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

          <TabsContent value="all" className="space-y-4">
            <StatusPills value={allStatus} onChange={setAllStatus} counts={allCounts} />
            {allFiltered.length === 0 ? (
              <AllTabFilterEmpty status={allStatus} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allFiltered.map((listing: any) => {
                  const isCreator = listing.creatorId === user?.id;
                  return (
                    <MyGroupCard
                      key={listing.id}
                      listing={listing}
                      role={isCreator ? "creator" : "member"}
                      tab="all"
                    />
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
                <OrganizerStats
                  totalGroups={created.length}
                  totalParticipants={totalParticipants}
                  fillRatePct={fillRate}
                  completedGroups={completedGroups}
                />
              );
            })()}
            <StatusPills value={createdStatus} onChange={setCreatedStatus} counts={statusCounts(created)} />
            <ListingGrid listings={created} tab="created" status={createdStatus} />
          </TabsContent>

          <TabsContent value="joined" className="space-y-4">
            <StatusPills value={joinedStatus} onChange={setJoinedStatus} counts={statusCounts(joined)} />
            <ListingGrid listings={joined} tab="joined" status={joinedStatus} />
          </TabsContent>
        </Tabs>
      )}
    </Layout>
  );
}
