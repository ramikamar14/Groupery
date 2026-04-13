"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { Link } from "wouter";
import { Logo } from "./logo";
import { NewsletterSection } from "./newsletter-section";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerColumns = [
    {
      title: t("v2.footerColProduct"),
      links: [
        { label: t("v2.footerLinkHowItWorks"), href: "#how-it-works" },
        { label: t("v2.footerLinkCategories"), href: "#categories" },
      ],
    },
    {
      title: t("v2.footerColCompany"),
      links: [{ label: t("v2.footerLinkAbout"), href: "/about" }],
    },
    {
      title: t("v2.footerColSupport"),
      links: [
        { label: t("v2.footerLinkHelp"), href: "/faq" },
        { label: t("v2.footerLinkContact"), href: "/contact" },
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
      <NewsletterSection />
      <div className="bg-card border-t py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
            <div className="col-span-2">
              <Link href="/">
                <Logo />
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                {t("v2.footerTagline")} {t("v2.footerTaglineExtra")}
              </p>
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
                    <li key={`${section.title}-${link.label}-${link.href}`}>
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
