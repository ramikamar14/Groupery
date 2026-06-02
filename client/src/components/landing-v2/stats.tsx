"use client";

import { motion } from "framer-motion";

interface LandingV2StatsProps {
  activeListings?: number | null;
  totalMembers?: number | null;
}

const SAMPLE_DEALS = [
  { id: 1, title: "Adobe Creative Cloud · Team", cat: "Software", filled: 7, total: 10, price: "$38", market: "$60", save: 37 },
  { id: 2, title: "Weekly Organic Box", cat: "Groceries", filled: 4, total: 6, price: "$44", market: "$68", save: 35 },
  { id: 3, title: "Notion Teams · Annual", cat: "Software", filled: 12, total: 15, price: "$8/mo", market: "$16/mo", save: 50 },
  { id: 4, title: "Salsa Dance Workshop · 4 sessions", cat: "Experiences", filled: 9, total: 12, price: "$65", market: "$95", save: 32 },
  { id: 5, title: "Gym membership · 6 months", cat: "Memberships", filled: 3, total: 8, price: "$32/mo", market: "$55/mo", save: 42 },
];

const LETTER_COLORS: Record<string, string> = {
  Software: "#6d28d9",
  Groceries: "#059669",
  Experiences: "#dc2626",
  Memberships: "#d97706",
};

function SlotMeter({ filled, total }: { filled: number; total: number }) {
  const cells = Math.min(total, 10);
  const filledCells = total > 10 ? Math.round((filled / total) * 10) : filled;
  return (
    <div style={{ display: "flex", gap: 3 }}>
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

function DealCard({
  deal,
}: {
  deal: (typeof SAMPLE_DEALS)[number];
}) {
  const letterColor = LETTER_COLORS[deal.cat] ?? "#6d28d9";
  const toUnlock = Math.max(0, deal.total - deal.filled);

  return (
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
        >
          {deal.title[0]}
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
          LIVE
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
        {deal.cat}
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
        }}
      >
        {deal.title}
      </div>

      {/* Slot meter */}
      <SlotMeter filled={deal.filled} total={deal.total} />

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
        <span style={{ color: "#191320", fontWeight: 700 }}>{deal.filled} in</span>
        {" · "}
        <span style={{ color: "#6d28d9", fontWeight: 700 }}>{toUnlock} to unlock</span>
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
          {deal.price}
        </span>
        <span
          style={{
            fontSize: 13,
            color: "#9b95a6",
            textDecoration: "line-through",
          }}
        >
          {deal.market}
        </span>
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
          -{deal.save}%
        </span>
      </div>
    </div>
  );
}

export function Stats(_props: LandingV2StatsProps) {
  return (
    <section style={{ padding: "56px 0 40px" }}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 28 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
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
                Filling Now
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
                Group deals going live today
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
              See all →
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
        {SAMPLE_DEALS.map((deal, i) => (
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
