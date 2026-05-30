"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Users, Cpu, Code2, UtensilsCrossed, Ticket, Flower2, Shirt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { DecorativeAvatar } from "@/components/landing-v2/decorative-avatar";
import { type LucideIcon } from "lucide-react";

type CategoryEntry = {
  name: string;
  Icon: LucideIcon;
  emoji: string;
  deals: number;
  members: string;
  gradient: string;
  bgGradient: string;
  iconBg: string;
  iconColor: string;
  size: "large" | "medium";
};

export function Categories() {
  const { t } = useTranslation();

  const categories: CategoryEntry[] = [
    {
      name: t("landing.catElectronics"),
      Icon: Cpu,
      emoji: "🎧",
      deals: 234,
      members: "12.4K",
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-100 to-purple-100 dark:from-violet-950 dark:to-purple-950",
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-600 dark:text-violet-400",
      size: "large",
    },
    {
      name: "Software",
      Icon: Code2,
      emoji: "📺",
      deals: 156,
      members: "15.1K",
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950",
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-600 dark:text-blue-400",
      size: "medium",
    },
    {
      name: t("landing.catFood"),
      Icon: UtensilsCrossed,
      emoji: "🥑",
      deals: 189,
      members: "8.2K",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950",
      iconBg: "bg-green-500/15",
      iconColor: "text-green-600 dark:text-green-400",
      size: "medium",
    },
    {
      name: "Experiences",
      Icon: Ticket,
      emoji: "🎭",
      deals: 95,
      members: "6.3K",
      gradient: "from-sky-500 to-blue-600",
      bgGradient: "from-sky-100 to-blue-100 dark:from-sky-950 dark:to-blue-950",
      iconBg: "bg-sky-500/15",
      iconColor: "text-sky-600 dark:text-sky-400",
      size: "medium",
    },
    {
      name: t("landing.catHome"),
      Icon: Flower2,
      emoji: "🏠",
      deals: 178,
      members: "9.5K",
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-600 dark:text-amber-400",
      size: "large",
    },
    {
      name: t("landing.catFashion"),
      Icon: Shirt,
      emoji: "👗",
      deals: 312,
      members: "22.8K",
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950",
      iconBg: "bg-pink-500/15",
      iconColor: "text-pink-600 dark:text-pink-400",
      size: "medium",
    },
  ];

  return (
    <section id="categories" className="py-24 relative overflow-hidden scroll-mt-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">
            {t("v2.categoriesTagline")}
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground"
            data-testid="text-categories-title"
          >
            {t("v2.categoriesTitle")}
          </h2>
          <p className="mt-4 text-base text-muted-foreground max-w-lg mx-auto">
            Shop categories you already use — at lower prices when the group fills.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 max-w-6xl mx-auto">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`group cursor-pointer ${cat.size === "large" ? "md:col-span-2" : ""}`}
              data-testid={`card-category-${i}`}
            >
              <div
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cat.bgGradient} p-6 h-full min-h-[200px] flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-white/30 dark:border-white/5`}
              >
                {/* Big decorative emoji in background */}
                <div className="absolute -right-4 -bottom-4 text-[110px] opacity-15 group-hover:opacity-25 transition-opacity select-none pointer-events-none">
                  {cat.emoji}
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    {/* Lucide icon in a pill */}
                    <div
                      className={`${cat.iconBg} backdrop-blur-sm rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <cat.Icon className={`size-5 ${cat.iconColor}`} strokeWidth={1.75} />
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 45 }}
                      className={`size-9 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <ArrowUpRight className="size-4" />
                    </motion.div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-1">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("v2.categoryActiveDeals", { count: cat.deals })}
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-2 mt-4 pt-4 border-t border-foreground/10">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="size-6 rounded-full border-2 border-card overflow-hidden">
                        <DecorativeAvatar seed={i * 3 + j} />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="size-3" />
                    {t("v2.categoryMembersLine", { members: cat.members })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            {t("v2.browseAllCategories")}
            <ArrowUpRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
