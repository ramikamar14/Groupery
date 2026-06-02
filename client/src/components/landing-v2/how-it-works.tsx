"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const STEPS = [
  {
    n: 1,
    title: "Reserve your spot",
    body: "Commit to a deal with no charge yet. Your spot is held while the group fills up.",
  },
  {
    n: 2,
    title: "Group hits the target",
    body: "Each person who joins moves the meter. Watch it fill in real time.",
  },
  {
    n: 3,
    title: "Price unlocks — everyone saves",
    body: "Hit the target and the wholesale price locks in. Funds release together.",
  },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24"
      style={{ background: "#faf9fc", padding: "72px 0" }}
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 52 }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 800,
              color: "#6d28d9",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 12,
            }}
          >
            {t("v2.howTagline")}
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#191320",
              margin: "0 0 14px",
            }}
            data-testid="text-how-it-works"
          >
            Three steps to wholesale
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#736c80",
              maxWidth: 440,
              margin: "0 auto",
              lineHeight: 1.55,
            }}
          >
            Three simple steps between you and a better price.
          </p>
        </motion.div>

        {/* Steps row */}
        <div className="flex flex-col lg:flex-row items-start gap-8 max-w-4xl mx-auto">
          {STEPS.map((step, i) => (
            <div key={step.n} className="contents">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.14 }}
                className="flex-1"
                data-testid={`card-step-${i}`}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {/* Number badge */}
                  <div
                    style={{
                      flex: "none",
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      background: "#ede9fe",
                      color: "#6d28d9",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#191320",
                        marginBottom: 4,
                      }}
                    >
                      {step.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13.5,
                        color: "#736c80",
                        lineHeight: 1.5,
                      }}
                    >
                      {step.body}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Connector line (desktop only) */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden lg:block"
                  style={{
                    flex: "none",
                    width: 48,
                    height: 1,
                    background: "#ddd6fe",
                    marginTop: 17,
                    alignSelf: "flex-start",
                  }}
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
