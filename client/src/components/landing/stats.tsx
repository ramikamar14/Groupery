import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, TrendingUp, Banknote, Globe, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface LandingStatsProps {
  activeListings?: number | null;
  totalMembers?: number | null;
}

interface StatItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

const statsPrimaryCta =
  "landing-touch-target landing-btn-motion w-full gap-2 rounded-md bg-primary-foreground px-6 text-base font-semibold text-primary shadow-md hover:bg-primary-foreground/95 hover:shadow-lg active:scale-[0.99] sm:w-auto sm:min-w-[12rem]";

export function LandingStats({ activeListings, totalMembers }: LandingStatsProps) {
  const { t } = useTranslation();

  const stats: StatItem[] = [
    {
      value:
        activeListings != null && activeListings > 0
          ? String(activeListings)
          : t("landing.statsValueGrowing"),
      label: t("landing.statsGroups"),
      icon: Users,
    },
    {
      value:
        totalMembers != null && totalMembers > 0
          ? `${totalMembers.toLocaleString()}+`
          : t("landing.statsValueEarlyAccess"),
      label: t("landing.statsMembers"),
      icon: TrendingUp,
    },
    { value: "30%", label: t("landing.statsSaved"), icon: Banknote },
    {
      value: t("landing.statsValueGlobal"),
      label: t("landing.statsCountries"),
      icon: Globe,
    },
  ];

  return (
    <section
      className="landing-section border-y border-border/25 bg-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
      aria-label={t("landing.statsSectionLabel")}
    >
      <div className="landing-container">
        <motion.div
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 lg:grid-cols-4 lg:gap-y-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex min-w-0 flex-col items-center gap-2.5 text-center sm:gap-3"
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              data-testid={`stat-${i}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                <stat.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="break-words text-2xl font-semibold tabular-nums tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
                {stat.value}
              </div>
              <div className="text-pretty px-0.5 text-xs font-medium leading-snug text-primary-foreground/80 sm:text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 border-t border-primary-foreground/15 pt-8 text-center sm:mt-12 sm:gap-5 sm:pt-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
          transition={{ duration: 0.45 }}
        >
          <p className="max-w-md text-pretty text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
            {t("landing.statsCtaLine")}
          </p>
          <Button asChild className={statsPrimaryCta} data-testid="button-stats-cta">
            <a href="/api/login">
              {t("landing.getStarted")}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
