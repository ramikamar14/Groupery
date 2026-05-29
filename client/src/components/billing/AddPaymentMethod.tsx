import { useEffect, useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTranslation } from "react-i18next";
import { getStripe } from "@/lib/stripe";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";

function SetupForm({ onSaved }: { onSaved: () => void }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error } = await stripe.confirmSetup({ elements, redirect: "if_required" });
    setSubmitting(false);
    if (error) {
      toast({ title: t("billing.cardError", "Could not save card"), description: error.message, variant: "destructive" });
      return;
    }
    await apiRequest("POST", "/api/billing/payment-method").catch(() => {});
    toast({ title: t("billing.cardSaved", "Card saved") });
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || submitting} className="w-full">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
        {t("billing.saveCard", "Save card")}
      </Button>
    </form>
  );
}

/** Collects and saves a buyer's card via a SetupIntent (charged later on completion). */
export function AddPaymentMethod({ onSaved }: { onSaved?: () => void }) {
  const { t } = useTranslation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest("POST", "/api/billing/setup-intent")
      .then((r) => r.json())
      .then((d) => { if (active) setClientSecret(d.clientSecret); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (saved) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-4" /> {t("billing.cardOnFile", "Card on file")}
      </div>
    );
  }
  if (loading) return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  if (!clientSecret) return <p className="text-sm text-muted-foreground">{t("billing.unavailable", "Payments are not available right now.")}</p>;

  return (
    <Elements stripe={getStripe()} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <SetupForm onSaved={() => { setSaved(true); onSaved?.(); }} />
    </Elements>
  );
}
