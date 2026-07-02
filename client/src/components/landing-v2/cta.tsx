"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

export function CTA() {
  const { t } = useTranslation();

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ background: "linear-gradient(160deg, #6d28d9, #3b1379)", padding: "80px 24px" }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            color: "#fff",
            fontSize: "clamp(2rem,4vw,3rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 16,
          }}
          data-testid="text-cta-title"
        >
          {t("v2.ctaTitle", "Split the cost of the tools you already pay for")}
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 18,
            marginBottom: 40,
            lineHeight: 1.55,
          }}
          data-testid="text-cta-subtitle"
        >
          {t("v2.ctaSubtitle", "Join a group for a SaaS plan, license, or subscription — you're only charged if enough people join.")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="/api/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              color: "#6d28d9",
              fontWeight: 700,
              fontSize: 16,
              padding: "14px 32px",
              borderRadius: 999,
              textDecoration: "none",
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            }}
            data-testid="button-cta"
          >
            {t("v2.ctaButton", "Get started free")}
            <ArrowRight style={{ width: 18, height: 18, flexShrink: 0 }} aria-hidden />
          </a>
          <a
            href="/how-it-works"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              padding: "13px 24px",
              borderRadius: 999,
              textDecoration: "none",
              border: "1.5px solid rgba(255,255,255,0.3)",
            }}
            data-testid="button-cta-how"
          >
            {t("v2.seeHowItWorks", "See how it works")}
          </a>
        </div>
      </div>
    </motion.section>
  );
}
