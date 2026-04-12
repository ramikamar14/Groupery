import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

const btnPrimary =
  "landing-touch-target landing-btn-motion w-full gap-2 rounded-md bg-background px-6 text-base font-semibold text-foreground shadow-md ring-2 ring-background/30 hover:bg-background hover:shadow-lg active:scale-[0.99] sm:w-auto sm:min-w-[12rem]";

const btnSecondary =
  "landing-touch-target landing-btn-motion w-full rounded-md border border-primary-foreground/30 bg-transparent px-6 text-base font-medium text-primary-foreground hover:border-primary-foreground/50 hover:bg-primary-foreground/10 active:scale-[0.99] sm:w-auto";

export function LandingCTA() {
  const { t } = useTranslation();

  return (
    <section className="landing-section border-b border-border bg-muted/25" aria-labelledby="cta-heading">
      <div className="landing-container">
        <motion.div
          className="w-full min-w-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <div className="landing-card overflow-hidden border border-primary/20 border-t-primary/30 bg-gradient-to-br from-primary to-primary p-0 shadow-lg ring-1 ring-black/10">
            <div className="relative px-4 py-12 text-center sm:px-8 sm:py-20">
              <h2
                id="cta-heading"
                className="landing-heading-section mb-3 text-pretty text-primary-foreground sm:mb-4"
                data-testid="text-cta-title"
              >
                {t("landing.ctaTitle")}
              </h2>
              <p
                className="mx-auto mb-8 max-w-2xl text-pretty text-base leading-relaxed text-primary-foreground/85 sm:mb-10 sm:text-lg"
                data-testid="text-cta-subtitle"
              >
                {t("landing.ctaSubtitle")}
              </p>
              <div className="mx-auto flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
                <Button asChild className={btnPrimary} data-testid="button-cta">
                  <a href="/api/login">
                    {t("landing.ctaButton")}
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </a>
                </Button>
                <Button asChild variant="outline" className={btnSecondary}>
                  <a href="#how-it-works" className="flex items-center justify-center gap-2">
                    {t("landing.ctaLearnMore")}
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
