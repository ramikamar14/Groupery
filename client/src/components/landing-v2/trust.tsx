"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Trust() {
  const { t } = useTranslation();

  const TRUST_ITEMS = [
    {
      icon: "🔒",
      title: t("v2.trustItem1Title", "Funds held until delivery confirmed"),
      desc: t("v2.trustItem1Desc", "Your money is held in escrow until the group unlocks and delivery is confirmed."),
    },
    {
      icon: "✅",
      title: t("v2.trustItem2Title", "ID-verified deal creators"),
      desc: t("v2.trustItem2Desc", "Every host passes identity checks before posting a deal."),
    },
    {
      icon: "↩️",
      title: t("v2.trustItem3Title", "Full refund if group doesn't fill"),
      desc: t("v2.trustItem3Desc", "If a deal doesn't reach its target, you're refunded automatically."),
    },
  ];

  // Honest founding-era points — no invented testimonials or numbers.
  const FOUNDING_POINTS = [
    {
      icon: "🚀",
      title: t("v2.foundingPoint1Title", "We're just getting started"),
      desc: t(
        "v2.foundingPoint1Desc",
        "Grouperry is early. You'd be one of the first people splitting SaaS costs here — and your feedback directly shapes what we build next."
      ),
    },
    {
      icon: "💳",
      title: t("v2.foundingPoint2Title", "You're never charged upfront"),
      desc: t(
        "v2.foundingPoint2Desc",
        "Join a group and your card isn't charged until the group actually fills. If it doesn't fill, nothing is taken — no risk in trying."
      ),
    },
    {
      icon: "🛡️",
      title: t("v2.foundingPoint3Title", "Verified organisers, transparent deals"),
      desc: t(
        "v2.foundingPoint3Desc",
        "Every deal host passes an ID check before they can post. You always see exactly what you're splitting and with how many people."
      ),
    },
  ];

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

        {/* Trust card — full-width white card, 3 items side by side */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
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
                  aria-hidden
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

        {/* Founding member / honesty cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {FOUNDING_POINTS.map((item, i) => (
            <motion.div
              key={item.title}
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
              <div
                aria-hidden
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#f5f3ff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                  marginBottom: 14,
                }}
              >
                {item.icon}
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "#191320", marginBottom: 6 }}>
                {item.title}
              </div>
              <p style={{ fontSize: 13, color: "#736c80", lineHeight: 1.55, margin: 0 }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
