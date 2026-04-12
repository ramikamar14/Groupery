import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface LandingHeroProps {
  totalMembers?: number | null;
  activeListings?: number | null;
}

const btnPrimary =
  "landing-touch-target landing-btn-motion h-12 w-full gap-2 rounded-lg bg-accent px-8 text-lg font-bold text-accent-foreground shadow-lg ring-2 ring-accent/30 hover:bg-accent/90 hover:shadow-xl active:scale-[0.99] sm:w-auto sm:min-w-[14rem] sm:px-10";

const btnSecondary =
  "landing-touch-target landing-btn-motion h-11 w-full rounded-md border border-border/80 bg-transparent px-6 text-sm font-medium text-muted-foreground shadow-none hover:border-border hover:bg-muted/60 hover:text-foreground active:scale-[0.99] sm:w-auto";

export function LandingHero({ totalMembers, activeListings }: LandingHeroProps) {
  const { t } = useTranslation();

  const avatars = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  ];

  const showMemberCount = totalMembers != null && totalMembers > 0;

  const socialProof = (
    <div className="flex flex-col items-center gap-4 border-t border-border/60 pt-5 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
      <div className="flex -space-x-2">
        {avatars.map((src) => (
          <div
            key={src}
            className="h-9 w-9 overflow-hidden rounded-full border-2 border-background ring-1 ring-border"
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
      <p className="max-w-sm text-pretty text-center text-sm leading-relaxed text-muted-foreground sm:max-w-none sm:text-left">
        <span className="font-medium text-foreground">
          {showMemberCount
            ? `${totalMembers.toLocaleString()}${t("landing.heroMembersCountSuffix")}`
            : t("landing.heroMembersGrowing")}
        </span>{" "}
        {t("landing.heroMembersSavingTogether")}
      </p>
    </div>
  );

  return (
    <section className="landing-section relative border-b border-border bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="landing-container relative">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <motion.div
            className="flex min-w-0 flex-col space-y-5 text-center sm:space-y-6 lg:space-y-5 lg:text-left"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Badge variant="secondary" className="landing-eyebrow mb-0 border-0 bg-muted/50">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
                {t("landing.heroBadge")}
              </Badge>
            </motion.div>

            <motion.h1
              className="text-balance text-[1.625rem] font-bold leading-[1.2] tracking-tight text-foreground sm:text-4xl sm:leading-tight lg:text-5xl"
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              data-testid="text-hero-title"
            >
              <span className="text-foreground">{t("landing.heroTitle")}</span>{" "}
              <span
                className="bg-gradient-to-r from-accent via-accent to-accent/90 bg-clip-text text-transparent"
                data-testid="text-hero-title-highlight"
              >
                {t("landing.heroTitleHighlight")}
              </span>
            </motion.h1>

            <motion.p
              className="landing-section-intro mx-auto max-w-xl lg:mx-0"
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              data-testid="text-hero-how-it-works"
            >
              {t("landing.heroHowItWorks")}
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex w-full max-w-md flex-col gap-3 pt-1 sm:max-w-none sm:flex-row sm:justify-center lg:max-w-none lg:items-start lg:justify-start"
            >
              <Button asChild className={btnPrimary} data-testid="button-get-started">
                <a href="/api/login">
                  {t("landing.getStarted")}
                  <ArrowRight className="h-5 w-5 shrink-0" />
                </a>
              </Button>
              <Button asChild variant="outline" className={btnSecondary} data-testid="button-learn-more">
                <a href="#how-it-works">{t("landing.heroLearnMore")}</a>
              </Button>
            </motion.div>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-pretty text-center text-xs leading-relaxed text-muted-foreground lg:text-left"
            >
              {t("landing.heroCtaNote")}
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="hidden lg:block">
              {socialProof}
            </motion.div>
          </motion.div>

          <motion.div
            className="min-w-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55 }}
          >
            <div className="relative mx-auto max-w-lg lg:mx-0 lg:max-w-none">
              <div className="landing-card relative aspect-[4/3] gap-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2532&auto=format&fit=crop"
                  alt={t("landing.heroImageAlt")}
                  className="h-full w-full object-cover"
                  data-testid="img-hero"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/45 via-transparent to-transparent" />
              </div>

              <div className="landing-card absolute bottom-3 left-3 right-3 max-w-none sm:bottom-4 sm:left-4 sm:right-4 sm:max-w-sm lg:left-6 lg:right-auto">
                <div className="flex min-w-0 items-start gap-3 p-3 sm:items-center sm:p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-pretty text-sm font-semibold leading-snug text-foreground">
                      {t("landing.heroFloatSaveTitle")}
                    </p>
                    <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                      {t("landing.heroFloatSaveSubtitle")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            {socialProof}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
