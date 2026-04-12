"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ArrowRight, Play, Users, Zap, TrendingUp } from "lucide-react";

function LiveDealCard() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
      className="relative"
    >
      <div className="relative bg-card rounded-[2rem] p-6 shadow-2xl border border-border/50 w-[320px] max-w-full">
        <div className="absolute -top-3 left-6 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          <span className="size-2 rounded-full bg-white animate-pulse" />
          {t("v2.liveNow")}
        </div>

        <div className="h-40 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 flex items-center justify-center mb-4 overflow-hidden">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl"
          >
            🎧
          </motion.div>
        </div>

        <h3 className="font-bold text-lg mb-1">Sony WH-1000XM5</h3>
        <p className="text-sm text-muted-foreground mb-4">Premium Noise Cancelling</p>

        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-3xl font-bold text-primary">$279</span>
          <span className="text-lg text-muted-foreground line-through">$399</span>
          <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full dark:bg-green-950 dark:text-green-400">
            -30%
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-primary" />
              <span className="font-semibold">18</span> {t("v2.peopleIn")}
            </span>
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">2</span> {t("v2.moreToUnlock")}
            </span>
          </div>

          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "90%" }}
              transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
        </div>

        <Button className="w-full rounded-xl h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90" asChild>
          <a href="/api/login" className="inline-flex items-center justify-center gap-0">
            {t("v2.joinThisGroup")}
            <ArrowRight className="ml-2 size-4 shrink-0" />
          </a>
        </Button>

        <div className="absolute -right-4 top-20 flex flex-col gap-1">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1 + i * 0.15 }}
              className="size-8 rounded-full border-[3px] border-card overflow-hidden shadow-lg"
            >
              <img src={`https://i.pravatar.cc/32?img=${i + 5}`} alt="" className="size-full object-cover" />
            </motion.div>
          ))}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="size-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg"
          >
            +15
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 2 }}
        className="absolute -left-8 bottom-24 bg-card rounded-2xl p-4 shadow-xl border flex items-center gap-3 max-w-[200px]"
      >
        <div className="size-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 dark:bg-green-950">
          <Zap className="size-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-semibold text-sm">{t("v2.dealUnlocked")}</p>
          <p className="text-xs text-muted-foreground">
            $4,230 {t("v2.savedTotal")}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const { t } = useTranslation();

  const heroStats = [
    { value: t("v2.heroStat1Value"), label: t("v2.heroStat1Label"), icon: undefined as string | undefined },
    { value: t("v2.heroStat2Value"), label: t("v2.heroStat2Label"), icon: undefined },
    { value: t("v2.heroStat3Value"), label: t("v2.heroStat3Label"), icon: "★" },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden py-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 -left-32 size-96 rounded-full bg-primary/20 blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 -right-32 size-[500px] rounded-full bg-accent/20 blur-[120px]"
        />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium text-primary mb-4 tracking-wide uppercase"
            >
              {t("v2.heroTagline")}
            </motion.p>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-display leading-[1.1] mb-6"
              data-testid="text-hero-title"
            >
              {t("v2.heroTitle")}{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  {t("v2.heroTitleHighlight")}
                </span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed" data-testid="text-hero-subtitle">
              {t("v2.heroSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button
                size="lg"
                className="rounded-full h-14 px-8 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                asChild
                data-testid="button-get-started"
              >
                <a href="/api/login" className="inline-flex items-center justify-center">
                  {t("landing.getStarted")}
                  <ArrowRight className="ml-2 size-5 shrink-0" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-semibold border-2 group" asChild>
                <a href="#how-it-works" className="inline-flex items-center justify-center">
                  <Play className="mr-2 size-4 shrink-0 group-hover:scale-110 transition-transform" />
                  {t("v2.watchDemo")}
                </a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-8 justify-center lg:justify-start">
              {heroStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-2xl font-bold font-display text-foreground flex items-center gap-1 justify-center lg:justify-start">
                    {stat.icon && <span className="text-yellow-500">{stat.icon}</span>}
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="hidden lg:flex justify-center items-center [perspective:1000px]">
            <LiveDealCard />
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-20 left-[10%] hidden xl:block"
      >
        <div className="bg-card/80 backdrop-blur rounded-2xl p-3 shadow-lg border flex items-center gap-2">
          <TrendingUp className="size-5 text-green-500" />
          <span className="text-sm font-medium">{t("v2.heroTrending")}</span>
        </div>
      </motion.div>
    </section>
  );
}
