"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const TRUST_ITEMS = [
  {
    icon: "🔒",
    title: "Funds held until delivery confirmed",
    desc: "Your money is held in escrow until the group unlocks and delivery is confirmed.",
  },
  {
    icon: "✅",
    title: "ID-verified deal creators",
    desc: "Every host passes identity checks before posting a deal.",
  },
  {
    icon: "↩️",
    title: "Full refund if group doesn't fill",
    desc: "If a deal doesn't reach its target, you're refunded automatically.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Saved $200 on our office software budget in the first month. The group-buy model is genius.",
    author: "Sarah Al-Rashidi",
    role: "Operations lead, Dubai",
    initials: "SA",
  },
  {
    quote: "We pooled a bulk order of kitchen appliances with 12 neighbours. Saved 35% each. Would never go back to buying alone.",
    author: "Marco Trevisan",
    role: "Home enthusiast, Milan",
    initials: "MT",
  },
  {
    quote: "Grouperry made it so easy to coordinate a software subscription split across our startup team.",
    author: "Priya Nair",
    role: "Founder, Bengaluru",
    initials: "PN",
  },
];

const AVATAR_COLORS = ["#6d28d9", "#2563eb", "#059669"];

export function Trust() {
  const { t } = useTranslation();

  return (
    <section
      id="trust"
      className="scroll-mt-24"
      style={{ background: "#fff", padding: "72px 0" }}
    >
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 36 }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#6d28d9",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            {t("v2.trustTagline")}
          </p>
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#191320",
              margin: 0,
            }}
            data-testid="text-trust-title"
          >
            {t("v2.trustTitle")}
          </h2>
        </motion.div>

        {/* Trust card — 3 items side by side */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            background: "#fff",
            border: "1px solid #ede9fe",
            borderRadius: 20,
            padding: "28px 32px",
            boxShadow: "0 4px 24px -8px rgba(109,40,217,0.12)",
            marginBottom: 48,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRUST_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-testid={`card-trust-${i}`}
                style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    flex: "none",
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "#f5f3ff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 18,
                  }}
                >
                  {item.icon}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#191320",
                      marginBottom: 3,
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#736c80", lineHeight: 1.45 }}>
                    {item.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {TESTIMONIALS.map((t2, i) => (
            <motion.div
              key={t2.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              style={{
                background: "#faf9fc",
                borderRadius: 18,
                border: "1px solid #ede9fe",
                padding: 24,
                boxShadow: "0 2px 10px -4px rgba(109,40,217,0.10)",
              }}
            >
              <p
                style={{
                  fontSize: 13.5,
                  color: "#3a3340",
                  fontStyle: "italic",
                  lineHeight: 1.55,
                  marginBottom: 18,
                }}
              >
                &ldquo;{t2.quote}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    flex: "none",
                  }}
                >
                  {t2.initials}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#191320" }}>{t2.author}</div>
                  <div style={{ fontSize: 11.5, color: "#9b95a6" }}>{t2.role}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 1 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} style={{ color: "#fbbf24", fontSize: 13 }}>★</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
