import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Banknote, CheckCircle2 } from "lucide-react";

type ConnectStatus = { enabled: boolean; payoutsEnabled: boolean; onboarded?: boolean };

/** Lets an organizer onboard to Stripe Connect so they can receive payouts. */
export function PayoutOnboarding() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [redirecting, setRedirecting] = useState(false);

  const { data, isLoading } = useQuery<ConnectStatus>({
    queryKey: ["/api/billing/connect/status"],
  });

  if (isLoading) return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  if (!data?.enabled) return null; // payments not configured — hide entirely

  const startOnboarding = async () => {
    setRedirecting(true);
    try {
      const res = await apiRequest("POST", "/api/billing/connect/onboard");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      toast({ title: t("billing.payoutError", "Could not start payout setup"), variant: "destructive" });
      setRedirecting(false);
    }
  };

  if (data.payoutsEnabled) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-4" />
        {t("billing.payoutsActive", "Payouts active — you'll receive funds when your deals complete.")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {t("billing.payoutPrompt", "Set up payouts to automatically receive funds (minus platform fee) when your group deals complete.")}
      </p>
      <Button onClick={startOnboarding} disabled={redirecting} variant="outline" className="gap-2">
        {redirecting ? <Loader2 className="size-4 animate-spin" /> : <Banknote className="size-4" />}
        {data.onboarded ? t("billing.finishPayoutSetup", "Finish payout setup") : t("billing.setUpPayouts", "Set up payouts")}
      </Button>
    </div>
  );
}
