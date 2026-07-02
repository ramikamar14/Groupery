"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
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
  const groupPrice = hasDeal ? formatUsd(deal.pricePerSlot ?? null) : null;
  const marketPrice = hasDeal ? formatUsd(deal.marketPrice ?? null) : null;
  const filled = hasDeal ? Math.max(0, deal.filledSlots ?? 0) : 8;
  const total = hasDeal ? Math.max(2, deal.totalSlots ?? 10) : 10;
  let discountLabel: string | null = null;
  if (hasDeal && deal.pricePerSlot && deal.marketPrice && deal.marketPrice > deal.pricePerSlot) {
    discountLabel = `-${Math.round((1 - deal.pricePerSlot / deal.marketPrice) * 100)}%`;
  }

  const ctaHref = hasDeal ? `/listings/${deal.id}` : "/";
  const ctaLabel = hasDeal ? t("v2.joinThisGroup") : t("v2.exampleDealJoin");

  const cells = Math.min(total, 12);
  const filledCells = total > 12 ? Math.round((filled / total) * 12) : filled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
      className="relative"
    >
      <div style={{ background: "#fff", borderRadius: 28, padding: 24, boxShadow: "0 18px 50px -12px rgba(46,16,101,0.32), 0 6px 16px -8px rgba(25,19,32,0.10)", width: 320, maxWidth: "100%", position: "relative" }}>
        {/* LIVE badge */}
        <div style={{ position: "absolute", top: -12, left: 20, display: "flex", alignItems: "center", gap: 6, background: "#e23744", color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "gp-pulse 1.4s ease-in-out infinite", display: "inline-block" }} />
          {t("v2.liveNow")}
        </div>

        {/* Image */}
        <div style={{ height: 140, borderRadius: 18, background: "repeating-linear-gradient(135deg, rgba(109,40,217,.055) 0 9px, rgba(109,40,217,0) 9px 20px), linear-gradient(160deg, #f5f3ff, #fff)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, overflow: "hidden", position: "relative" }}>
          {hasDeal && deal.imageUrl ? (
            <img src={deal.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ width: 54, height: 54, borderRadius: 14, background: "#fff", boxShadow: "0 6px 18px -6px rgba(109,40,217,0.4)", display: "grid", placeItems: "center", color: "#6d28d9", fontWeight: 800, fontSize: 22 }}
              aria-hidden
            >
              G
            </motion.div>
          )}
          {/* Savings disc */}
          {discountLabel && (
            <div style={{ position: "absolute", right: 12, bottom: -18, width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #059669, #047857)", border: "3px solid #fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotate(-8deg)", boxShadow: "0 4px 12px rgba(5,150,105,0.4)" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{discountLabel}</span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>OFF</span>
            </div>
          )}
        </div>

        <h3 style={{ fontWeight: 800, fontSize: 15.5, letterSpacing: "-0.02em", margin: "0 0 4px", lineHeight: 1.25, color: "#191320" }} className="line-clamp-2">{title}</h3>

        {/* Slot meter */}
        <div style={{ marginTop: discountLabel ? 22 : 10, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#191320" }}>
              <span style={{ color: "#6d28d9", fontSize: 15 }}>{filled}</span>
              <span style={{ color: "#736c80", fontWeight: 600 }}> of {total} joined</span>
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6d28d9" }}>{Math.max(0, total - filled)} to unlock</span>
          </div>
          <div style={{ display: "flex", gap: 3.5 }}>
            {Array.from({ length: cells }).map((_, i) => {
              const isFilled = i < filledCells;
              const isNext = i === filledCells;
              return (
                <div key={i} style={{
                  flex: 1, height: 11, borderRadius: 4,
                  background: isFilled ? "linear-gradient(180deg, #8b5cf6, #6d28d9)" : isNext ? "#fff" : "#ede9fe",
                  border: isNext ? "1.5px dashed #c4b5fd" : "1.5px solid transparent",
                  boxShadow: isFilled ? "0 3px 8px -2px rgba(109,40,217,0.5)" : "none",
                }} />
              );
            })}
          </div>
        </div>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
          {groupPrice ? (
            <span style={{ fontSize: 26, fontWeight: 800, color: "#6d28d9", letterSpacing: "-0.03em" }}>{groupPrice}</span>
          ) : (
            <span style={{ fontSize: 26, fontWeight: 800, color: "#9b95a6" }}>—</span>
          )}
          {marketPrice ? (
            <span style={{ fontSize: 14, color: "#9b95a6", textDecoration: "line-through" }}>{marketPrice}</span>
          ) : null}
        </div>

        <Link href={ctaHref} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", height: 48, borderRadius: 14, fontSize: 15, fontWeight: 700, background: "linear-gradient(120deg, #7c3aed, #5b21b6)", color: "#fff", textDecoration: "none", boxShadow: "0 8px 24px -8px rgba(109,40,217,0.65)" }}>
          {ctaLabel}
          <ArrowRight style={{ width: 16, height: 16, flexShrink: 0 }} />
        </Link>
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

  // Honest stats only — real platform numbers when available, otherwise the
  // no-risk facts that are true from day one. No invented figures.
  const realStats = [
    activeListings && activeListings > 0
      ? { value: `${activeListings}`, label: t("v2.heroStatDeals", "live group deals") }
      : null,
    totalMembers && totalMembers > 0
      ? { value: `${totalMembers}`, label: t("v2.heroStatMembers", "members") }
      : null,
  ].filter(Boolean) as { value: string; label: string }[];
  const heroStats = [
    ...realStats,
    { value: "$0", label: t("v2.heroStatUpfront", "charged until the group fills") },
    { value: "100%", label: t("v2.heroStatRefund", "refund if it doesn't fill") },
  ].slice(0, 3);

  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #6d28d9 0%, #3b1379 100%)" }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "35%", left: "55%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

      <div className="container mx-auto px-6 py-20 lg:py-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Eyebrow pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", borderRadius: 999, padding: "6px 14px", marginBottom: 20 }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", animation: "gp-pulse 1.4s ease-in-out infinite", display: "inline-block" }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {t("v2.heroTagline")}
              </span>
            </motion.div>

            <h1
              className="font-bold font-display leading-[1.08] mb-6"
              style={{ fontSize: "clamp(2.4rem, 5vw, 3.75rem)", color: "#fff", letterSpacing: "-0.03em" }}
              data-testid="text-hero-title"
            >
              {t("v2.heroTitle")}{" "}
              <span style={{ color: "#c4b5fd" }}>
                {t("v2.heroTitleHighlight")}
              </span>
            </h1>

            <p
              className="mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.75)" }}
              data-testid="text-hero-subtitle"
            >
              {t("v2.heroSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <a
                href="/api/login"
                data-testid="button-get-started"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#fff", color: "#6d28d9", fontWeight: 700, fontSize: 16, padding: "0 32px", height: 56, borderRadius: 999, textDecoration: "none", boxShadow: "0 8px 30px -8px rgba(0,0,0,0.35)", transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px -8px rgba(0,0,0,0.4)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px -8px rgba(0,0,0,0.35)"; }}
              >
                {t("landing.getStarted")}
                <ArrowRight style={{ width: 20, height: 20, flexShrink: 0 }} />
              </a>
              <a
                href="#how-it-works"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 600, fontSize: 16, padding: "0 28px", height: 56, borderRadius: 999, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.3)", transition: "background 0.15s" }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.22)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)"; }}
              >
                {t("v2.seeHowItWorks")}
              </a>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-8 justify-center lg:justify-start"
            >
              {heroStats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div style={{ fontSize: "1.625rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{stat.value}</div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Desktop: Momentum deal card */}
          <div className="hidden lg:flex justify-center items-center [perspective:1000px]">
            <LiveDealCard />
          </div>
        </div>

        {/* Mobile stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="lg:hidden flex flex-wrap items-stretch justify-center gap-3 mt-10"
        >
          {heroStats.map((stat) => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: "10px 16px", textAlign: "center", minWidth: 96, maxWidth: 140 }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>{stat.value}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)" }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Trust band */}
      <div style={{ background: "#fff", borderTop: "1px solid rgba(109,40,217,0.08)" }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {[
              { icon: "🔒", text: t("v2.trustFundsHeld") },
              { icon: "✅", text: t("v2.trustIdVerified") },
              { icon: "↩️", text: t("v2.trustFullRefund") },
            ].map((item) => (
              <span key={item.text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#3a3340", fontWeight: 600 }}>
                <span aria-hidden>{item.icon}</span> {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
