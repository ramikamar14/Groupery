"use client";

import { motion, useInView } from "framer-motion";
import { Search, Users, BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef } from "react";

const steps = [
  {
    icon: Search,
    number: 1,
    title: "Browse deals",
    description: "Explore hundreds of live group deals across electronics, software, food, and more.",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-100 dark:bg-violet-950/60",
    iconColor: "text-violet-600 dark:text-violet-400",
    badgeBg: "bg-violet-600",
    badgeRing: "ring-violet-200 dark:ring-violet-800",
  },
  {
    icon: Users,
    number: 2,
    title: "Join & commit",
    description: "Claim your spot in a buying group. No payment until the group fills — commitment only.",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-100 dark:bg-blue-950/60",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-600",
    badgeRing: "ring-blue-200 dark:ring-blue-800",
  },
  {
    icon: BadgeCheck,
    number: 3,
    title: "Deal fills, you save",
    description: "When the group reaches its target, the deal unlocks. Coordinate with the organiser and save big.",
    gradient: "from-emerald-500 to-green-500",
    bg: "bg-emerald-100 dark:bg-emerald-950/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-600",
    badgeRing: "ring-emerald-200 dark:ring-emerald-800",
  },
];

function ConnectorLine({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div
      ref={ref}
      className="hidden lg:flex items-center justify-center flex-shrink-0 w-16 mt-14 relative"
      aria-hidden
    >
      {/* Dashed track */}
      <div className="w-full h-0.5 bg-border/50 rounded-full relative overflow-hidden">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: index * 0.3 + 0.5, ease: "easeInOut" }}
          style={{ transformOrigin: "left" }}
          className="absolute inset-0 bg-gradient-to-r from-primary/70 to-accent/70 rounded-full"
        />
      </div>
      {/* Animated chevron dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.35, delay: index * 0.3 + 1.1 }}
        className="absolute size-3 rounded-full bg-gradient-to-r from-primary to-accent shadow-sm shadow-primary/30"
      />
    </div>
  );
}

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden scroll-mt-24">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/60 to-muted/40 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,hsl(var(--primary)/0.04),transparent)] pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest bg-primary/8 border border-primary/15 px-3 py-1.5 rounded-full mb-4">
            {t("v2.howTagline")}
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground"
            data-testid="text-how-it-works"
          >
            {t("v2.howTitle")}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Three simple steps between you and a better price.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop: horizontal row with animated connectors */}
          <div className="hidden lg:flex items-start gap-0">
            {steps.map((step, i) => (
              <div key={step.number} className="contents">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.18 }}
                  className="relative group flex-1 min-w-0"
                  data-testid={`card-step-${i}`}
                >
                  <div className="relative bg-card rounded-[2rem] border border-border/50 p-8 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 h-full">
                    {/* Number badge */}
                    <div
                      className={`absolute -top-4 left-6 ${step.badgeBg} text-white size-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ring-4 ${step.badgeRing} bg-clip-padding`}
                    >
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div
                      className={`${step.bg} size-14 rounded-2xl flex items-center justify-center mb-5 mt-2 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <step.icon className={`size-7 ${step.iconColor}`} strokeWidth={1.75} />
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {/* Gradient overlay on hover */}
                    <div
                      className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-[0.045] transition-opacity duration-300 pointer-events-none`}
                    />
                  </div>
                </motion.div>

                {i < steps.length - 1 && <ConnectorLine index={i} />}
              </div>
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
                  {/* Vertical line + badge */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`size-10 rounded-full ${step.badgeBg} flex items-center justify-center text-white font-bold shadow-lg text-sm ring-4 ${step.badgeRing}`}
                    >
                      {step.number}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/40 to-transparent mt-2 min-h-[2.5rem]" />
                    )}
                  </div>

                  <div className="flex-1 bg-card rounded-2xl border border-border/50 p-5 shadow-sm mb-4">
                    <div
                      className={`${step.bg} size-10 rounded-xl flex items-center justify-center mb-3`}
                    >
                      <step.icon className={`size-5 ${step.iconColor}`} strokeWidth={1.75} />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1.5">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
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
