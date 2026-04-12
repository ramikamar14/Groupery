import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Star,
  Flag,
  MessageCircle,
  Banknote,
  Quote,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface LandingTrustProps {
  activeListings?: number | null;
  totalMembers?: number | null;
}

interface TrustFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export function LandingTrust({ activeListings, totalMembers }: LandingTrustProps) {
  const { t } = useTranslation();

  const trustFeatures: TrustFeature[] = [
    {
      icon: ShieldCheck,
      title: t("landing.trustVerifiedTitle"),
      desc: t("landing.trustVerifiedDesc"),
    },
    {
      icon: Star,
      title: t("landing.trustRatingsTitle"),
      desc: t("landing.trustRatingsDesc"),
    },
    {
      icon: Flag,
      title: t("landing.trustModerationTitle"),
      desc: t("landing.trustModerationDesc"),
    },
    {
      icon: MessageCircle,
      title: t("landing.trustChatTitle"),
      desc: t("landing.trustChatDesc"),
    },
    {
      icon: Banknote,
      title: t("landing.noPayments"),
      desc: t("landing.noPaymentsDesc"),
    },
  ];

  const testimonials: Testimonial[] = [
    {
      quote: t("landing.trustT1Quote"),
      author: t("landing.trustT1Author"),
      role: t("landing.trustT1Role"),
    },
    {
      quote: t("landing.trustT2Quote"),
      author: t("landing.trustT2Author"),
      role: t("landing.trustT2Role"),
    },
    {
      quote: t("landing.trustT3Quote"),
      author: t("landing.trustT3Author"),
      role: t("landing.trustT3Role"),
    },
  ];

  const membersDisplay =
    totalMembers != null && totalMembers > 0 ? `${totalMembers.toLocaleString()}+` : "—";
  const dealsDisplay =
    activeListings != null && activeListings > 0 ? `${activeListings.toLocaleString()}+` : "—";

  const credibilityStats = [
    {
      value: membersDisplay,
      label: t("landing.trustStatMembers"),
      testId: "trust-stat-members",
    },
    {
      value: dealsDisplay,
      label: t("landing.trustStatDeals"),
      testId: "trust-stat-deals",
    },
    {
      value: t("landing.trustStatRatingValue"),
      label: t("landing.trustStatRating"),
      suffix: "/5",
      stars: true,
      testId: "trust-stat-rating",
    },
    {
      value: t("landing.trustStatRecommendValue"),
      label: t("landing.trustStatRecommend"),
      testId: "trust-stat-recommend",
    },
  ];

  return (
    <section
      className="landing-section relative border-b border-border bg-muted/30"
      aria-labelledby="trust-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        aria-hidden
      />
      <div className="landing-container">
        <motion.div
          className="mx-auto mb-8 max-w-2xl text-center sm:mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
        >
          <Badge
            variant="outline"
            className="mb-4 border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
          >
            {t("landing.trustEyebrow")}
          </Badge>
          <h2 id="trust-heading" className="landing-heading-section" data-testid="text-trust-title">
            {t("landing.trustTitle")}
          </h2>
          <p className="landing-section-intro mt-3 sm:mt-4">{t("landing.trustLead")}</p>
        </motion.div>

        {/* Credibility band */}
        <motion.div
          className="mb-10 sm:mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          transition={{ duration: 0.45 }}
        >
          <div
            className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/[0.07] via-card to-muted/40 p-1 shadow-sm"
            data-testid="trust-credibility-band"
          >
            <div className="rounded-[0.875rem] bg-card/90 px-4 py-6 sm:px-6 sm:py-8">
              <div className="mb-6 border-b border-border/60 pb-5 text-center sm:mb-8 sm:pb-6 sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {t("landing.trustCredibilityTitle")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("landing.trustCredibilitySubtitle")}
                </p>
              </div>
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {credibilityStats.map((row) => (
                  <li
                    key={row.testId}
                    data-testid={row.testId}
                    className="flex flex-col rounded-xl border border-border/80 bg-background/80 px-3 py-4 text-center shadow-sm sm:px-4 sm:py-5 sm:text-left"
                  >
                    <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
                      {row.value}
                      {"suffix" in row && row.suffix ? (
                        <span className="text-lg font-semibold text-muted-foreground sm:text-xl">
                          {row.suffix}
                        </span>
                      ) : null}
                    </span>
                    {"stars" in row && row.stars ? (
                      <span className="mt-1 flex justify-center gap-0.5 sm:justify-start" aria-hidden>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                              i < 4 ? "fill-amber-400 text-amber-400" : "fill-amber-400/40 text-amber-400"
                            }`}
                          />
                        ))}
                      </span>
                    ) : null}
                    <span className="mt-2 text-xs font-medium leading-snug text-muted-foreground sm:text-sm">
                      {row.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          className="mb-10 sm:mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          transition={{ duration: 0.45 }}
        >
          <h3 className="mb-5 text-center text-lg font-bold tracking-tight text-foreground sm:mb-6 sm:text-xl">
            {t("landing.trustTestimonialsTitle")}
          </h3>
          <ul
            className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
            aria-label={t("landing.trustTestimonialsTitle")}
          >
            {testimonials.map((item, i) => (
              <li key={item.author}>
                <Card
                  className="landing-card h-full gap-0 border-l-4 border-l-accent bg-card/95 shadow-md"
                  data-testid={`card-trust-testimonial-${i}`}
                >
                  <CardContent className="landing-card-content flex h-full flex-col gap-4 p-5 sm:p-6">
                    <Quote
                      className="h-8 w-8 shrink-0 text-accent/80"
                      aria-hidden
                      strokeWidth={1.5}
                    />
                    <blockquote className="flex-1 text-pretty text-sm leading-relaxed text-foreground">
                      "{item.quote}"
                    </blockquote>
                    <footer className="border-t border-border/60 pt-4">
                      <p className="text-sm font-semibold text-foreground">{item.author}</p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                    </footer>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Trust pillars */}
        <motion.div
          className="space-y-4 sm:space-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <h3 className="text-center text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {t("landing.trustPillarsTitle")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {trustFeatures.map((feat, i) => (
              <motion.div key={feat.title} variants={fadeUp} transition={{ duration: 0.4 }}>
                <Card
                  className="landing-card group gap-0 border-border/90 bg-background/60"
                  data-testid={`card-trust-${i}`}
                >
                  <CardContent className="landing-card-content flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                    <div className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/25 transition-[transform,box-shadow] duration-200 ease-out group-hover:scale-[1.02] group-hover:shadow-md sm:mx-0">
                      <feat.icon className="h-7 w-7 text-accent" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <h4 className="mb-2 text-base font-bold leading-snug text-foreground">
                        {feat.title}
                      </h4>
                      <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                        {feat.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
