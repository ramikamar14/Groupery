import { Link } from "wouter";
import { LogoIcon } from "./Logo";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-card/30 mt-auto" data-testid="footer">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <LogoIcon size={28} />
              <span className="font-bold font-display text-base tracking-tight">{t("landing.brandName")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px]">{t("footer.tagline")}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">{t("footer.platform")}</p>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-explore">
                  {t("footer.exploreDeals")}
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-create">
                  {t("footer.createGroup")}
                </Link>
              </li>
              <li>
                <Link href="/my-groups" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-mygroups">
                  {t("footer.myGroups")}
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-saved">
                  {t("footer.savedListings")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">{t("footer.support")}</p>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-how-it-works">
                  {t("footer.howItWorks", "How it works")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-faq">
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-about">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-contact">
                  {t("footer.contact")}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-profile">
                  {t("footer.yourAccount")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">{t("footer.legal")}</p>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-terms">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-privacy">
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 pt-6 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground flex flex-wrap items-center justify-center sm:justify-start gap-1 text-center sm:text-left">
            <span>{t("footer.copyrightYear", { year: currentYear })}</span>
            <span>{t("footer.madeWith")}</span>
            <Heart className="w-3 h-3 text-destructive fill-destructive shrink-0" />
            <span>{t("footer.forGroupBuyers")}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
