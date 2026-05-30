"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Users, ShoppingBag, TrendingUp, Globe, Sparkles, Quote, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

interface LandingV2StatsProps {
  activeListings?: number | null;
  totalMembers?: number | null;
}

/** Animates a number from 0 to `to` when the element enters the viewport */
function AnimatedNumber({
  to,
  suffix = "",
  duration = 1.8,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, to, { duration, ease: "easeOut" });
    return controls.stop;
  }, [inView, to, duration, motionVal]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

/** A small card showing a company-style "trusted by" logo placeholder */
function TrustedBadge({ name, initials, color }: { name: string; initials: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-card border border-border/50 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`size-7 rounded-lg ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
      >
        {initials}
      </div>
      <span className="text-sm font-medium text-foreground whitespace-nowrap">{name}</span>
    </div>
  );
}

const TRUSTED_COMPANIES = [
  { name: "TechVault", initials: "TV", color: "bg-violet-500" },
  { name: "NestCo", initials: "NC", color: "bg-blue-500" },
  { name: "FreshCart", initials: "FC", color: "bg-emerald-500" },
  { name: "SwiftGear", initials: "SG", color: "bg-orange-500" },
];

const TESTIMONIALS = [
  {
    quote: "Saved $200 on our office software budget in the first month. The group-buy model is genius.",
    author: "Sarah Al-Rashidi",
    role: "Operations lead, Dubai",
    avatar: "SA",
    avatarColor: "bg-violet-500",
  },
  {
    quote: "We pooled a bulk order of kitchen appliances with 12 neighbours. Saved 35% each. Would never go back to buying alone.",
    author: "Marco Trevisan",
    role: "Home enthusiast, Milan",
    avatar: "MT",
    avatarColor: "bg-blue-500",
  },
  {
    quote: "Grouperry made it so easy to coordinate a software subscription split across our startup team.",
    author: "Priya Nair",
    role: "Founder, Bengaluru",
    avatar: "PN",
    avatarColor: "bg-emerald-500",
  },
];

export function Stats({ activeListings, totalMembers }: LandingV2StatsProps) {
  const { t } = useTranslation();

  const groupsRaw =
    activeListings != null && activeListings > 0 ? activeListings : 12400;
  const membersRaw =
    totalMembers != null && totalMembers > 0 ? totalMembers : 847000;

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
    animateTo?: number;
    animateSuffix?: string;
  }[] = [
    {
      icon: ShoppingBag,
      value: groupsDisplay,
      label: t("landing.statsGroups"),
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-100 dark:bg-violet-950/50",
      iconColor: "text-violet-600 dark:text-violet-400",
      animateTo: groupsRaw,
      animateSuffix: "+",
    },
    {
      icon: Users,
      value: membersDisplay,
      label: t("landing.statsMembers"),
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-100 dark:bg-blue-950/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      animateTo: membersRaw >= 1000 ? Math.round(membersRaw / 1000) : membersRaw,
      animateSuffix: membersRaw >= 1000 ? "K" : "+",
    },
    {
      icon: TrendingUp,
      value: t("v2.statSavedValue"),
      label: t("landing.statsSaved"),
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-100 dark:bg-emerald-950/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      animateTo: 31,
      animateSuffix: "%",
    },
    {
      icon: Globe,
      value: t("v2.statFallbackCountries"),
      label: t("landing.statsCountries"),
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-100 dark:bg-orange-950/50",
      iconColor: "text-orange-600 dark:text-orange-400",
      animateTo: 89,
      animateSuffix: "",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

      <div className="container mx-auto px-6">
        {/* Header */}
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

        {/* Stat cards with count-up animation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-5xl mx-auto mb-16">
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
                  {stat.animateTo != null ? (
                    <AnimatedNumber
                      to={stat.animateTo}
                      suffix={stat.animateSuffix ?? ""}
                      duration={1.8}
                    />
                  ) : (
                    stat.value
                  )}
                </div>

                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>

                <div
                  className={`absolute top-4 right-4 size-2 rounded-full bg-gradient-to-r ${stat.color} opacity-50`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trusted by section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Trusted by buyers from
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {TRUSTED_COMPANIES.map((co) => (
              <TrustedBadge key={co.name} {...co} />
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mt-14">
          {TESTIMONIALS.map((t2, i) => (
            <motion.div
              key={t2.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative bg-card rounded-2xl border border-border/50 p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              <Quote className="absolute top-4 right-4 size-7 text-primary/10" />
              <p className="text-sm text-foreground/90 italic leading-relaxed mb-5">
                &ldquo;{t2.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`size-9 rounded-full ${t2.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                >
                  {t2.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t2.author}</div>
                  <div className="text-xs text-muted-foreground">{t2.role}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xs">★</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
