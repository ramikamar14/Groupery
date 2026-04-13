"use client";

import { motion } from "framer-motion";
import { BadgeCheck, ShieldCheck, Zap, Heart, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Trust() {
  const { t } = useTranslation();

  const features = [
    {
      icon: BadgeCheck,
      title: t("v2.trustF1Title"),
      description: t("v2.trustF1Desc"),
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-950/50",
    },
    {
      icon: ShieldCheck,
      title: t("v2.trustF2Title"),
      description: t("v2.trustF2Desc"),
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-950/50",
    },
    {
      icon: Zap,
      title: t("v2.trustF3Title"),
      description: t("v2.trustF3Desc"),
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-950/50",
    },
    {
      icon: Heart,
      title: t("v2.trustF4Title"),
      description: t("v2.trustF4Desc"),
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100 dark:bg-rose-950/50",
    },
  ];

  const testimonials = [
    {
      quote: t("v2.testimonial1Quote"),
      author: t("v2.testimonial1Author"),
      role: t("v2.testimonial1Role"),
      avatar: 1,
    },
    {
      quote: t("v2.testimonial2Quote"),
      author: t("v2.testimonial2Author"),
      role: t("v2.testimonial2Role"),
      avatar: 2,
    },
    {
      quote: t("v2.testimonial3Quote"),
      author: t("v2.testimonial3Author"),
      role: t("v2.testimonial3Role"),
      avatar: 3,
    },
  ];

  return (
    <section id="trust" className="py-24 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden scroll-mt-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">{t("v2.trustTagline")}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground" data-testid="text-trust-title">
            {t("v2.trustTitle")}
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-shadow"
                data-testid={`card-trust-${i}`}
              >
                <div className={`size-12 rounded-xl ${feature.bg} flex items-center justify-center shrink-0`}>
                  <feature.icon className={`size-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="space-y-4">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="relative bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <Quote className="absolute top-4 right-4 size-8 text-primary/10" />
                  <p className="text-foreground mb-4 italic leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full overflow-hidden">
                      <img
                        src={`https://i.pravatar.cc/40?img=${testimonial.avatar + 20}`}
                        alt={testimonial.author}
                        className="size-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400 text-sm">
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold shadow-lg hidden lg:flex items-center gap-2 dark:bg-green-950 dark:text-green-400"
            >
              <ShieldCheck className="size-4" />
              {t("v2.secureBadge")}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
