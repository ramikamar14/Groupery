"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { Link } from "wouter";
import { Logo } from "./logo";

/** SVG icon components for social platforms */
function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "X / Twitter", href: "#", Icon: TwitterXIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "LinkedIn", href: "#", Icon: LinkedInIcon },
];

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerColumns = [
    {
      title: "Product",
      links: [
        { label: "Explore Deals", href: "/explore" },
        { label: "Create a Group Buy", href: "/create" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "How it Works", href: "#how-it-works" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "#" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "FAQ", href: "/faq" },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden">
      <div className="bg-card border-t py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand column — spans 2 cols on md+ */}
            <div className="col-span-2">
              <Link href="/">
                <Logo />
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                Shop together, save together. Join thousands of smart buyers already winning with group deals.
              </p>

              {/* Social links */}
              <div className="flex items-center gap-3 mt-6">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="size-9 rounded-xl bg-muted hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-200"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
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
                    <li key={`${section.title}-${link.label}`}>
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

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              className="text-sm text-muted-foreground text-center md:text-left"
              data-testid="text-footer"
            >
              &copy; {currentYear} Grouperry. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {t("v2.footerMadeWith")} <Heart className="size-4 text-red-500 fill-red-500" aria-hidden />{" "}
              {t("v2.footerForShoppers")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
