import { useTranslation } from "react-i18next";
import { LogoIcon } from "@/components/Logo";

interface FooterLink {
  labelKey: string;
  href: string;
}

interface FooterLinks {
  product: FooterLink[];
  company: FooterLink[];
  resources: FooterLink[];
  legal: FooterLink[];
}

const footerLinks: FooterLinks = {
  product: [
    { labelKey: "landing.footerProductFeatures", href: "#" },
    { labelKey: "landing.footerProductHowItWorks", href: "#how-it-works" },
    { labelKey: "landing.footerProductPricing", href: "#" },
    { labelKey: "landing.footerProductFaq", href: "#" },
  ],
  company: [
    { labelKey: "landing.footerCompanyAbout", href: "#" },
    { labelKey: "landing.footerCompanyBlog", href: "#" },
    { labelKey: "landing.footerCompanyCareers", href: "#" },
    { labelKey: "landing.footerCompanyPress", href: "#" },
  ],
  resources: [
    { labelKey: "landing.footerResourcesHelp", href: "#" },
    { labelKey: "landing.footerResourcesCommunity", href: "#" },
    { labelKey: "landing.footerResourcesGuidelines", href: "#" },
    { labelKey: "landing.footerResourcesApi", href: "#" },
  ],
  legal: [
    { labelKey: "landing.footerLegalPrivacy", href: "#" },
    { labelKey: "landing.footerLegalTerms", href: "#" },
    { labelKey: "landing.footerLegalCookies", href: "#" },
    { labelKey: "landing.footerLegalLicenses", href: "#" },
  ],
};

function FooterColumn({
  titleKey,
  links,
}: {
  titleKey: string;
  links: FooterLink[];
}) {
  const { t } = useTranslation();
  return (
    <div className="min-w-0">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/80 sm:mb-4">
        {t(titleKey)}
      </h4>
      <ul className="space-y-0.5 sm:space-y-1">
        {links.map((link) => (
          <li key={link.labelKey}>
            <a
              href={link.href}
              className="landing-link-motion flex min-h-11 items-center text-pretty text-sm leading-snug text-muted-foreground hover:text-foreground sm:min-h-0 sm:inline-flex sm:py-1"
            >
              {t(link.labelKey)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="landing-section border-t-2 border-border bg-muted/50">
      <div className="landing-container">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-5 lg:gap-12">
          <div className="max-w-md sm:col-span-2 lg:col-span-1 lg:max-w-xs">
            <div className="mb-3 flex items-center gap-2.5 sm:mb-4">
              <LogoIcon size={32} />
              <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                {t("landing.brandName")}
              </span>
            </div>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {t("landing.footerTagline")}
            </p>
          </div>

          <FooterColumn titleKey="landing.footerColumnProduct" links={footerLinks.product} />
          <FooterColumn titleKey="landing.footerColumnCompany" links={footerLinks.company} />
          <FooterColumn titleKey="landing.footerColumnResources" links={footerLinks.resources} />
          <FooterColumn titleKey="landing.footerColumnLegal" links={footerLinks.legal} />
        </div>

        <div className="mt-10 flex flex-col items-stretch gap-6 border-t border-border pt-8 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-pretty text-center text-sm text-muted-foreground sm:text-left"
            data-testid="text-footer"
          >
            &copy; {currentYear} {t("landing.brandName")}. {t("landing.footer")}
          </p>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-6">
            <a
              href="#"
              className="landing-link-motion flex min-h-11 items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground sm:min-h-0 sm:justify-start sm:py-1"
            >
              {t("landing.footerBottomPrivacy")}
            </a>
            <a
              href="#"
              className="landing-link-motion flex min-h-11 items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground sm:min-h-0 sm:justify-start sm:py-1"
            >
              {t("landing.footerBottomTerms")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
