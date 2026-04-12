"use client";

import { Users, UsersRound, TrendingUp, CheckCircle2 } from "lucide-react";

interface OrganizerStatsProps {
  totalGroups: number;
  totalMembers: number;
  fillRate: number;
  completedCount: number;
}

export function OrganizerStats({
  totalGroups,
  totalMembers,
  fillRate,
  completedCount,
}: OrganizerStatsProps) {
  const stats = [
    {
      label: "Total Groups",
      value: totalGroups,
      icon: <Users className="size-4" />,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Members",
      value: totalMembers,
      icon: <UsersRound className="size-4" />,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Fill Rate",
      value: `${fillRate}%`,
      icon: <TrendingUp className="size-4" />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: <CheckCircle2 className="size-4" />,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border rounded-xl p-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-accent/20"
        >
          <div
            className={`size-10 rounded-lg ${stat.bgColor} ${stat.color} flex items-center justify-center mb-2`}
          >
            {stat.icon}
          </div>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
