import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Star, Award, Sparkles, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type UserRank = "new" | "trusted" | "top-seller" | "verified";

export interface RankInfo {
  rank: UserRank;
  label: string;
  description: string;
  color: string;
  icon: typeof Shield;
}

export const RANK_CONFIG: Record<UserRank, RankInfo> = {
  new: {
    rank: "new",
    label: "New",
    description: "Recently joined. Building reputation.",
    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: Sparkles,
  },
  trusted: {
    rank: "trusted",
    label: "Trusted",
    description: "Completed multiple group buys with positive reviews.",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    icon: UserCheck,
  },
  "top-seller": {
    rank: "top-seller",
    label: "Top Seller",
    description: "High-performing member with excellent ratings and many completions.",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    icon: Award,
  },
  verified: {
    rank: "verified",
    label: "Verified",
    description: "Identity verified. Maximum trust level.",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    icon: Shield,
  },
};

export function computeRank(user: {
  reliabilityScore?: number | null;
  verificationStatus?: string | null;
  completedParticipations?: number | null;
  rating?: number | null;
  ratingCount?: number | null;
  createdAt?: string | Date | null;
}): UserRank {
  const score = user.reliabilityScore ?? 50;
  const verified = user.verificationStatus === "verified";
  const completed = user.completedParticipations ?? 0;
  const avgRating = user.ratingCount && user.ratingCount > 0 ? (user.rating ?? 0) : 0;

  if (verified && score >= 75 && completed >= 5 && avgRating >= 4) return "verified";
  if (score >= 70 && completed >= 3 && avgRating >= 3) return "top-seller";
  if (score >= 55 || completed >= 1) return "trusted";
  return "new";
}

interface RankBadgeProps {
  rank: UserRank;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function RankBadge({ rank, size = "sm", showIcon = true, className }: RankBadgeProps) {
  const config = RANK_CONFIG[rank];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = { sm: "w-3 h-3", md: "w-3.5 h-3.5", lg: "w-4 h-4" };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center rounded-full border font-medium",
            config.color,
            sizeClasses[size],
            className
          )}
          data-testid={`rank-badge-${rank}`}
        >
          {showIcon && <Icon className={iconSizes[size]} />}
          {config.label}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function RankStar({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("w-3.5 h-3.5", i < count ? "fill-current" : "opacity-25")} />
      ))}
    </span>
  );
}
