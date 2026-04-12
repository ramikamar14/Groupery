"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Logo } from "./logo";
import { Heart, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerColumns = [
    {
      title: t("v2.footerColProduct"),
      links: [
        { label: t("v2.footerLinkHowItWorks"), href: "#how-it-works" },
        { label: t("v2.footerLinkCategories"), href: "#categories" },
        { label: t("v2.footerLinkPricing"), href: "/faq" },
        { label: t("v2.footerLinkMobileApp"), href: "/contact" },
      ],
    },
    {
      title: t("v2.footerColCompany"),
      links: [
        { label: t("v2.footerLinkAbout"), href: "/contact" },
        { label: t("v2.footerLinkCareers"), href: "/contact" },
        { label: t("v2.footerLinkBlog"), href: "/faq" },
        { label: t("v2.footerLinkPress"), href: "/contact" },
      ],
    },
    {
      title: t("v2.footerColSupport"),
      links: [
        { label: t("v2.footerLinkHelp"), href: "/faq" },
        { label: t("v2.footerLinkCommunity"), href: "/" },
        { label: t("v2.footerLinkContact"), href: "/contact" },
        { label: t("v2.footerLinkStatus"), href: "/" },
      ],
    },
    {
      title: t("v2.footerColLegal"),
      links: [
        { label: t("v2.footerLinkPrivacy"), href: "/privacy" },
        { label: t("v2.footerLinkTerms"), href: "/terms" },
        { label: t("v2.footerLinkCookies"), href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden">
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h3 className="text-2xl font-bold font-display text-foreground mb-2">{t("v2.footerStayLoop")}</h3>
            <p className="text-muted-foreground mb-6">{t("v2.footerNewsletterDesc")}</p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  placeholder={t("v2.footerEmailPlaceholder")}
                  className="w-full h-12 pl-12 pr-4 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="rounded-full h-12 px-6 font-semibold">
                {t("v2.footerSubscribe")}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="bg-card border-t py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
            <div className="col-span-2">
              <a href="/">
                <Logo />
              </a>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                {t("v2.footerTagline")} {t("v2.footerTaglineExtra")}
              </p>

              <div className="mt-6 flex gap-3">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {footerColumns.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <h4 className="font-semibold font-display text-foreground mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("#") ? (
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left" data-testid="text-footer">
              &copy; {currentYear} Grouperry. {t("landing.footer")}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {t("v2.footerMadeWith")} <Heart className="size-4 text-red-500 fill-red-500" /> {t("v2.footerForShoppers")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
