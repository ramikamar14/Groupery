"use client";

import { motion } from "framer-motion";
import { Search, Share2, Users, PartyPopper } from "lucide-react";
import { useTranslation } from "react-i18next";

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Search,
      title: t("landing.step1Title"),
      description: t("landing.step1Desc"),
      visual: (
        <div className="relative h-32 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="size-20 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center dark:from-violet-950 dark:to-purple-950"
          >
            <span className="text-3xl">🔍</span>
          </motion.div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute right-4 top-4 bg-card rounded-lg px-2 py-1 shadow-md border text-xs font-medium"
          >
            {t("v2.howVisualElectronics")}
          </motion.div>
          <motion.div
            animate={{ opacity: [1, 0.5, 1], x: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="absolute left-4 bottom-4 bg-card rounded-lg px-2 py-1 shadow-md border text-xs font-medium"
          >
            {t("v2.howVisualHomeGarden")}
          </motion.div>
        </div>
      ),
    },
    {
      icon: Share2,
      title: t("landing.step2Title"),
      description: t("landing.step2Desc"),
      visual: (
        <div className="relative h-32 flex items-center justify-center">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="size-12 rounded-full border-[3px] border-card overflow-hidden shadow-lg"
              >
                <img src={`https://i.pravatar.cc/48?img=${i + 10}`} alt="" className="size-full object-cover" />
              </motion.div>
            ))}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: "spring" }}
              className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg border-[3px] border-card"
            >
              +5
            </motion.div>
          </div>
        </div>
      ),
    },
    {
      icon: Users,
      title: t("landing.step3Title"),
      description: t("landing.step3Desc"),
      visual: (
        <div className="relative h-32 flex flex-col items-center justify-center gap-2">
          <div className="text-sm text-muted-foreground">{t("v2.howGroupProgress")}</div>
          <div className="w-full max-w-[160px] h-4 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: "30%" }}
              whileInView={{ width: "85%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.8 }}
            className="text-xs font-semibold text-primary"
          >
            {t("v2.howMembersJoined")}
          </motion.div>
        </div>
      ),
    },
    {
      icon: PartyPopper,
      title: t("landing.step4Title"),
      description: t("landing.step4Desc"),
      visual: (
        <div className="relative h-32 flex items-center justify-center">
          <motion.div
            animate={{ rotate: [-5, 5, -5], scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-5xl"
          >
            🎉
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold dark:bg-green-950 dark:text-green-400"
          >
            {t("v2.howUnlockedBadge")}
          </motion.div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">{t("v2.howTagline")}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground" data-testid="text-how-it-works">
            {t("v2.howTitle")}
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative group"
              >
                {i < steps.length - 1 && (
                  <div className="absolute top-16 left-[55%] w-[90%] h-0.5 bg-gradient-to-r from-primary/30 via-primary/20 to-transparent z-0" />
                )}

                <div
                  className="relative bg-card rounded-[2rem] border border-border/50 p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 z-10"
                  data-testid={`card-step-${i}`}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                    {t("v2.howStep", { n: i + 1 })}
                  </div>

                  {step.visual}

                  <h3 className="text-lg font-bold text-foreground mb-2 mt-4">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:hidden space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="size-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                      {i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/30 to-transparent mt-2 min-h-[2rem]" />
                    )}
                  </div>

                  <div className="flex-1 bg-card rounded-2xl border border-border/50 p-5 shadow-sm mb-2">
                    <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
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
