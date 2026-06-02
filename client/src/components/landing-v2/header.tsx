"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "./logo";

interface HeaderProps {
  transparent?: boolean;
}

export function Header({ transparent = false }: HeaderProps) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t("v2.navHowItWorks"), href: "#how-it-works" },
    { label: t("v2.navCategories"), href: "#categories" },
    { label: t("v2.navTrust"), href: "#trust" },
    { label: t("v2.navAbout"), href: "/about" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-6">
        <a href="/" className="min-w-0">
          <Logo />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{ fontSize: 14, fontWeight: 500, color: "#736c80", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#191320"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#736c80"; }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            className="hidden sm:inline-flex rounded-full"
            asChild
            data-testid="button-sign-in-secondary"
          >
            <a href="/api/login">{t("landing.signIn")}</a>
          </Button>
          <a
            href="/api/login"
            data-testid="button-get-started-header"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#6d28d9",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              padding: "9px 20px",
              borderRadius: 999,
              textDecoration: "none",
              boxShadow: "0 4px 14px -4px rgba(109,40,217,0.45)",
              transition: "box-shadow 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.boxShadow = "0 8px 24px -4px rgba(109,40,217,0.6)";
              el.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.boxShadow = "0 4px 14px -4px rgba(109,40,217,0.45)";
              el.style.transform = "translateY(0)";
            }}
          >
            {t("v2.headerGetStarted")}
          </a>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={t("common.menu")}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border/50 bg-background"
        >
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#736c80",
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/api/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: "#6d28d9",
                textDecoration: "none",
              }}
            >
              {t("landing.signIn")}
            </a>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
