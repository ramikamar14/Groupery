"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const CATEGORY_CHIPS = [
  { name: "SaaS & AI tools", emoji: "🤖" },
  { name: "Software licenses", emoji: "💻" },
  { name: "Cloud & storage", emoji: "☁️" },
  { name: "Courses & cohorts", emoji: "🎓" },
  { name: "Physical goods", emoji: "📦" },
];

export function Categories() {
  const { t } = useTranslation();

  return (
    <section
      id="categories"
      className="scroll-mt-24"
      style={{ background: "#faf9fc", padding: "64px 0" }}
    >
      <div className="container mx-auto px-6">
        {/* Header */}
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
            {t("v2.categoriesTagline")}
          </p>
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#191320",
              margin: 0,
            }}
            data-testid="text-categories-title"
          >
            Browse by category
          </h2>
        </motion.div>

        {/* Chips row — horizontal scroll on mobile, wrapping on desktop */}
        <div
          style={{
            display: "flex",
            gap: 14,
            overflowX: "auto",
            padding: "4px 0 8px",
            scrollbarWidth: "none",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
          className="[&::-webkit-scrollbar]:hidden"
        >
          {CATEGORY_CHIPS.map((cat, i) => (
            <motion.a
              key={cat.name}
              href={`/explore?category=${encodeURIComponent(cat.name)}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              data-testid={`card-category-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: "1px solid #ede9fe",
                borderRadius: 16,
                padding: "12px 20px",
                textDecoration: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px -4px rgba(109,40,217,0.12)",
                whiteSpace: "nowrap",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              whileHover={{ y: -2, boxShadow: "0 6px 18px -4px rgba(109,40,217,0.22)" }}
            >
              <span style={{ fontSize: 20 }}>{cat.emoji}</span>
              <div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "#191320",
                    lineHeight: 1.2,
                  }}
                >
                  {cat.name}
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginTop: 28 }}
        >
          <a
            href="/explore"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#6d28d9",
              textDecoration: "none",
            }}
          >
            View all deals →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
