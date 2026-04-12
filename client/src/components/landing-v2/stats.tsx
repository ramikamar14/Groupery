"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Users, ShoppingBag, TrendingUp, Globe, Sparkles, type LucideIcon } from "lucide-react";

interface LandingV2StatsProps {
  activeListings?: number | null;
  totalMembers?: number | null;
}

export function Stats({ activeListings, totalMembers }: LandingV2StatsProps) {
  const { t } = useTranslation();

  const groupsDisplay =
    activeListings != null && activeListings > 0
      ? activeListings.toLocaleString() + "+"
      : t("v2.statFallbackGroups");

  const membersDisplay =
    totalMembers != null && totalMembers > 0
      ? totalMembers >= 1000
        ? `${Math.round(totalMembers / 1000)}K`
        : `${totalMembers}+`
      : t("v2.statFallbackMembers");

  const stats: {
    icon: LucideIcon;
    value: string;
    label: string;
    color: string;
    bgColor: string;
    iconColor: string;
  }[] = [
    {
      icon: ShoppingBag,
      value: groupsDisplay,
      label: t("landing.statsGroups"),
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-100 dark:bg-violet-950/50",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      icon: Users,
      value: membersDisplay,
      label: t("landing.statsMembers"),
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-100 dark:bg-blue-950/50",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: TrendingUp,
      value: t("v2.statSavedValue"),
      label: t("landing.statsSaved"),
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-100 dark:bg-emerald-950/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Globe,
      value: t("v2.statFallbackCountries"),
      label: t("landing.statsCountries"),
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-100 dark:bg-orange-950/50",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase flex items-center justify-center gap-2">
            <Sparkles className="size-4" />
            {t("v2.statsTagline")}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative"
              data-testid={`stat-${index}`}
            >
              <div className="relative bg-card rounded-3xl p-6 lg:p-8 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}
                />

                <div
                  className={`${stat.bgColor} size-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className={`size-7 ${stat.iconColor}`} />
                </div>

                <div className="text-3xl lg:text-4xl font-bold font-display mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {stat.value}
                </div>

                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>

                <div className={`absolute top-4 right-4 size-2 rounded-full bg-gradient-to-r ${stat.color} opacity-50`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
