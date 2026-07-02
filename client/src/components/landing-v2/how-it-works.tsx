"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function HowItWorks() {
  const { t } = useTranslation();

  const STEPS = [
    {
      n: 1,
      title: t("v2.howStep1Title", "Join or start a group"),
      body: t(
        "v2.howStep1Body",
        "Find a group splitting a SaaS plan, AI tool, or software license — or start your own. No charge yet, your spot is just reserved."
      ),
    },
    {
      n: 2,
      title: t("v2.howStep2Title", "Group fills, everyone pays their share"),
      body: t(
        "v2.howStep2Body",
        "Once enough people join, each member is charged their share of the plan. If the group doesn't fill, nobody is charged."
      ),
    },
    {
      n: 3,
      title: t("v2.howStep3Title", "Seats delivered, funds released"),
      body: t(
        "v2.howStep3Body",
        "The organiser distributes seats or license keys to the group, and funds are released. Didn't get access? You're refunded."
      ),
    },
  ];

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
            {t("v2.howTitle")}
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
            {t("v2.howSubtitle", "From joining a group to getting your seat — here's the whole flow.")}
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
                  {/* Number badge — violet-50 square with violet-700 text */}
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

        {/* Link to the full guide page */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginTop: 40 }}
        >
          <a
            href="/how-it-works"
            style={{ fontSize: 14, fontWeight: 700, color: "#6d28d9", textDecoration: "none" }}
            data-testid="link-how-it-works-full"
          >
            {t("v2.howFullGuide", "Read the full guide →")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
