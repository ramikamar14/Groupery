import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Star, Award, Sparkles, UserCheck, Trophy, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Legacy rank system (kept for backward compat) ────────────────────────────
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

// ── Loyalty tier system ───────────────────────────────────────────────────────

export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

export interface LoyaltyInfo {
  tier: LoyaltyTier;
  label: string;
  emoji: string;
  minDeals: number;
  nextTierDeals: number | null;
  gradient: string;
  ring: string;
  text: string;
  perks: string[];
  icon: typeof Trophy;
}

export const LOYALTY_CONFIG: Record<LoyaltyTier, LoyaltyInfo> = {
  bronze: {
    tier: "bronze",
    label: "Bronze",
    emoji: "🥉",
    minDeals: 0,
    nextTierDeals: 5,
    gradient: "from-amber-700 to-amber-500",
    ring: "ring-amber-400/40",
    text: "text-amber-700 dark:text-amber-400",
    perks: ["Early deal notifications", "Community member status"],
    icon: Sparkles,
  },
  silver: {
    tier: "silver",
    label: "Silver",
    emoji: "🥈",
    minDeals: 5,
    nextTierDeals: 15,
    gradient: "from-slate-500 to-slate-400",
    ring: "ring-slate-400/40",
    text: "text-slate-600 dark:text-slate-300",
    perks: ["Priority join queue", "Early deal notifications", "Savings streak badge"],
    icon: Award,
  },
  gold: {
    tier: "gold",
    label: "Gold",
    emoji: "🥇",
    minDeals: 15,
    nextTierDeals: 40,
    gradient: "from-yellow-500 to-amber-400",
    ring: "ring-yellow-400/40",
    text: "text-yellow-700 dark:text-yellow-400",
    perks: ["Featured profile badge", "Priority join queue", "Exclusive Gold deals", "Savings streak badge"],
    icon: Trophy,
  },
  platinum: {
    tier: "platinum",
    label: "Platinum",
    emoji: "💎",
    minDeals: 40,
    nextTierDeals: null,
    gradient: "from-violet-600 to-purple-500",
    ring: "ring-violet-400/40",
    text: "text-violet-700 dark:text-violet-300",
    perks: ["Platinum profile badge", "Featured profile badge", "Priority join queue", "Exclusive Platinum deals", "Dedicated support", "Early beta access"],
    icon: Gem,
  },
};

export function computeLoyaltyTier(completedDeals: number): LoyaltyTier {
  if (completedDeals >= 40) return "platinum";
  if (completedDeals >= 15) return "gold";
  if (completedDeals >= 5) return "silver";
  return "bronze";
}

interface LoyaltyCardProps {
  completedDeals: number;
  totalSavedCents?: number;
  savingsStreakWeeks?: number;
  compact?: boolean;
}

export function LoyaltyCard({ completedDeals, totalSavedCents = 0, savingsStreakWeeks = 0, compact = false }: LoyaltyCardProps) {
  const tier = computeLoyaltyTier(completedDeals);
  const config = LOYALTY_CONFIG[tier];
  const Icon = config.icon;
  const nextConfig = config.nextTierDeals ? LOYALTY_CONFIG[computeLoyaltyTier(config.nextTierDeals)] : null;
  const prevThreshold = config.minDeals;
  const nextThreshold = config.nextTierDeals;
  const progress = nextThreshold
    ? Math.min(100, Math.round(((completedDeals - prevThreshold) / (nextThreshold - prevThreshold)) * 100))
    : 100;
  const totalSaved = (totalSavedCents / 100).toFixed(0);

  if (compact) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1", config.ring, config.text, "bg-white/80 dark:bg-black/20")} data-testid={`loyalty-tier-${tier}`}>
        <span>{config.emoji}</span>
        {config.label}
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl overflow-hidden border", config.ring, "ring-1")} data-testid={`loyalty-card-${tier}`}>
      {/* Header */}
      <div className={cn("bg-gradient-to-r p-4 text-white", config.gradient)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              {config.emoji}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest opacity-80">Grouperry Member</p>
              <p className="text-lg font-bold leading-tight">{config.label}</p>
            </div>
          </div>
          <Icon className="w-8 h-8 opacity-30" />
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-2xl font-black">{completedDeals}</p>
            <p className="text-[10px] opacity-75 uppercase tracking-wide">Deals done</p>
          </div>
          {totalSavedCents > 0 && (
            <div>
              <p className="text-2xl font-black">${totalSaved}</p>
              <p className="text-[10px] opacity-75 uppercase tracking-wide">Total saved</p>
            </div>
          )}
          {savingsStreakWeeks > 0 && (
            <div>
              <p className="text-2xl font-black">{savingsStreakWeeks}w</p>
              <p className="text-[10px] opacity-75 uppercase tracking-wide">Streak 🔥</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress to next tier */}
      <div className="p-4 bg-card space-y-3">
        {nextConfig && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress to {nextConfig.emoji} {nextConfig.label}</span>
              <span className="font-semibold">{completedDeals}/{nextThreshold} deals</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full bg-gradient-to-r transition-all", config.gradient)} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {!nextConfig && (
          <p className="text-xs text-muted-foreground text-center font-medium">🎉 Maximum tier reached!</p>
        )}

        {/* Perks */}
        <div className="space-y-1">
          {config.perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", tier === "platinum" ? "bg-violet-500" : tier === "gold" ? "bg-yellow-500" : tier === "silver" ? "bg-slate-400" : "bg-amber-500")} />
              {perk}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
