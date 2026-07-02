import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { X, Users, Lock, BadgeCheck, ArrowRight } from "lucide-react";

const STORAGE_KEY = "grouperry-explainer-dismissed";

/**
 * First-visit explainer strip for the discovery surface.
 * Explains the group-buy model in three beats and links to /how-it-works.
 * Dismissal is persisted in localStorage.
 */
export function FirstVisitExplainer() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  const steps = [
    {
      icon: <Users className="w-4 h-4" aria-hidden />,
      text: t("discover.explainerStep1", "Join a group for a plan or product"),
    },
    {
      icon: <Lock className="w-4 h-4" aria-hidden />,
      text: t("discover.explainerStep2", "You're only charged when the group fills"),
    },
    {
      icon: <BadgeCheck className="w-4 h-4" aria-hidden />,
      text: t("discover.explainerStep3", "Funds held in escrow until delivery"),
    },
  ];

  return (
    <div
      className="relative mb-6 rounded-2xl border border-primary/15 overflow-hidden"
      style={{ background: "linear-gradient(120deg, rgba(109,40,217,0.06), rgba(109,40,217,0.02))" }}
      data-testid="first-visit-explainer"
      role="region"
      aria-label={t("discover.explainerAria", "How group buying works")}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 p-4 pr-12 md:px-5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary shrink-0">
          {t("discover.explainerTag", "New here?")}
        </span>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-6 sm:gap-y-2 flex-1 min-w-0">
          {steps.map((step, i) => (
            <span key={i} className="flex items-center gap-2 text-[13px] font-medium text-foreground/80">
              <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {step.icon}
              </span>
              {step.text}
            </span>
          ))}
        </div>
        <Link
          href="/how-it-works"
          className="inline-flex items-center gap-1 text-[13px] font-bold text-primary hover:underline shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          data-testid="link-explainer-how-it-works"
        >
          {t("discover.explainerLink", "How it works")}
          <ArrowRight className="w-3.5 h-3.5" aria-hidden />
        </Link>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("discover.explainerDismiss", "Dismiss explainer")}
        title={t("discover.explainerDismiss", "Dismiss explainer")}
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        data-testid="button-dismiss-explainer"
      >
        <X className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
}
