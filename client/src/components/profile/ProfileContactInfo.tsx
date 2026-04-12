import { Mail, Phone, Globe, Languages, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  hi: "हिन्दी",
  tr: "Türkçe",
  ru: "Русский",
  nl: "Nederlands",
  pl: "Polski",
  OTHER: "Other",
};

function resolveLanguageLabel(code: string): string {
  return LANGUAGE_LABELS[code] || code;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/50 border border-border hover:border-accent/30 transition-colors">
      <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground truncate">{value}</div>
      </div>
      {badge}
    </div>
  );
}

export function ProfileContactInfo({
  email,
  phone,
  phoneVerified,
  country,
  languageCode,
  onVerifyPhone,
  onAddPhone,
}: {
  email: string;
  phone?: string;
  phoneVerified: boolean;
  country: string;
  languageCode: string;
  onVerifyPhone: () => void;
  onAddPhone: () => void;
}) {
  const { t } = useTranslation();
  const lang = resolveLanguageLabel(languageCode || "en");

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{t("profile.contactInformation")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow icon={Mail} label={t("profile.contactEmail")} value={email} />
        {phone ? (
          <InfoRow
            icon={Phone}
            label={t("profile.phone")}
            value={phone}
            badge={
              <div className="flex items-center gap-2 shrink-0">
                {phoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    {t("profile.verified")}
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full">
                      <ShieldAlert className="w-3 h-3" />
                      {t("profile.phoneUnverifiedBadge")}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onVerifyPhone}
                      className="h-6 text-[10px] px-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                      data-testid="button-verify-phone"
                    >
                      {t("profile.verifyShort")}
                    </Button>
                  </div>
                )}
              </div>
            }
          />
        ) : (
          <button
            type="button"
            className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-muted/50 border border-border hover:border-accent/30 transition-colors text-left"
            onClick={onAddPhone}
            data-testid="button-add-phone"
          >
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg shrink-0">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("profile.phone")}</div>
              <div className="text-sm font-medium text-muted-foreground">{t("profile.addPhone")}</div>
            </div>
          </button>
        )}
        <InfoRow icon={Globe} label={t("profile.country")} value={country || "—"} />
        <InfoRow icon={Languages} label={t("profile.language")} value={lang} />
      </CardContent>
    </Card>
  );
}
