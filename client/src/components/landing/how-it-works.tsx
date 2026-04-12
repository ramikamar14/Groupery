import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  UserPlus,
  CheckCircle,
  Handshake,
  Zap,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface Step {
  icon: LucideIcon;
  title: string;
  desc: string;
  num: string;
  color: string;
}

const featuresPrimaryCta =
  "landing-touch-target landing-btn-motion w-full gap-2 rounded-md bg-foreground px-6 text-base font-semibold text-background shadow-md hover:bg-foreground/90 hover:shadow-lg active:scale-[0.99] sm:w-auto sm:min-w-[12rem]";

export function LandingHowItWorks() {
  const { t } = useTranslation();

  const steps: Step[] = [
    {
      icon: Users,
      title: t("landing.step1Title"),
      desc: t("landing.step1Desc"),
      num: "01",
      color: "bg-primary text-primary-foreground",
    },
    {
      icon: UserPlus,
      title: t("landing.step2Title"),
      desc: t("landing.step2Desc"),
      num: "02",
      color: "bg-accent text-accent-foreground",
    },
    {
      icon: CheckCircle,
      title: t("landing.step3Title"),
      desc: t("landing.step3Desc"),
      num: "03",
      color: "bg-secondary text-secondary-foreground",
    },
    {
      icon: Handshake,
      title: t("landing.step4Title"),
      desc: t("landing.step4Desc"),
      num: "04",
      color: "bg-muted text-foreground",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="landing-section border-b border-border bg-muted/45"
      aria-labelledby="how-it-works-heading"
    >
      <div className="landing-container">
        <motion.div
          className="mx-auto mb-8 max-w-2xl text-center sm:mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="landing-eyebrow mb-3 border-0 bg-muted/50 sm:mb-4">
            <Zap className="h-3.5 w-3.5 shrink-0 text-accent" />
            {t("landing.howItWorksBadge")}
          </Badge>
          <h2 id="how-it-works-heading" className="landing-heading-section" data-testid="text-how-it-works">
            {t("landing.howItWorks")}
          </h2>
          <p className="landing-section-intro mt-3 sm:mt-4">{t("landing.howItWorksLead")}</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {steps.map((step, i) => (
            <motion.div key={step.num} variants={fadeUp} transition={{ duration: 0.4 }}>
              <Card className="landing-card group relative h-full gap-0" data-testid={`card-step-${i}`}>
                <div className="pointer-events-none absolute top-3 right-3 text-2xl font-semibold text-muted-foreground/30 sm:text-3xl">
                  {step.num}
                </div>
                <CardContent className="landing-card-content relative pr-12 sm:pr-14">
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg sm:mb-4 ${step.color}`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mb-2 text-base font-bold leading-snug text-foreground">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-pretty text-sm leading-relaxed text-muted-foreground/95">
                    {step.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-10 border-t border-border/80 pt-10 text-center sm:mt-12 sm:pt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
          transition={{ duration: 0.45 }}
        >
          <h3 className="text-pretty text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            {t("landing.midCtaTitle")}
          </h3>
          <p className="landing-section-intro mx-auto mt-3 max-w-lg sm:mt-4">
            {t("landing.midCtaSubtitle")}
          </p>
          <div className="mx-auto mt-6 flex w-full max-w-md justify-center sm:mt-8 sm:max-w-none">
            <Button asChild className={featuresPrimaryCta} data-testid="button-features-cta">
              <a href="/api/login">
                {t("landing.getStarted")}
                <ArrowRight className="h-4 w-4 shrink-0" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
