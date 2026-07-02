"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Mail, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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
  const [formOpen, setFormOpen] = useState(false);

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
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        status?: string;
        message?: string;
      };
      if (res.status === 400) {
        toast({ title: t("newsletter.invalid"), variant: "destructive" });
        return;
      }
      if (!res.ok) {
        toast({ title: t("newsletter.error"), description: data.message, variant: "destructive" });
        return;
      }
      try {
        localStorage.setItem(NEWSLETTER_SUBSCRIBED_KEY, "1");
      } catch { /* ignore */ }
      setSubscribed(true);
      toast({ title: data.status === "already_subscribed" ? t("newsletter.already") : t("newsletter.success") });
      setEmail("");
    } catch {
      toast({ title: t("newsletter.error"), variant: "destructive" });
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background border-y border-border/40">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 size-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
            <Users className="size-3.5" aria-hidden />
            Buy together, save together
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-foreground mb-4 text-balance">
            Ready to save together?
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Split the cost of plans, licenses, and bulk orders with your community — you're only charged when the group fills.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button
              size="lg"
              className="rounded-full h-14 px-8 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 group"
              asChild
            >
              <a href="/api/login" className="inline-flex items-center justify-center">
                Start a Group Buy
                <ArrowRight className="ml-2 size-5 shrink-0 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full h-14 px-8 text-base font-semibold border-2"
              asChild
            >
              <Link href="/" className="inline-flex items-center justify-center">
                Browse Active Deals
              </Link>
            </Button>
          </div>

          {/* Newsletter — secondary, collapsible */}
          <div className="border-t border-border/40 pt-8">
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2 text-center"
                data-testid="newsletter-subscribed-state"
              >
                <CheckCircle2 className="size-8 text-primary" aria-hidden />
                <p className="text-sm font-medium text-foreground">{t("newsletter.success")}</p>
                <p className="text-xs text-muted-foreground">{t("newsletter.subscribedPersist")}</p>
              </motion.div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setFormOpen((o) => !o)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                >
                  {formOpen ? "Hide newsletter" : "Get deal updates by email instead →"}
                </button>

                <AnimatePresence>
                  {formOpen && (
                    <motion.form
                      key="newsletter-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                      onSubmit={onSubmit}
                    >
                      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-5">
                        <div className="flex-1 relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                          <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(ev) => setEmail(ev.target.value)}
                            placeholder={t("v2.footerEmailPlaceholder")}
                            disabled={pending}
                            className="w-full h-11 pl-11 pr-4 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                            data-testid="input-newsletter-email"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="rounded-full h-11 px-6 font-semibold text-sm"
                          disabled={pending}
                          data-testid="button-newsletter-submit"
                        >
                          {t("v2.footerSubscribe")}
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
