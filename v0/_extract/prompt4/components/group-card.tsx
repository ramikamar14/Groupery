"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Crown,
  UserCheck,
  CreditCard,
  Share2,
  Package,
  Star,
  Clock,
  Users,
} from "lucide-react";

export type GroupStatus = "active" | "completed" | "expired";
export type GroupRole = "creator" | "member";

export interface GroupData {
  id: string;
  title: string;
  image: string;
  currentMembers: number;
  targetMembers: number;
  status: GroupStatus;
  role: GroupRole;
  price: number;
  originalPrice: number;
  expiresAt?: string;
  hasPaymentMethod?: boolean;
  isFull?: boolean;
}

interface GroupCardProps {
  group: GroupData;
}

function getNextAction(group: GroupData): {
  label: string;
  icon: React.ReactNode;
  className: string;
} | null {
  const { role, status, isFull, hasPaymentMethod } = group;

  if (role === "creator") {
    if (status === "active" && isFull) {
      return {
        label: "Collect Payments",
        icon: <CreditCard className="size-3" />,
        className: "bg-emerald-500/90 text-white border-emerald-400/50",
      };
    }
    if (status === "active" && !isFull) {
      return {
        label: "Share to Fill",
        icon: <Share2 className="size-3" />,
        className: "bg-sky-500/90 text-white border-sky-400/50",
      };
    }
    if (status === "completed") {
      return {
        label: "Mark Deliveries",
        icon: <Package className="size-3" />,
        className: "bg-teal-500/90 text-white border-teal-400/50",
      };
    }
  }

  if (role === "member") {
    if (status === "active" && hasPaymentMethod) {
      return {
        label: "Send Payment",
        icon: <CreditCard className="size-3" />,
        className: "bg-emerald-500/90 text-white border-emerald-400/50",
      };
    }
    if (status === "active") {
      return {
        label: "Awaiting Updates",
        icon: <Clock className="size-3" />,
        className: "bg-amber-500/90 text-white border-amber-400/50",
      };
    }
    if (status === "completed") {
      return {
        label: "Leave Review",
        icon: <Star className="size-3" />,
        className: "bg-yellow-500/90 text-white border-yellow-400/50",
      };
    }
  }

  return null;
}

export function GroupCard({ group }: GroupCardProps) {
  const fillPercentage = Math.round(
    (group.currentMembers / group.targetMembers) * 100
  );
  const discount = Math.round(
    ((group.originalPrice - group.price) / group.originalPrice) * 100
  );
  const nextAction = getNextAction(group);

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={group.image}
          alt={group.title}
          className="size-full object-cover transition-transform group-hover:scale-105"
        />

        {/* Role Badge */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <Badge
            className={cn(
              "border backdrop-blur-md shadow-sm",
              group.role === "creator"
                ? "bg-amber-500/90 text-white border-amber-400/50"
                : "bg-sky-500/90 text-white border-sky-400/50"
            )}
          >
            {group.role === "creator" ? (
              <>
                <Crown className="size-3" />
                Organiser
              </>
            ) : (
              <>
                <UserCheck className="size-3" />
                Member
              </>
            )}
          </Badge>

          {/* Next Action Badge */}
          {nextAction && (
            <Badge className={cn("border backdrop-blur-md shadow-sm", nextAction.className)}>
              {nextAction.icon}
              {nextAction.label}
            </Badge>
          )}
        </div>

        {/* Status Badge */}
        <Badge
          className={cn(
            "absolute right-3 top-3 border backdrop-blur-md",
            group.status === "active" &&
              "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
            group.status === "completed" &&
              "bg-sky-500/20 text-sky-400 border-sky-500/30",
            group.status === "expired" &&
              "bg-muted text-muted-foreground border-border"
          )}
        >
          {group.status === "active" && "Active"}
          {group.status === "completed" && "Completed"}
          {group.status === "expired" && "Expired"}
        </Badge>

        {/* Discount Badge */}
        <div className="absolute bottom-3 right-3">
          <Badge className="bg-accent text-accent-foreground border-accent/50 font-semibold">
            -{discount}%
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-card-foreground line-clamp-1 text-balance">
          {group.title}
        </h3>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="size-3" />
              {group.currentMembers}/{group.targetMembers} members
            </span>
            <span className="font-medium text-accent">{fillPercentage}%</span>
          </div>
          <Progress
            value={fillPercentage}
            className="h-1.5 bg-muted"
          />
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-card-foreground">
              ${group.price}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              ${group.originalPrice}
            </span>
          </div>
          {group.expiresAt && group.status === "active" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {group.expiresAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
