"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  ShoppingBag,
  ShieldAlert,
  Flag,
  Activity,
  Cpu,
  ToggleLeft,
  History,
  Brain,
  Settings,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { mockPlatformStats } from "@/components/admin/data";
import { VerificationsTab } from "@/components/admin/VerificationsTab";
import { ReportsTab } from "@/components/admin/ReportsTab";
import { FlaggedTab } from "@/components/admin/FlaggedTab";
import { HealthTab } from "@/components/admin/HealthTab";
import { SystemEventsTab } from "@/components/admin/SystemEventsTab";
import { FeatureFlagsTab } from "@/components/admin/FeatureFlagsTab";
import { EditHistoryTab } from "@/components/admin/EditHistoryTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { AnalyticsTab } from "@/components/admin/AnalyticsTab";
import { SettingsTab } from "@/components/admin/SettingsTab";

const stats = mockPlatformStats;

const statCards = [
  {
    title: "Total Users",
    value: stats.totalUsers.toLocaleString(),
    icon: Users,
    accent: false,
  },
  {
    title: "Active Listings",
    value: stats.activeListings,
    icon: ShoppingBag,
    accent: false,
  },
  {
    title: "Pending Verifications",
    value: stats.pendingVerifications,
    icon: AlertTriangle,
    accent: "amber",
  },
  {
    title: "Open Reports",
    value: stats.openReports,
    icon: Flag,
    accent: "red",
  },
];

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-background font-sans">
      {/* Top nav bar */}
      <header className="border-b border-border bg-card sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-semibold text-foreground text-lg">Grouperry</span>
            <span className="text-muted-foreground text-sm hidden sm:inline">/ Admin</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            System Operational
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform management and moderation</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ title, value, icon: Icon, accent }) => (
            <Card
              key={title}
              className={`border transition-shadow hover:shadow-md ${
                accent === "amber"
                  ? "border-amber-200 dark:border-amber-900/50"
                  : accent === "red"
                  ? "border-red-200 dark:border-red-900/50"
                  : "border-border"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon
                  className={`w-5 h-5 ${
                    accent === "amber"
                      ? "text-amber-500"
                      : accent === "red"
                      ? "text-destructive"
                      : "text-accent"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold tabular-nums ${
                    accent === "amber"
                      ? "text-amber-600 dark:text-amber-400"
                      : accent === "red"
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="verifications">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl mb-2">
            <TabsTrigger value="verifications" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-lg">
              <CheckSquare className="w-3.5 h-3.5" /> Verifications
              <span className="ml-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-xs px-1.5 py-0.5 rounded-full font-semibold">3</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-accent rounded-lg">
              <Flag className="w-3.5 h-3.5" /> Reports
              <span className="ml-0.5 bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-xs px-1.5 py-0.5 rounded-full font-semibold">5</span>
            </TabsTrigger>
            <TabsTrigger value="suspicious" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-accent rounded-lg">
              <ShieldAlert className="w-3.5 h-3.5" /> Flagged
              <span className="ml-0.5 bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 text-xs px-1.5 py-0.5 rounded-full font-semibold">2</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-accent rounded-lg">
              <Activity className="w-3.5 h-3.5" /> Health
            </TabsTrigger>
            <TabsTrigger value="system-events" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-accent rounded-lg">
              <Cpu className="w-3.5 h-3.5" /> Events
            </TabsTrigger>
            <TabsTrigger value="feature-flags" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-accent rounded-lg">
              <ToggleLeft className="w-3.5 h-3.5" /> Feature Flags
            </TabsTrigger>
            <TabsTrigger value="edit-history" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-accent rounded-lg">
              <History className="w-3.5 h-3.5" /> Edit History
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-accent rounded-lg">
              <Users className="w-3.5 h-3.5" /> Users
              <span className="ml-0.5 bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full font-semibold">1,247</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-accent rounded-lg">
              <ShoppingBag className="w-3.5 h-3.5" /> Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-accent rounded-lg">
              <Brain className="w-3.5 h-3.5" /> AI Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:text-accent rounded-lg">
              <Settings className="w-3.5 h-3.5" /> Settings
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="verifications"><VerificationsTab /></TabsContent>
            <TabsContent value="reports"><ReportsTab /></TabsContent>
            <TabsContent value="suspicious"><FlaggedTab /></TabsContent>
            <TabsContent value="health"><HealthTab /></TabsContent>
            <TabsContent value="system-events"><SystemEventsTab /></TabsContent>
            <TabsContent value="feature-flags"><FeatureFlagsTab /></TabsContent>
            <TabsContent value="edit-history"><EditHistoryTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="orders"><OrdersTab /></TabsContent>
            <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
            <TabsContent value="settings"><SettingsTab /></TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
