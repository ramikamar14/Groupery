"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

const NEWSLETTER_SUBSCRIBED_KEY = "grouperry_newsletter_subscribed";

function readNewsletterSubscribedFlag(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(NEWSLETTER_SUBSCRIBED_KEY) === "1";
  } catch {
    return false;
  }
}

export function NewsletterSection() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [subscribed, setSubscribed] = useState(readNewsletterSubscribedFlag);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      toast({ title: t("newsletter.invalid"), variant: "destructive" });
      return;
    }
    const at = trimmed.indexOf("@");
    if (at <= 0 || at >= trimmed.length - 1) {
      toast({ title: t("newsletter.invalid"), variant: "destructive" });
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, locale: i18n.language }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; status?: string; message?: string };
      if (res.status === 400) {
        toast({ title: t("newsletter.invalid"), variant: "destructive" });
        return;
      }
      if (!res.ok) {
        toast({
          title: t("newsletter.error"),
          description: data.message,
          variant: "destructive",
        });
        return;
      }
      if (data.status === "already_subscribed") {
        try {
          localStorage.setItem(NEWSLETTER_SUBSCRIBED_KEY, "1");
        } catch { /* ignore */ }
        setSubscribed(true);
        toast({ title: t("newsletter.already") });
      } else {
        try {
          localStorage.setItem(NEWSLETTER_SUBSCRIBED_KEY, "1");
        } catch { /* ignore */ }
        setSubscribed(true);
        toast({ title: t("newsletter.success") });
        setEmail("");
      }
    } catch {
      toast({ title: t("newsletter.error"), variant: "destructive" });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="bg-muted/50 py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h3 className="text-2xl font-bold font-display text-foreground mb-2">{t("v2.footerStayLoop")}</h3>
          {subscribed ? (
            <div className="flex flex-col items-center gap-3 max-w-md mx-auto text-center" data-testid="newsletter-subscribed-state">
              <CheckCircle2 className="size-10 text-primary shrink-0" aria-hidden />
              <p className="text-foreground font-medium">{t("newsletter.success")}</p>
              <p className="text-sm text-muted-foreground">{t("newsletter.subscribedPersist")}</p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">{t("v2.footerNewsletterDesc")}</p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={onSubmit}>
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder={t("v2.footerEmailPlaceholder")}
                    disabled={pending}
                    className="w-full h-12 pl-12 pr-4 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    data-testid="input-newsletter-email"
                  />
                </div>
                <Button type="submit" className="rounded-full h-12 px-6 font-semibold" disabled={pending} data-testid="button-newsletter-submit">
                  {t("v2.footerSubscribe")}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
