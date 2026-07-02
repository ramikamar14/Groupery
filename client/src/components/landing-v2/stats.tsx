"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface LandingV2StatsProps {
  activeListings?: number | null;
  totalMembers?: number | null;
}

type ApiListing = {
  id: number;
  title: string;
  category?: "physical" | "digital" | "offer" | string;
  filledSlots?: number;
  totalSlots?: number;
  pricePerSlot?: number | null;
  marketPrice?: number | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  digital: "#6d28d9",
  physical: "#059669",
  offer: "#dc2626",
};

function formatUsd(cents: number | null | undefined): string | null {
  if (cents == null || cents <= 0) return null;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

function SlotMeter({ filled, total }: { filled: number; total: number }) {
  const cells = Math.min(Math.max(total, 1), 10);
  const filledCells = total > 10 ? Math.round((filled / total) * 10) : filled;
  return (
    <div style={{ display: "flex", gap: 3 }} role="img" aria-label={`${filled} of ${total} spots filled`}>
      {Array.from({ length: cells }).map((_, i) => {
        const on = i < filledCells;
        const next = i === filledCells;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 8,
              borderRadius: 3,
              background: on
                ? "linear-gradient(180deg,#8b5cf6,#6d28d9)"
                : next
                ? "#fff"
                : "#ede9fe",
              border: next ? "1.5px dashed #c4b5fd" : "1.5px solid transparent",
              boxShadow: on ? "0 2px 6px -2px rgba(109,40,217,0.5)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function DealCard({ deal }: { deal: ApiListing }) {
  const { t } = useTranslation();
  const category = String(deal.category ?? "digital");
  const letterColor = CATEGORY_COLORS[category] ?? "#6d28d9";
  const filled = Math.max(0, deal.filledSlots ?? 0);
  const total = Math.max(1, deal.totalSlots ?? 1);
  const toUnlock = Math.max(0, total - filled);
  const price = formatUsd(deal.pricePerSlot);
  const market = formatUsd(deal.marketPrice);
  const save =
    deal.pricePerSlot && deal.marketPrice && deal.marketPrice > deal.pricePerSlot
      ? Math.round((1 - deal.pricePerSlot / deal.marketPrice) * 100)
      : 0;

  const categoryLabel =
    category === "physical"
      ? t("home.physical", "Physical")
      : category === "offer"
      ? t("home.offer", "Offer")
      : t("home.digital", "Digital");

  return (
    <Link
      href={`/listings/${deal.id}`}
      style={{ textDecoration: "none", display: "block", borderRadius: 20 }}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d28d9]"
      data-testid={`landing-deal-${deal.id}`}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #ede9fe",
          boxShadow: "0 4px 20px -8px rgba(109,40,217,0.18)",
          padding: 18,
          minWidth: 260,
          maxWidth: 280,
          flex: "none",
        }}
      >
        {/* Image placeholder */}
        <div
          style={{
            height: 118,
            borderRadius: 14,
            background:
              "repeating-linear-gradient(135deg, rgba(109,40,217,.055) 0 9px, rgba(109,40,217,0) 9px 20px), linear-gradient(160deg, #f5f3ff, #fff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#fff",
              boxShadow: `0 6px 18px -6px ${letterColor}66`,
              display: "grid",
              placeItems: "center",
              color: letterColor,
              fontWeight: 800,
              fontSize: 20,
            }}
            aria-hidden
          >
            {deal.title.slice(0, 1).toUpperCase()}
          </div>

          {/* LIVE chip */}
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "#e23744",
              color: "#fff",
              padding: "3px 9px",
              borderRadius: 999,
              fontSize: 10.5,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#fff",
                display: "inline-block",
                animation: "gp-pulse 1.4s ease-in-out infinite",
              }}
            />
            {t("v2.liveNow", "LIVE")}
          </div>
        </div>

        {/* Category eyebrow */}
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: "#9b95a6",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 4,
          }}
        >
          {categoryLabel}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#191320",
            marginBottom: 12,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 36,
          }}
        >
          {deal.title}
        </div>

        {/* Slot meter */}
        <SlotMeter filled={filled} total={total} />

        {/* Stat line */}
        <div
          style={{
            fontSize: 12,
            color: "#736c80",
            fontWeight: 600,
            marginTop: 7,
            marginBottom: 10,
          }}
        >
          <span style={{ color: "#191320", fontWeight: 700 }}>{t("v2.dealInCount", { count: filled, defaultValue: "{{count}} in" })}</span>
          {" · "}
          <span style={{ color: "#6d28d9", fontWeight: 700 }}>{t("v2.dealToUnlock", { count: toUnlock, defaultValue: "{{count}} to unlock" })}</span>
        </div>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#6d28d9",
              letterSpacing: "-0.03em",
            }}
          >
            {price ?? "—"}
          </span>
          {market && (
            <span
              style={{
                fontSize: 13,
                color: "#9b95a6",
                textDecoration: "line-through",
              }}
            >
              {market}
            </span>
          )}
          {save > 0 && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11.5,
                fontWeight: 700,
                color: "#059669",
                background: "#d1fae5",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              -{save}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function DealSkeleton() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid #ede9fe",
        padding: 18,
        minWidth: 260,
        maxWidth: 280,
        flex: "none",
      }}
      aria-hidden
    >
      <div style={{ height: 118, borderRadius: 14, background: "#f3f0fb", marginBottom: 14 }} className="animate-pulse" />
      <div style={{ height: 10, width: "40%", borderRadius: 6, background: "#efeaf9", marginBottom: 8 }} className="animate-pulse" />
      <div style={{ height: 14, width: "85%", borderRadius: 6, background: "#efeaf9", marginBottom: 14 }} className="animate-pulse" />
      <div style={{ height: 8, width: "100%", borderRadius: 6, background: "#efeaf9", marginBottom: 12 }} className="animate-pulse" />
      <div style={{ height: 20, width: "50%", borderRadius: 6, background: "#efeaf9" }} className="animate-pulse" />
    </div>
  );
}

export function Stats(_props: LandingV2StatsProps) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery<ApiListing[]>({
    queryKey: ["/api/discover/trending"],
    queryFn: async () => {
      const res = await fetch("/api/discover/trending");
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
    staleTime: 60_000,
  });

  const deals = (data ?? []).filter((d) => d && d.id != null && d.title).slice(0, 8);

  // Honest: if there are no real deals to show, don't fabricate any.
  if (!isLoading && deals.length === 0) return null;

  return (
    <section style={{ padding: "56px 0 40px" }}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 28 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#6d28d9",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 6,
                }}
              >
                {t("v2.fillingNow", "Filling now")}
              </p>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  color: "#191320",
                  margin: 0,
                }}
              >
                {t("v2.fillingNowTitle", "Group deals filling right now")}
              </h2>
            </div>
            <a
              href="/explore"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#6d28d9",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {t("v2.seeAll", "See all →")}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Horizontal scroll row — bleeds past container edges */}
      <div
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          padding: "4px 24px 16px",
          scrollbarWidth: "none",
        }}
        className="[&::-webkit-scrollbar]:hidden"
      >
        {isLoading
          ? [0, 1, 2, 3].map((i) => <DealSkeleton key={i} />)
          : deals.map((deal, i) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <DealCard deal={deal} />
              </motion.div>
            ))}
      </div>
    </section>
  );
}
