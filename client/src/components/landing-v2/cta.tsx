"use client";

import { motion } from "framer-motion";

export function CTA() {
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
          Save more when you shop together
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
          Join thousands saving 30–60% on everyday purchases
        </p>
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
          Get started free →
        </a>
      </div>
    </motion.section>
  );
}
