"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Package, Plus, Users, Search } from "lucide-react";
import Link from "next/link";
import { GroupStatus } from "./group-card";

type TabType = "all" | "created" | "joined";

interface EmptyStateProps {
  tab: TabType;
  status: "all" | GroupStatus;
}

function getEmptyContent(tab: TabType, status: "all" | GroupStatus) {
  // No groups at all
  if (tab === "all" && status === "all") {
    return {
      icon: <Package className="size-8" />,
      title: "No groups yet",
      description:
        "Start your group buying journey by creating your first deal or joining an existing one.",
      primaryAction: {
        label: "Create Your First Group",
        href: "/create",
        icon: <Plus className="size-4" />,
      },
      secondaryAction: {
        label: "Browse Groups",
        href: "/browse",
        icon: <Search className="size-4" />,
      },
    };
  }

  // Tab-specific empty states
  if (tab === "created") {
    if (status === "all") {
      return {
        icon: <Users className="size-8" />,
        title: "No groups organised yet",
        description:
          "You haven&apos;t created any group deals yet. Start organising and unlock group discounts for your community!",
        primaryAction: {
          label: "Create a Group",
          href: "/create",
          icon: <Plus className="size-4" />,
        },
      };
    }
    if (status === "active") {
      return {
        icon: <Package className="size-8" />,
        title: "No active groups",
        description:
          "You don&apos;t have any active group deals you&apos;re organising. Create one to start gathering members!",
        primaryAction: {
          label: "Create a Group",
          href: "/create",
          icon: <Plus className="size-4" />,
        },
      };
    }
    if (status === "completed") {
      return {
        icon: <Package className="size-8" />,
        title: "No completed groups",
        description:
          "You haven&apos;t completed any group deals yet. Keep organising and your success stories will appear here!",
      };
    }
    if (status === "expired") {
      return {
        icon: <Package className="size-8" />,
        title: "No expired groups",
        description:
          "Great news! None of your organised groups have expired. Keep up the good work!",
      };
    }
  }

  if (tab === "joined") {
    if (status === "all") {
      return {
        icon: <Users className="size-8" />,
        title: "No groups joined yet",
        description:
          "You haven&apos;t joined any group deals yet. Browse available groups and start saving together!",
        primaryAction: {
          label: "Browse Groups",
          href: "/browse",
          icon: <Search className="size-4" />,
        },
      };
    }
    if (status === "active") {
      return {
        icon: <Package className="size-8" />,
        title: "No active groups",
        description:
          "You&apos;re not part of any active group deals. Find one to join and start saving!",
        primaryAction: {
          label: "Browse Groups",
          href: "/browse",
          icon: <Search className="size-4" />,
        },
      };
    }
    if (status === "completed") {
      return {
        icon: <Package className="size-8" />,
        title: "No completed groups",
        description:
          "You haven&apos;t completed any group deals yet. Your purchase history will appear here!",
      };
    }
    if (status === "expired") {
      return {
        icon: <Package className="size-8" />,
        title: "No expired groups",
        description:
          "None of the groups you joined have expired. Nice timing!",
      };
    }
  }

  // Status-specific for "all" tab
  if (status === "active") {
    return {
      icon: <Package className="size-8" />,
      title: "No active groups",
      description:
        "You don&apos;t have any active group deals. Create one or join an existing group!",
      primaryAction: {
        label: "Browse Groups",
        href: "/browse",
        icon: <Search className="size-4" />,
      },
    };
  }
  if (status === "completed") {
    return {
      icon: <Package className="size-8" />,
      title: "No completed groups",
      description:
        "You haven&apos;t completed any group deals yet. Your success stories will appear here!",
    };
  }
  if (status === "expired") {
    return {
      icon: <Package className="size-8" />,
      title: "No expired groups",
      description: "Great! None of your groups have expired.",
    };
  }

  return {
    icon: <Package className="size-8" />,
    title: "No groups found",
    description: "No groups match your current filters.",
  };
}

export function EmptyState({ tab, status }: EmptyStateProps) {
  const content = getEmptyContent(tab, status);

  return (
    <Empty className="border rounded-xl py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">{content.icon}</EmptyMedia>
        <EmptyTitle>{content.title}</EmptyTitle>
        <EmptyDescription>{content.description}</EmptyDescription>
      </EmptyHeader>
      {(content.primaryAction || content.secondaryAction) && (
        <EmptyContent>
          <div className="flex flex-col sm:flex-row gap-3">
            {content.primaryAction && (
              <Button asChild>
                <Link href={content.primaryAction.href}>
                  {content.primaryAction.icon}
                  {content.primaryAction.label}
                </Link>
              </Button>
            )}
            {content.secondaryAction && (
              <Button variant="outline" asChild>
                <Link href={content.secondaryAction.href}>
                  {content.secondaryAction.icon}
                  {content.secondaryAction.label}
                </Link>
              </Button>
            )}
          </div>
        </EmptyContent>
      )}
    </Empty>
  );
}
