"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ArrowRight, Users, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

type DealListing = {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string | null;
  filledSlots?: number;
  totalSlots?: number;
  pricePerSlot?: number | null;
  marketPrice?: number | null;
};

function formatUsd(cents: number | null | undefined): string | null {
  if (cents == null || cents <= 0) return null;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

function LiveDealCard() {
  const { t } = useTranslation();

  const { data: deal } = useQuery<DealListing | null>({
    queryKey: ["/api/discover/deal-of-the-day"],
    queryFn: async () => {
      const res = await fetch("/api/discover/deal-of-the-day");
      if (!res.ok) return null;
      const json = await res.json();
      return json && typeof json === "object" && json.id != null ? (json as DealListing) : null;
    },
    staleTime: 5 * 60_000,
  });

  const hasDeal = deal && deal.title;
  const title = hasDeal ? deal.title : t("v2.exampleDealTitle");
  const subtitle = hasDeal ? (deal.description?.slice(0, 80) || "") : t("v2.exampleDealSubtitle");
  const groupPrice = hasDeal ? formatUsd(deal.pricePerSlot ?? null) : null;
  const marketPrice = hasDeal ? formatUsd(deal.marketPrice ?? null) : null;
  const filled = hasDeal ? Math.max(0, deal.filledSlots ?? 0) : 8;
  const total = hasDeal ? Math.max(2, deal.totalSlots ?? 10) : 10;
  const pct = Math.min(100, Math.round((filled / total) * 100));
  let discountLabel: string | null = null;
  if (hasDeal && deal.pricePerSlot && deal.marketPrice && deal.marketPrice > deal.pricePerSlot) {
    discountLabel = `-${Math.round((1 - deal.pricePerSlot / deal.marketPrice) * 100)}%`;
  }

  const ctaHref = hasDeal ? `/listings/${deal.id}` : "/explore";
  const ctaLabel = hasDeal ? t("v2.joinThisGroup") : t("v2.exampleDealJoin");

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
          {hasDeal && deal.imageUrl ? (
            <img src={deal.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl"
              aria-hidden
            >
              📦
            </motion.div>
          )}
        </div>

        <h3 className="font-bold text-lg mb-1 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{subtitle || "\u00a0"}</p>

        <div className="flex items-baseline gap-3 mb-4 flex-wrap">
          {groupPrice ? (
            <span className="text-3xl font-bold text-primary">{groupPrice}</span>
          ) : (
            <span className="text-3xl font-bold text-muted-foreground">—</span>
          )}
          {marketPrice ? (
            <span className="text-lg text-muted-foreground line-through">{marketPrice}</span>
          ) : null}
          {discountLabel ? (
            <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full dark:bg-green-950 dark:text-green-400">
              {discountLabel}
            </span>
          ) : null}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-primary" />
              <span className="font-semibold">{filled}</span> {t("v2.peopleIn")}
            </span>
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{Math.max(0, total - filled)}</span> {t("v2.moreToUnlock")}
            </span>
          </div>

          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
        </div>

        <Button className="w-full rounded-xl h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90" asChild>
          <Link href={ctaHref} className="inline-flex items-center justify-center gap-0">
            {ctaLabel}
            <ArrowRight className="ml-2 size-4 shrink-0" />
          </Link>
        </Button>

        <div className="absolute -right-4 top-20 flex flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1 + i * 0.15 }}
              className="size-8 rounded-full border-[3px] border-card bg-muted shadow-lg"
              aria-hidden
            />
          ))}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="size-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg"
            aria-hidden
          >
            +
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

interface HeroProps {
  activeListings?: number | null;
  totalMembers?: number | null;
}

export function Hero({ activeListings, totalMembers }: HeroProps) {
  const { t } = useTranslation();

  const listingsDisplay =
    activeListings != null && activeListings >= 0 ? activeListings.toLocaleString() : "—";
  const membersDisplay =
    totalMembers != null && totalMembers >= 0 ? totalMembers.toLocaleString() : "—";

  const heroStats = [
    { value: listingsDisplay, label: t("v2.heroStatListingsLabel") },
    { value: membersDisplay, label: t("v2.heroStatMembersLabel") },
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
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-semibold border-2" asChild>
                <a href="#how-it-works" className="inline-flex items-center justify-center">
                  {t("v2.seeHowItWorks")}
                </a>
              </Button>
            </div>

            {/* Trust strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground justify-center lg:justify-start mb-8"
            >
              <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> {t("v2.trustFundsHeld")}</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> {t("v2.trustIdVerified")}</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> {t("v2.trustFullRefund")}</span>
            </motion.div>

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
