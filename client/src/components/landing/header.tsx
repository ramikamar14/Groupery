import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe } from "lucide-react";
import { LogoIcon } from "@/components/Logo";

function LanguageSwitcher() {
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="landing-btn-motion h-11 min-w-[44px] gap-1.5 px-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground sm:h-9 sm:min-w-0"
    >
      <Globe className="h-4 w-4 shrink-0" />
      <span className="hidden text-xs font-medium sm:inline">{t("landing.headerLang")}</span>
    </Button>
  );
}

export function LandingHeader() {
  const { t } = useTranslation();

  return (
    <header className="glass sticky top-0 z-50 border-b border-border">
      <div className="landing-container flex min-h-[3.5rem] items-center justify-between gap-2 py-1 sm:h-16 sm:min-h-0 sm:gap-4 sm:py-0">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5" data-testid="text-brand">
          <LogoIcon size={32} />
          <span className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
            {t("landing.brandName")}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <LanguageSwitcher />
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="landing-touch-target landing-btn-motion h-11 px-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground sm:h-9 sm:min-h-0 sm:px-3"
            data-testid="button-sign-in-secondary"
          >
            <a href="/api/login">{t("landing.signIn")}</a>
          </Button>
          <Button
            asChild
            size="sm"
            className="landing-touch-target landing-btn-motion h-11 gap-1.5 bg-foreground px-4 text-sm font-semibold text-background shadow-md ring-2 ring-foreground/15 hover:bg-foreground/90 hover:shadow-lg active:scale-[0.98] sm:h-9 sm:min-h-0 sm:px-3"
            data-testid="button-get-started-header"
          >
            <a href="/api/login" className="flex items-center justify-center gap-1.5 px-0.5">
              <span className="text-center text-xs font-semibold leading-tight sm:text-sm">
                {t("landing.headerGetStarted")}
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
