"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GroupCard, type GroupData, type GroupStatus } from "@/components/group-card";
import { StatusPills } from "@/components/status-pills";
import { EmptyState } from "@/components/empty-state";
import { OrganizerStats } from "@/components/organizer-stats";
import Link from "next/link";
import {
  Plus,
  Users,
  Crown,
  UserCheck,
  ShoppingBag,
} from "lucide-react";

// Mock data for demonstration
const mockGroups: GroupData[] = [
  {
    id: "1",
    title: "Apple AirPods Pro (2nd Gen) with MagSafe",
    image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600&h=450&fit=crop",
    currentMembers: 8,
    targetMembers: 10,
    status: "active",
    role: "creator",
    price: 189,
    originalPrice: 249,
    expiresAt: "3 days",
    isFull: false,
  },
  {
    id: "2",
    title: "Sony WH-1000XM5 Wireless Headphones",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=450&fit=crop",
    currentMembers: 15,
    targetMembers: 15,
    status: "active",
    role: "creator",
    price: 298,
    originalPrice: 399,
    expiresAt: "1 day",
    isFull: true,
  },
  {
    id: "3",
    title: "Dyson V15 Detect Cordless Vacuum",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&h=450&fit=crop",
    currentMembers: 5,
    targetMembers: 8,
    status: "active",
    role: "member",
    price: 549,
    originalPrice: 749,
    expiresAt: "5 days",
    hasPaymentMethod: true,
  },
  {
    id: "4",
    title: "Nintendo Switch OLED Console Bundle",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=450&fit=crop",
    currentMembers: 12,
    targetMembers: 12,
    status: "completed",
    role: "member",
    price: 299,
    originalPrice: 349,
  },
  {
    id: "5",
    title: "Bose QuietComfort Ultra Earbuds",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=450&fit=crop",
    currentMembers: 3,
    targetMembers: 10,
    status: "expired",
    role: "creator",
    price: 249,
    originalPrice: 299,
  },
  {
    id: "6",
    title: "Samsung 55\" OLED 4K Smart TV",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=450&fit=crop",
    currentMembers: 20,
    targetMembers: 20,
    status: "completed",
    role: "creator",
    price: 1099,
    originalPrice: 1499,
  },
  {
    id: "7",
    title: "KitchenAid Artisan Stand Mixer",
    image: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=600&h=450&fit=crop",
    currentMembers: 6,
    targetMembers: 8,
    status: "active",
    role: "member",
    price: 329,
    originalPrice: 449,
    expiresAt: "2 days",
  },
];

// Current user ID (mock)
const currentUserId = "user-1";

export default function MyGroupsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | GroupStatus>("all");
  const [activeTab, setActiveTab] = useState<"all" | "created" | "joined">("all");

  // Filter groups by creator/member
  const createdGroups = mockGroups.filter((g) => g.role === "creator");
  const joinedGroups = mockGroups.filter((g) => g.role === "member");

  // Calculate counts for each tab
  const tabCounts = {
    all: mockGroups.length,
    created: createdGroups.length,
    joined: joinedGroups.length,
  };

  // Get groups based on active tab
  const tabGroups = useMemo(() => {
    switch (activeTab) {
      case "created":
        return createdGroups;
      case "joined":
        return joinedGroups;
      default:
        return mockGroups;
    }
  }, [activeTab]);

  // Calculate status counts for current tab
  const statusCounts = useMemo(() => {
    return {
      all: tabGroups.length,
      active: tabGroups.filter((g) => g.status === "active").length,
      completed: tabGroups.filter((g) => g.status === "completed").length,
      expired: tabGroups.filter((g) => g.status === "expired").length,
    };
  }, [tabGroups]);

  // Filter by status
  const filteredGroups = useMemo(() => {
    if (statusFilter === "all") return tabGroups;
    return tabGroups.filter((g) => g.status === statusFilter);
  }, [tabGroups, statusFilter]);

  // Calculate organizer stats
  const organizerStats = useMemo(() => {
    const totalMembers = createdGroups.reduce(
      (sum, g) => sum + g.currentMembers,
      0
    );
    const totalTarget = createdGroups.reduce(
      (sum, g) => sum + g.targetMembers,
      0
    );
    const fillRate = totalTarget > 0 ? Math.round((totalMembers / totalTarget) * 100) : 0;
    const completedCount = createdGroups.filter(
      (g) => g.status === "completed"
    ).length;

    return {
      totalGroups: createdGroups.length,
      totalMembers,
      fillRate,
      completedCount,
    };
  }, []);

  // Reset status filter when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "created" | "joined");
    setStatusFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-accent flex items-center justify-center">
              <ShoppingBag className="size-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Grouperry</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/browse">Browse</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/create">
                <Plus className="size-4" />
                Create
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Groups</h1>
            <p className="text-muted-foreground mt-1">
              Managing {mockGroups.length} groups · {createdGroups.length} created · {joinedGroups.length} joined
            </p>
          </div>
          <Button asChild className="sm:self-start">
            <Link href="/create">
              <Plus className="size-4" />
              Create New
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 h-11">
            <TabsTrigger value="all" className="gap-2 px-4">
              <Users className="size-4" />
              All
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                {tabCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="created" className="gap-2 px-4">
              <Crown className="size-4" />
              Organised
              <Badge className="ml-1 px-1.5 py-0 text-[10px] bg-amber-500/20 text-amber-500 border-amber-500/30">
                {tabCounts.created}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="joined" className="gap-2 px-4">
              <UserCheck className="size-4" />
              Joined
              <Badge className="ml-1 px-1.5 py-0 text-[10px] bg-sky-500/20 text-sky-500 border-sky-500/30">
                {tabCounts.joined}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* All Tab */}
          <TabsContent value="all" className="space-y-6">
            <StatusPills
              value={statusFilter}
              onChange={setStatusFilter}
              counts={statusCounts}
            />
            {filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <EmptyState tab="all" status={statusFilter} />
            )}
          </TabsContent>

          {/* Organised Tab */}
          <TabsContent value="created" className="space-y-6">
            {/* Organizer Analytics */}
            {createdGroups.length > 0 && (
              <OrganizerStats {...organizerStats} />
            )}

            <StatusPills
              value={statusFilter}
              onChange={setStatusFilter}
              counts={statusCounts}
            />

            {filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <EmptyState tab="created" status={statusFilter} />
            )}
          </TabsContent>

          {/* Joined Tab */}
          <TabsContent value="joined" className="space-y-6">
            <StatusPills
              value={statusFilter}
              onChange={setStatusFilter}
              counts={statusCounts}
            />
            {filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <EmptyState tab="joined" status={statusFilter} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
