import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle, XCircle, Users, AlertTriangle, Activity, Database, Clock, Mail, Server, ShieldAlert, Ban, ScrollText, ChevronLeft, ChevronRight, ToggleLeft, History, Brain, ShoppingBag, UserCog, Search, Crown, Shield, ShieldOff, Trash2, RotateCcw, Eye, Settings, Palette, Sliders, CheckSquare, Flag, Cpu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function Admin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingUsers = [], isLoading: loadingUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/pending-verifications"],
    enabled: !!user?.isAdmin,
  });

  const { data: reports = [], isLoading: loadingReports } = useQuery<any[]>({
    queryKey: ["/api/admin/reports"],
    enabled: !!user?.isAdmin,
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: suspiciousFlags = [], isLoading: loadingFlags } = useQuery({
    queryKey: ["/api/admin/suspicious-flags", "unresolved"],
    queryFn: async () => {
      const res = await fetch("/api/admin/suspicious-flags?resolved=false", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch flags");
      return res.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: healthData, isLoading: loadingHealth } = useQuery<any>({
    queryKey: ["/api/admin/health"],
    enabled: !!user?.isAdmin,
    refetchInterval: 30000,
  });

  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [eventsPage, setEventsPage] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");
  const eventsPerPage = 20;
  const [activityUserId, setActivityUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { data: systemEventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ["/api/admin/system-events", eventTypeFilter, eventsPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (eventTypeFilter && eventTypeFilter !== "all") params.set("eventType", eventTypeFilter);
      params.set("limit", String(eventsPerPage));
      params.set("offset", String(eventsPage * eventsPerPage));
      const res = await fetch(`/api/admin/system-events?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch system events");
      return res.json();
    },
    enabled: !!user?.isAdmin,
  });

  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: "verified" | "rejected" }) => {
      const res = await fetch(`/api/admin/verify-user/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update verification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-verifications"] });
      toast({ title: t("admin.updated"), description: t("admin.verificationUpdated") });
    },
  });

  const resolveReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to resolve report");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      toast({ title: t("admin.resolved"), description: t("admin.reportResolved") });
    },
  });

  const dismissFlagMutation = useMutation({
    mutationFn: async (flagId: number) => {
      const res = await fetch(`/api/admin/suspicious-flags/${flagId}/resolve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to dismiss flag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/suspicious-flags"] });
      toast({ title: t("admin.dismiss"), description: t("admin.flagDismissed") });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async (flagId: number) => {
      const res = await fetch(`/api/admin/suspicious-flags/${flagId}/ban`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to ban user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/suspicious-flags"] });
      toast({ title: t("admin.banned"), description: t("admin.userBanned2") });
    },
  });

  const { data: featureFlags = [], isLoading: loadingFeatureFlags } = useQuery<any[]>({
    queryKey: ["/api/admin/feature-flags"],
    enabled: !!user?.isAdmin,
  });

  const { data: allUsers = [], isLoading: loadingAllUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin,
  });

  const { data: siteSettings, isLoading: loadingSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
    enabled: !!user?.isAdmin,
  });

  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (siteSettings) setSettingsForm(siteSettings);
  }, [siteSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: t("admin.settingsSaved") });
    },
    onError: () => {
      toast({ title: t("admin.settingsSaved"), variant: "destructive" });
    },
  });

  const [aiAnalysis, setAiAnalysis] = useState<{ model: string; analysis: string } | null>(null);
  const [analyzingPlatform, setAnalyzingPlatform] = useState(false);

  async function handleAnalyzePlatform() {
    setAnalyzingPlatform(true);
    setAiAnalysis(null);
    try {
      const res = await fetch("/api/admin/ai/analyze", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAiAnalysis(data);
    } catch {
      toast({ title: t("admin.analysisFailed"), description: t("admin.analysisFailedDesc"), variant: "destructive" });
    } finally {
      setAnalyzingPlatform(false);
    }
  }

  const approveOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/orders/${id}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: t("admin.approved"), description: t("admin.approvedDesc") });
    },
  });

  const rejectOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/orders/${id}/reject`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: t("admin.rejected"), description: t("admin.rejectedDesc") });
    },
  });

  const toggleFeatureFlagMutation = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const res = await fetch(`/api/admin/feature-flags/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update feature flag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feature-flags"] });
      toast({ title: t("admin.updated"), description: t("admin.flagUpdated") });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change role");
      return data;
    },
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: t("admin.roleUpdated"),
        description: role === "admin" ? t("admin.promotedToAdmin") : t("admin.demotedToUser"),
      });
    },
    onError: (err: any) => {
      toast({ title: t("admin.error"), description: err.message, variant: "destructive" });
    },
  });

  const disableUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/disable`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to toggle ban");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: data.isDisabled ? t("admin.userBannedNow") : t("admin.userUnbanned"),
        description: data.isDisabled ? t("admin.userBannedDesc") : t("admin.userUnbannedDesc"),
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeleteUserId(null);
      toast({ title: t("admin.userDeleted"), description: t("admin.userDeletedDesc") });
    },
  });

  const resetUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/reset`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reset user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: t("admin.userReset"), description: t("admin.userResetDesc") });
    },
  });

  const { data: activityData, isLoading: loadingActivity } = useQuery<any>({
    queryKey: ["/api/admin/users", activityUserId, "activity"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${activityUserId}/activity`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch activity");
      return res.json();
    },
    enabled: !!activityUserId,
  });

  const headerHealthy = !loadingHealth && healthData?.status === "healthy";

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold mb-2">{t("admin.accessDenied")}</h2>
            <p className="text-muted-foreground">{t("admin.noPermission")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout mainClassName="max-w-[1400px]">
      <div className="space-y-8">
        <div className="rounded-xl border border-border bg-card px-4 py-4 sm:px-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0" aria-hidden>
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-foreground text-lg truncate">{t("landing.brandName")}</span>
              <span className="text-muted-foreground text-sm shrink-0">{t("admin.adminToolbarContext")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={cn(
                "w-2 h-2 rounded-full shrink-0",
                loadingHealth ? "bg-slate-400 animate-pulse" : headerHealthy ? "bg-emerald-500" : "bg-amber-500"
              )}
              aria-hidden
            />
            {loadingHealth ? t("admin.systemChecking") : headerHealthy ? t("admin.systemOperational") : t("admin.systemDegraded")}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold font-display text-foreground text-balance">{t("admin.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("admin.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("admin.totalUsers")}</CardTitle>
              <Users className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums text-foreground">
                {(stats?.totalUsers ?? 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("admin.activeListings")}</CardTitle>
              <ShoppingBag className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums text-foreground">{stats?.activeListings ?? 0}</div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "transition-shadow hover:shadow-md",
              pendingUsers.length > 0 ? "border-amber-200 dark:border-amber-900/50" : "border-border"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("admin.pendingVerifications")}</CardTitle>
              <AlertTriangle
                className={cn("w-5 h-5", pendingUsers.length > 0 ? "text-amber-500" : "text-accent")}
              />
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-3xl font-bold tabular-nums",
                  pendingUsers.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                )}
              >
                {pendingUsers.length}
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "transition-shadow hover:shadow-md",
              reports.length > 0 ? "border-red-200 dark:border-red-900/50" : "border-border"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("admin.openReports")}</CardTitle>
              <Flag className={cn("w-5 h-5", reports.length > 0 ? "text-destructive" : "text-accent")} />
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-3xl font-bold tabular-nums",
                  reports.length > 0 ? "text-destructive" : "text-foreground"
                )}
              >
                {reports.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verifications">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/50 p-1 border-0">
            <TabsTrigger
              value="verifications"
              data-testid="tab-verifications"
              className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:text-accent"
            >
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("admin.verifications")}</span>
              <span
                className={cn(
                  "ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-semibold tabular-nums",
                  pendingUsers.length > 0
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {pendingUsers.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              data-testid="tab-reports"
              className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:text-accent"
            >
              <Flag className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("admin.reports")}</span>
              <span
                className={cn(
                  "ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-semibold tabular-nums",
                  reports.length > 0
                    ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {reports.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="suspicious"
              data-testid="tab-suspicious"
              className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:text-accent"
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("admin.flagged")}</span>
              <span
                className={cn(
                  "ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-semibold tabular-nums",
                  suspiciousFlags.length > 0
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {suspiciousFlags.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="health" data-testid="tab-health" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:text-accent">
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("admin.health")}</span>
            </TabsTrigger>
            <TabsTrigger value="system-events" data-testid="tab-system-events" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:text-accent">
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("admin.events")}</span>
            </TabsTrigger>
            <TabsTrigger value="feature-flags" data-testid="tab-feature-flags" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:text-accent">
              <ToggleLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("admin.featureFlags")}</span>
            </TabsTrigger>
            <TabsTrigger value="edit-history" data-testid="tab-edit-history" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:text-accent">
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("admin.editHistory")}</span>
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:text-accent">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("admin.usersTab")}</span>
              <span className="ml-0.5 bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full font-semibold tabular-nums">
                {allUsers.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:text-accent">
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("admin.ordersTab")}</span>
              <span className="ml-0.5 bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full font-semibold tabular-nums">
                {orders.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:text-accent">
              <Brain className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("admin.aiAnalytics")}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings" className="gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:text-accent">
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t("admin.settingsTab")}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="verifications" className="mt-6">
            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : pendingUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t("admin.noPendingVerifications")}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((u: any) => (
                  <Card key={u.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={u.profileImageUrl || undefined} />
                          <AvatarFallback>{u.firstName?.[0]}{u.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{u.firstName} {u.lastName}</h3>
                            <Badge variant="secondary">{u.userType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          
                          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                            {u.idDocumentUrl && (
                              <a href={u.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                {t("admin.viewIdDocument")}
                              </a>
                            )}
                            {u.selfieUrl && (
                              <a href={u.selfieUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                {t("admin.viewSelfie")}
                              </a>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200"
                            onClick={() => verifyUserMutation.mutate({ userId: u.id, status: "verified" })}
                            disabled={verifyUserMutation.isPending}
                            data-testid={`button-approve-${u.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t("admin.approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/20"
                            onClick={() => verifyUserMutation.mutate({ userId: u.id, status: "rejected" })}
                            disabled={verifyUserMutation.isPending}
                            data-testid={`button-reject-${u.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {t("admin.reject")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6">
            {loadingReports ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t("admin.noOpenReports")}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((r: any) => (
                  <Card key={r.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline">
                              {r.listingId ? t("admin.listingReport") : t("admin.userReport")}
                            </Badge>
                            {r.category && r.category !== "other" && (
                              <Badge
                                className={
                                  r.category === "fraud" ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200" :
                                  r.category === "harassment" ? "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200" :
                                  r.category === "spam" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300 border-yellow-200" :
                                  r.category === "fake" ? "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200" :
                                  "bg-muted text-muted-foreground border-border"
                                }
                                variant="outline"
                                data-testid={`badge-report-category-${r.id}`}
                              >
                                {r.category === "fraud" ? t("listing.reportCategoryFraud", "Fraud / Scam")
                                : r.category === "spam" ? t("listing.reportCategorySpam", "Spam")
                                : r.category === "harassment" ? t("listing.reportCategoryHarassment", "Harassment")
                                : r.category === "fake" ? t("listing.reportCategoryFake", "Fake Identity")
                                : t("listing.reportCategoryOther", "Other")}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {r.createdAt ? format(new Date(r.createdAt), "MMM d, yyyy") : ""}
                            </span>
                          </div>

                          <p className="font-medium mb-2 text-sm">{r.reason}</p>

                          <div className="text-xs text-muted-foreground space-y-1">
                            {r.reporter && (
                              <p>
                                <span className="font-semibold">{t("admin.reportedBy", "Reported by")}:</span>{" "}
                                {r.reporter.firstName} {r.reporter.lastName}
                                {r.reporter.email ? ` (${r.reporter.email})` : ""}
                              </p>
                            )}
                            {r.reportedUser && (
                              <p>
                                <span className="font-semibold">{t("admin.reportedUser", "Against user")}:</span>{" "}
                                {r.reportedUser.firstName} {r.reportedUser.lastName}
                              </p>
                            )}
                            {r.listing && (
                              <p>
                                <span className="font-semibold">{t("admin.reportedListing", "Listing")}:</span>{" "}
                                <a
                                  href={`/listings/${r.listing.id}`}
                                  className="underline text-primary hover:text-primary/80"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {r.listing.title}
                                </a>
                                <span className="ml-1 text-muted-foreground">({r.listing.status})</span>
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveReportMutation.mutate(r.id)}
                          disabled={resolveReportMutation.isPending}
                          data-testid={`button-resolve-${r.id}`}
                          className="shrink-0"
                        >
                          {t("admin.markResolved")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="system-events" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Select value={eventTypeFilter} onValueChange={(v) => { setEventTypeFilter(v); setEventsPage(0); }}>
                  <SelectTrigger className="w-[200px]" data-testid="select-event-type-filter">
                    <SelectValue placeholder={t("admin.filterByType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("admin.allEvents")}</SelectItem>
                    <SelectItem value="verification_changed">{t("admin.verificationChanged")}</SelectItem>
                    <SelectItem value="admin_action">{t("admin.adminAction")}</SelectItem>
                    <SelectItem value="listing_completed">{t("admin.listingCompleted")}</SelectItem>
                    <SelectItem value="user_banned">{t("admin.userBanned")}</SelectItem>
                    <SelectItem value="listing_removed">{t("admin.listingRemoved")}</SelectItem>
                    <SelectItem value="suspicious_flag_resolved">{t("admin.flagResolved")}</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground" data-testid="text-events-total">
                  {systemEventsData?.total ?? 0} {t("admin.totalEvents")}
                </span>
              </div>

              {loadingEvents ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : !systemEventsData?.events?.length ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {t("admin.noEventsFound")}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {systemEventsData.events.map((evt: any) => (
                    <Card key={evt.id}>
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <ScrollText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <Badge variant="outline" data-testid={`badge-sys-event-type-${evt.id}`}>
                              {evt.eventType.replace(/_/g, " ")}
                            </Badge>
                            {evt.actorId && (
                              <span className="text-sm text-muted-foreground" data-testid={`text-sys-event-actor-${evt.id}`}>
                                {t("admin.actor")}: {evt.actorId.substring(0, 12)}...
                              </span>
                            )}
                            {evt.metadata && (
                              <span className="text-xs text-muted-foreground" data-testid={`text-sys-event-meta-${evt.id}`}>
                                {JSON.stringify(evt.metadata).substring(0, 80)}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap" data-testid={`text-sys-event-time-${evt.id}`}>
                            {evt.createdAt ? format(new Date(evt.createdAt), "MMM d, yyyy HH:mm:ss") : ""}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={eventsPage === 0}
                      onClick={() => setEventsPage(p => Math.max(0, p - 1))}
                      data-testid="button-events-prev"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      {t("admin.previous")}
                    </Button>
                    <span className="text-sm text-muted-foreground" data-testid="text-events-page">
                      {t("admin.page")} {eventsPage + 1} {t("admin.of")} {Math.max(1, Math.ceil((systemEventsData?.total ?? 0) / eventsPerPage))}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={(eventsPage + 1) * eventsPerPage >= (systemEventsData?.total ?? 0)}
                      onClick={() => setEventsPage(p => p + 1)}
                      data-testid="button-events-next"
                    >
                      {t("admin.next")}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            {loadingHealth ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !healthData ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t("admin.unableToLoadHealth")}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
                      <CardTitle className="text-sm font-medium">{t("admin.database")}</CardTitle>
                      <Database className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${healthData.database?.status === "ok" ? "bg-green-500" : "bg-red-500"}`}
                          data-testid="status-database"
                        />
                        <span className="text-lg font-semibold" data-testid="text-db-status">
                          {healthData.database?.status === "ok" ? t("admin.connected") : t("admin.error")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1" data-testid="text-db-latency">
                        {t("admin.latency")}: {healthData.database?.latencyMs ?? 0}ms
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
                      <CardTitle className="text-sm font-medium">{t("admin.api")}</CardTitle>
                      <Server className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${healthData.status === "healthy" ? "bg-green-500" : "bg-yellow-500"}`}
                          data-testid="status-api"
                        />
                        <span className="text-lg font-semibold" data-testid="text-api-status">
                          {healthData.status === "healthy" ? t("admin.healthy") : t("admin.degraded")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1" data-testid="text-api-response">
                        {t("admin.responseTime")}: {healthData.api?.responseTimeMs ?? 0}ms
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
                      <CardTitle className="text-sm font-medium">{t("admin.activeUsers")}</CardTitle>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-active-users">
                        {healthData.activeUsers24h ?? 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
                      <CardTitle className="text-sm font-medium">{t("admin.uptime")}</CardTitle>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-uptime">
                        {healthData.api?.uptimeFormatted ?? "N/A"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-1">
                    <CardTitle className="text-base font-semibold">{t("admin.emailQueue")}</CardTitle>
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" data-testid="badge-email-pending">
                          {t("admin.pending")}: {healthData.emailQueue?.pending ?? 0}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={healthData.emailQueue?.failed > 0 ? "destructive" : "secondary"} data-testid="badge-email-failed">
                          {t("admin.failed")}: {healthData.emailQueue?.failed ?? 0}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-1">
                    <CardTitle className="text-base font-semibold">{t("admin.recentEvents")}</CardTitle>
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3" data-testid="text-event-count">
                      {healthData.recentSystemEventCount ?? 0} {t("admin.eventsInLast24h")}
                    </p>
                    {healthData.recentSystemEvents && healthData.recentSystemEvents.length > 0 ? (
                      <div className="space-y-3">
                        {healthData.recentSystemEvents.map((evt: any) => (
                          <div key={evt.id} className="flex items-start justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0">
                            <div>
                              <Badge variant="outline" data-testid={`badge-event-type-${evt.id}`}>
                                {evt.eventType}
                              </Badge>
                              {evt.actorId && (
                                <span className="text-sm text-muted-foreground ml-2" data-testid={`text-event-actor-${evt.id}`}>
                                  {t("listing.by")} {evt.actorId}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap" data-testid={`text-event-time-${evt.id}`}>
                              {evt.createdAt ? format(new Date(evt.createdAt), "MMM d, HH:mm") : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("admin.noRecentEvents")}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="suspicious" className="mt-6">
            {loadingFlags ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : suspiciousFlags.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t("admin.noSuspiciousActivity")}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {suspiciousFlags.map((flag: any) => (
                  <Card key={flag.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-destructive/10">
                          <ShieldAlert className="w-5 h-5 text-destructive" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="destructive" data-testid={`badge-flag-type-${flag.id}`}>
                              {flag.flagType === "rapid_joins" ? t("admin.rapidJoins") :
                               flag.flagType === "multiple_reports" ? t("admin.multipleReports") :
                               flag.flagType === "message_spam" ? t("admin.messageSpam") : flag.flagType}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {flag.createdAt ? format(new Date(flag.createdAt), "MMM d, yyyy HH:mm") : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={flag.user?.profileImageUrl || undefined} />
                              <AvatarFallback>{flag.user?.firstName?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm" data-testid={`text-flag-user-${flag.id}`}>
                              {flag.user ? `${flag.user.firstName || ""} ${flag.user.lastName || ""}`.trim() || flag.userId : flag.userId}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground" data-testid={`text-flag-details-${flag.id}`}>{flag.details}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dismissFlagMutation.mutate(flag.id)}
                            disabled={dismissFlagMutation.isPending || banUserMutation.isPending}
                            data-testid={`button-dismiss-flag-${flag.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t("admin.dismiss")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => banUserMutation.mutate(flag.id)}
                            disabled={dismissFlagMutation.isPending || banUserMutation.isPending}
                            data-testid={`button-ban-user-${flag.id}`}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            {t("admin.ban")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="feature-flags" className="mt-6">
            {loadingFeatureFlags ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : featureFlags.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t("admin.noFeatureFlags")}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {featureFlags.map((flag: any) => (
                  <Card key={flag.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium" data-testid={`text-flag-key-${flag.key}`}>{flag.key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-flag-code-${flag.key}`}>{flag.key}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={flag.enabled ? "default" : "secondary"} data-testid={`badge-flag-status-${flag.key}`}>
                            {flag.enabled ? t("admin.enabled") : t("admin.disabled")}
                          </Badge>
                          <Switch
                            checked={flag.enabled}
                            onCheckedChange={(checked) =>
                              toggleFeatureFlagMutation.mutate({ key: flag.key, enabled: checked })
                            }
                            disabled={toggleFeatureFlagMutation.isPending}
                            data-testid={`switch-flag-${flag.key}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit-history" className="mt-6">
            <EditHistoryTab />
          </TabsContent>

          {/* ── Users Tab ─────────────────────────────────────────────────── */}
          <TabsContent value="users" className="mt-6 space-y-4">
            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder={t("admin.searchUsers")}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  data-testid="input-user-search"
                />
              </div>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-36" data-testid="select-user-type-filter">
                  <SelectValue placeholder={t("admin.typeFilter")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.allTypes")}</SelectItem>
                  <SelectItem value="individual">{t("profile.individual")}</SelectItem>
                  <SelectItem value="vendor">{t("profile.vendor")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-user-status-filter">
                  <SelectValue placeholder={t("admin.statusFilter")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.allStatuses")}</SelectItem>
                  <SelectItem value="verified">{t("profile.verified")}</SelectItem>
                  <SelectItem value="pending">{t("profile.pending")}</SelectItem>
                  <SelectItem value="rejected">{t("profile.rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loadingAllUsers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (() => {
              const q = userSearch.toLowerCase();
              const filtered = allUsers.filter((u: any) => {
                const matchesSearch = !q || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q);
                const matchesType = userTypeFilter === "all" || u.userType === userTypeFilter;
                const matchesStatus = userStatusFilter === "all" || u.verificationStatus === userStatusFilter;
                return matchesSearch && matchesType && matchesStatus;
              });

              if (filtered.length === 0) return (
                <Card><CardContent className="py-12 text-center text-muted-foreground">{t("admin.noUsersMatch")}</CardContent></Card>
              );

              const UserRoleBadge = ({ u }: { u: any }) => u.isPrimaryOwner ? (
                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs"><Crown className="w-3 h-3 mr-1" />{t("admin.roleOwner")}</Badge>
              ) : u.role === "admin" ? (
                <Badge variant="destructive" className="text-xs"><Shield className="w-3 h-3 mr-1" />{t("admin.roleAdmin")}</Badge>
              ) : u.role === "moderator" ? (
                <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30 text-xs">{t("admin.roleModerator")}</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">{t("admin.roleUser")}</Badge>
              );

              const UserActions = ({ u }: { u: any }) => u.isPrimaryOwner ? (
                <span className="text-xs text-muted-foreground italic">{t("admin.primaryOwnerLabel")}</span>
              ) : (
                <div className="flex items-center gap-1 flex-wrap">
                  {!u.isAdmin ? (
                    <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950" disabled={changeRoleMutation.isPending} onClick={() => changeRoleMutation.mutate({ userId: u.id, role: "admin" })} data-testid={`button-make-admin-${u.id}`}>
                      <Shield className="w-3 h-3 mr-1" />{t("admin.makeAdmin")}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" disabled={changeRoleMutation.isPending} onClick={() => changeRoleMutation.mutate({ userId: u.id, role: "user" })} data-testid={`button-remove-admin-${u.id}`}>
                      <ShieldOff className="w-3 h-3 mr-1" />{t("admin.removeAdmin")}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setActivityUserId(u.id)} data-testid={`button-activity-${u.id}`}>
                    <Eye className="w-3 h-3 mr-1" />{t("admin.viewActivity")}
                  </Button>
                  <Button size="sm" variant="outline" className={`h-7 text-xs ${u.isDisabled ? "text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950" : "text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950"}`} disabled={disableUserMutation.isPending} onClick={() => disableUserMutation.mutate(u.id)} data-testid={`button-ban-${u.id}`}>
                    <Ban className="w-3 h-3 mr-1" />{u.isDisabled ? t("admin.unbanUser") : t("admin.banUser")}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950" disabled={resetUserMutation.isPending} onClick={() => resetUserMutation.mutate(u.id)} data-testid={`button-reset-${u.id}`}>
                    <RotateCcw className="w-3 h-3 mr-1" />{t("admin.resetUser")}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setDeleteUserId(u.id)} data-testid={`button-delete-${u.id}`}>
                    <Trash2 className="w-3 h-3 mr-1" />{t("admin.deleteUser")}
                  </Button>
                </div>
              );

              return (
                <>
                  <div className="px-1 py-1 text-xs text-muted-foreground">
                    {t("admin.showingUsers", { filtered: filtered.length, total: allUsers.length })}
                  </div>

                  {/* Mobile: card layout */}
                  <div className="md:hidden space-y-3">
                    {filtered.map((u: any) => (
                      <Card key={u.id} data-testid={`row-user-${u.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="w-10 h-10 shrink-0">
                              <AvatarImage src={u.profileImageUrl || undefined} />
                              <AvatarFallback className="text-sm">{u.firstName?.[0]}{u.lastName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-sm" data-testid={`text-user-name-${u.id}`}>
                                  {u.firstName} {u.lastName}
                                  {u.isPrimaryOwner && <Crown className="inline ml-1 w-3 h-3 text-amber-500" />}
                                </span>
                                {u.isDisabled && <Badge className="text-[10px] py-0 bg-gray-500">{t("admin.banned")}</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5" data-testid={`text-user-email-${u.id}`}>{u.email || "—"}</p>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <UserRoleBadge u={u} />
                                <Badge variant={u.verificationStatus === "verified" ? "default" : u.verificationStatus === "rejected" ? "destructive" : "secondary"} className="text-xs" data-testid={`badge-user-status-${u.id}`}>
                                  {u.verificationStatus}
                                </Badge>
                                <span className="text-xs text-muted-foreground" data-testid={`text-user-joined-${u.id}`}>
                                  {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-border/50">
                            <UserActions u={u} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop: table layout */}
                  <div className="hidden md:block overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium">{t("admin.userColumn")}</th>
                          <th className="text-left px-4 py-3 font-medium">{t("admin.emailColumn")}</th>
                          <th className="text-left px-4 py-3 font-medium">{t("admin.roleColumn")}</th>
                          <th className="text-left px-4 py-3 font-medium">{t("admin.statusColumn")}</th>
                          <th className="text-left px-4 py-3 font-medium">{t("admin.joinedColumn")}</th>
                          <th className="text-left px-4 py-3 font-medium">{t("admin.actionsColumn")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filtered.map((u: any) => (
                          <tr key={u.id} className="hover:bg-muted/30" data-testid={`row-user-${u.id}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-7 h-7">
                                  <AvatarImage src={u.profileImageUrl || undefined} />
                                  <AvatarFallback className="text-xs">{u.firstName?.[0]}{u.lastName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-medium" data-testid={`text-user-name-${u.id}`}>
                                    {u.firstName} {u.lastName}
                                    {u.isPrimaryOwner && <Crown className="inline ml-1 w-3 h-3 text-amber-500" aria-label={t("admin.primaryOwner")} />}
                                  </span>
                                  {u.isDisabled && <Badge className="text-xs py-0 w-fit bg-gray-500">{t("admin.banned")}</Badge>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs" data-testid={`text-user-email-${u.id}`}>{u.email || "—"}</td>
                            <td className="px-4 py-3" data-testid={`badge-user-role-${u.id}`}><UserRoleBadge u={u} /></td>
                            <td className="px-4 py-3">
                              <Badge variant={u.verificationStatus === "verified" ? "default" : u.verificationStatus === "rejected" ? "destructive" : "secondary"} data-testid={`badge-user-status-${u.id}`}>
                                {u.verificationStatus}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs" data-testid={`text-user-joined-${u.id}`}>
                              {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—"}
                            </td>
                            <td className="px-4 py-3"><UserActions u={u} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </TabsContent>

          {/* ── Orders Tab ────────────────────────────────────────────────── */}
          <TabsContent value="orders" className="mt-6">
            {loadingOrders ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">{t("admin.noParticipations")}</CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <Card key={order.id} data-testid={`card-order-${order.id}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 shrink-0">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium" data-testid={`text-order-listing-${order.id}`}>
                              {order.listing?.title || `Listing #${order.listingId}`}
                            </p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-order-user-${order.id}`}>
                              {t("admin.userLabel")} {order.user ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() || order.userId : order.userId}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" data-testid={`badge-order-role-${order.id}`}>{order.role}</Badge>
                              <span className="text-xs text-muted-foreground" data-testid={`text-order-date-${order.id}`}>
                                {order.joinedAt ? format(new Date(order.joinedAt), "MMM d, yyyy HH:mm") : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200"
                            onClick={() => approveOrderMutation.mutate(order.id)}
                            disabled={approveOrderMutation.isPending || rejectOrderMutation.isPending}
                            data-testid={`button-approve-order-${order.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t("admin.approveBtn")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/20"
                            onClick={() => rejectOrderMutation.mutate(order.id)}
                            disabled={approveOrderMutation.isPending || rejectOrderMutation.isPending}
                            data-testid={`button-reject-order-${order.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {t("admin.rejectBtn")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── AI Analytics Tab ──────────────────────────────────────────── */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" /> {t("admin.totalUsersAnalytics")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" data-testid="text-analytics-users">{allUsers.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {allUsers.filter((u: any) => u.verificationStatus === "verified").length} {t("admin.verified")}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground" /> {t("admin.ordersTab")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" data-testid="text-analytics-orders">{orders.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("admin.activeListings")}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground" /> {t("admin.openReports")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" data-testid="text-analytics-issues">{(reports as any[]).length + (suspiciousFlags as any[]).length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(reports as any[]).length} {t("admin.reports")}, {(suspiciousFlags as any[]).length} {t("admin.flagged")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      {t("admin.aiAnalytics")}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("admin.analysisDesc")}
                    </p>
                  </div>
                  <Button
                    onClick={handleAnalyzePlatform}
                    disabled={analyzingPlatform}
                    data-testid="button-analyze-platform"
                  >
                    {analyzingPlatform ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("admin.analyzing")}</>
                    ) : (
                      <><Brain className="w-4 h-4 mr-2" /> {t("admin.analyze")}</>
                    )}
                  </Button>
                </CardHeader>
                {aiAnalysis && (
                  <CardContent>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" data-testid="badge-ai-model">{aiAnalysis.model}</Badge>
                        <span className="text-xs text-muted-foreground">{t("admin.aiAnalytics")}</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans" data-testid="text-ai-analysis">
                        {aiAnalysis.analysis}
                      </pre>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            {loadingSettings ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Branding */}
                <Card data-testid="card-branding-settings">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Palette className="w-4 h-4 text-primary" />
                      {t("admin.brandingSettings")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">{t("admin.siteName")}</label>
                      <Input
                        data-testid="input-site-name"
                        value={settingsForm.siteName ?? ""}
                        onChange={(e) => setSettingsForm(f => ({ ...f, siteName: e.target.value }))}
                        placeholder="Grouperry"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">{t("admin.currency")}</label>
                      <Input
                        data-testid="input-currency"
                        value={settingsForm.currency ?? ""}
                        onChange={(e) => setSettingsForm(f => ({ ...f, currency: e.target.value }))}
                        placeholder="USD"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* System */}
                <Card data-testid="card-system-settings">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sliders className="w-4 h-4 text-primary" />
                      {t("admin.systemSettings")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">{t("admin.commissionPct")}</label>
                      <Input
                        data-testid="input-commission-pct"
                        type="number"
                        min="0"
                        max="100"
                        value={settingsForm.commissionPct ?? ""}
                        onChange={(e) => setSettingsForm(f => ({ ...f, commissionPct: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">{t("admin.defaultExpiry")}</label>
                      <Input
                        data-testid="input-default-expiry"
                        type="number"
                        min="1"
                        value={settingsForm.defaultExpiry ?? ""}
                        onChange={(e) => setSettingsForm(f => ({ ...f, defaultExpiry: e.target.value }))}
                        placeholder="7"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">{t("admin.maxUsersPerListing")}</label>
                      <Input
                        data-testid="input-max-users"
                        type="number"
                        min="1"
                        value={settingsForm.maxUsersPerListing ?? ""}
                        onChange={(e) => setSettingsForm(f => ({ ...f, maxUsersPerListing: e.target.value }))}
                        placeholder="100"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    data-testid="button-save-settings"
                    disabled={saveSettingsMutation.isPending}
                    onClick={() => saveSettingsMutation.mutate(settingsForm)}
                  >
                    {saveSettingsMutation.isPending
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("common.loading")}</>
                      : <><Settings className="w-4 h-4 mr-2" />{t("common.save")}</>
                    }
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Activity Modal */}
      <Dialog open={!!activityUserId} onOpenChange={(open) => { if (!open) setActivityUserId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("admin.activityTitle")}</DialogTitle>
          </DialogHeader>
          {loadingActivity ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !activityData ? null : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">{t("admin.listingsCreated")}</p>
                {activityData.listingsCreated?.length > 0 ? (
                  <div className="space-y-1">
                    {activityData.listingsCreated.map((l: any) => (
                      <div key={l.id} className="text-sm text-muted-foreground flex items-center justify-between border rounded px-3 py-1.5">
                        <span className="truncate">{l.title}</span>
                        <Badge variant="secondary" className="ml-2 shrink-0">{l.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("admin.noActivity")}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">{t("admin.groupsJoined")}</p>
                {activityData.groupsJoined?.length > 0 ? (
                  <div className="space-y-1">
                    {activityData.groupsJoined.map((g: any) => (
                      <div key={g.id} className="text-sm text-muted-foreground flex items-center justify-between border rounded px-3 py-1.5">
                        <span className="truncate">{g.listing?.title || `#${g.listingId}`}</span>
                        <Badge variant="secondary" className="ml-2 shrink-0">{g.role}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("admin.noActivity")}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteUserId} onOpenChange={(open) => { if (!open) setDeleteUserId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.confirmDelete")}</DialogTitle>
            <DialogDescription>{t("admin.confirmDeleteDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteUserId(null)} data-testid="button-cancel-delete">
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteUserMutation.isPending}
              onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
              data-testid="button-confirm-delete"
            >
              {deleteUserMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {t("admin.confirmDeleteBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function EditHistoryTab() {
  const { t } = useTranslation();
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["/api/admin/listing-history"],
    queryFn: async () => {
      const res = await fetch("/api/admin/listing-history?limit=50", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch listing history");
      return res.json();
    },
  });

  const formatFieldName = (field: string) => {
    const names: Record<string, string> = {
      title: t("admin.fieldTitle"),
      description: t("admin.fieldDescription"),
      expiresAt: t("admin.fieldExpiryDate"),
      status: t("admin.fieldStatus"),
      totalSlots: t("admin.fieldTotalSlots"),
      location: t("admin.fieldLocation"),
      imageUrl: t("admin.fieldImage"),
    };
    return names[field] || field;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
          {t("admin.noEditHistoryRecorded")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="admin-edit-history-list">
      {history.map((entry: any) => (
        <Card key={entry.id} data-testid={`admin-edit-history-entry-${entry.id}`}>
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline">
                    {t("admin.listingId")} #{entry.listingId}
                  </Badge>
                  {entry.listing?.title && (
                    <span className="text-sm font-medium">{entry.listing.title}</span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(entry.createdAt), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("admin.editedBy")}: {entry.editor?.firstName} {entry.editor?.lastName || ""} ({entry.editorId})
                </p>
                <div className="space-y-1">
                  {Object.entries(entry.changes as Record<string, { old: any; new: any }>).map(([field, change]) => (
                    <div key={field} className="text-sm flex flex-wrap items-center gap-2">
                      <span className="font-medium">{formatFieldName(field)}:</span>
                      <span className="text-muted-foreground line-through">
                        {change.old !== null && change.old !== undefined ? String(change.old).substring(0, 60) : "—"}
                      </span>
                      <span className="text-muted-foreground">&rarr;</span>
                      <span>
                        {change.new !== null && change.new !== undefined ? String(change.new).substring(0, 60) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
