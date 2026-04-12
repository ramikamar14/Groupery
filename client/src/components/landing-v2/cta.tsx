"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export function CTA() {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="relative rounded-[3rem] bg-gradient-to-br from-primary via-accent to-primary p-[2px]">
            <div className="rounded-[3rem] bg-card p-12 md:p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

              <div className="absolute -left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="size-12 rounded-full border-[3px] border-card overflow-hidden shadow-lg"
                  >
                    <img src={`https://i.pravatar.cc/48?img=${i + 30}`} alt="" className="size-full object-cover" />
                  </motion.div>
                ))}
              </div>

              <div className="absolute -right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
                {[5, 6, 7, 8].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="size-12 rounded-full border-[3px] border-card overflow-hidden shadow-lg"
                  >
                    <img src={`https://i.pravatar.cc/48?img=${i + 30}`} alt="" className="size-full object-cover" />
                  </motion.div>
                ))}
              </div>

              <div className="relative text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                >
                  <Sparkles className="size-4" />
                  {t("v2.ctaTagline")}
                </motion.div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground mb-6 text-balance" data-testid="text-cta-title">
                  {t("v2.ctaTitle")}
                </h2>

                <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10" data-testid="text-cta-subtitle">
                  {t("landing.ctaSubtitle")}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="rounded-full h-14 px-8 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 group"
                    asChild
                    data-testid="button-cta"
                  >
                    <a href="/api/login" className="inline-flex items-center justify-center">
                      {t("v2.ctaButton")}
                      <ArrowRight className="ml-2 size-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-semibold border-2" asChild>
                    <Link href="/">{t("v2.ctaSecondary")}</Link>
                  </Button>
                </div>

                <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="size-8 rounded-full border-2 border-card overflow-hidden">
                        <img src={`https://i.pravatar.cc/32?img=${i + 40}`} alt="" className="size-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="size-4" />
                    <span>{t("v2.ctaJoinedWeek", { count: "2,847" })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
