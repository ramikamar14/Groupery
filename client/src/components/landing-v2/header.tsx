"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "./logo";

export function Header() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t("v2.navHowItWorks"), href: "#how-it-works" },
    { label: t("v2.navCategories"), href: "#categories" },
    { label: t("v2.navTrust"), href: "#trust" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-xl"
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
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Button variant="ghost" className="hidden sm:inline-flex rounded-full" asChild data-testid="button-sign-in-secondary">
            <a href="/api/login">{t("landing.signIn")}</a>
          </Button>
          <Button
            className="rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
            asChild
            data-testid="button-get-started-header"
          >
            <a href="/api/login">{t("v2.headerGetStarted")}</a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Menu"
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
                className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/api/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium text-primary"
            >
              {t("landing.signIn")}
            </a>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
