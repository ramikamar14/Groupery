"use client";

import { motion, useInView } from "framer-motion";
import { Search, UserPlus, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef } from "react";

const steps = [
  {
    icon: Search,
    number: 1,
    titleKey: "hiw.step1Title" as const,
    descKey: "hiw.step1Desc" as const,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-100 dark:bg-violet-950/60",
    iconColor: "text-violet-600 dark:text-violet-400",
    badgeBg: "bg-violet-600",
  },
  {
    icon: UserPlus,
    number: 2,
    titleKey: "hiw.step2Title" as const,
    descKey: "hiw.step2Desc" as const,
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-100 dark:bg-blue-950/60",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-600",
  },
  {
    icon: CheckCircle2,
    number: 3,
    titleKey: "hiw.step3Title" as const,
    descKey: "hiw.step3Desc" as const,
    gradient: "from-emerald-500 to-green-500",
    bg: "bg-emerald-100 dark:bg-emerald-950/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-600",
  },
];

function ConnectorLine({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div
      ref={ref}
      className="hidden lg:flex items-center justify-center flex-1 relative px-2"
      aria-hidden
    >
      <div className="w-full h-0.5 bg-border/60 relative overflow-hidden rounded-full">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.7, delay: index * 0.25 + 0.4, ease: "easeInOut" }}
          style={{ transformOrigin: "left" }}
          className="absolute inset-0 bg-gradient-to-r from-primary/60 via-accent/60 to-primary/40 rounded-full"
        />
      </div>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: index * 0.25 + 0.9 }}
        className="absolute size-2 rounded-full bg-primary/50"
      />
    </div>
  );
}

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30 pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">
            {t("v2.howTagline")}
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground"
            data-testid="text-how-it-works"
          >
            {t("v2.howTitle")}
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop: horizontal row with animated connectors */}
          <div className="hidden lg:flex items-start gap-0">
            {steps.map((step, i) => (
              <>
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.18 }}
                  className="relative group flex-1 min-w-0"
                  data-testid={`card-step-${i}`}
                >
                  <div className="relative bg-card rounded-[2rem] border border-border/50 p-7 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 h-full">
                    {/* Number badge */}
                    <div
                      className={`absolute -top-3.5 left-6 ${step.badgeBg} text-white size-7 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-background`}
                    >
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className={`${step.bg} size-14 rounded-2xl flex items-center justify-center mb-5 mt-2 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className={`size-7 ${step.iconColor}`} />
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {t(step.titleKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(step.descKey)}
                    </p>

                    {/* Subtle gradient overlay on hover */}
                    <div
                      className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 pointer-events-none`}
                    />
                  </div>
                </motion.div>

                {i < steps.length - 1 && (
                  <div key={`connector-${i}`} className="flex-shrink-0 w-12 mt-16">
                    <ConnectorLine index={i} />
                  </div>
                )}
              </>
            ))}
          </div>

          {/* Mobile: vertical stepper */}
          <div className="lg:hidden space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex gap-4">
                  {/* Vertical line + number */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`size-10 rounded-full ${step.badgeBg} flex items-center justify-center text-white font-bold shadow-lg text-sm`}
                    >
                      {step.number}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/40 to-transparent mt-2 min-h-[2.5rem]" />
                    )}
                  </div>

                  <div className="flex-1 bg-card rounded-2xl border border-border/50 p-5 shadow-sm mb-4">
                    <div className={`${step.bg} size-10 rounded-xl flex items-center justify-center mb-3`}>
                      <step.icon className={`size-5 ${step.iconColor}`} />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1.5">
                      {t(step.titleKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(step.descKey)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
