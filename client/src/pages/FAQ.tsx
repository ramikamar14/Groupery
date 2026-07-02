import { useMemo } from "react";
import { Layout } from "@/components/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { HelpCircle } from "lucide-react";

interface FAQItemRow {
  id: string;
  question: string;
  answer: string;
}

function isFaqItemRow(x: unknown): x is FAQItemRow {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.question === "string" && typeof o.answer === "string";
}

export default function FAQ() {
  const { t, i18n } = useTranslation();

  // Core items shipped in the translation bundle.
  const baseItems = useMemo(() => {
    const raw = t("faq.items", { returnObjects: true });
    if (!Array.isArray(raw)) return [];
    return raw.filter(isFaqItemRow);
  }, [t, i18n.language]);

  // Group-buy specific questions (the wedge): payments, protection, legitimacy, fees.
  const wedgeItems = useMemo<FAQItemRow[]>(
    () => [
      {
        id: "w-splitting",
        question: t("faq.wedge.splittingQ", "How does splitting a SaaS or software plan actually work?"),
        answer: t(
          "faq.wedge.splittingA",
          "An organiser opens a group buy for a plan that's priced for teams. Enough people join to reach the seat count that unlocks the group price, then the cost is split fairly across everyone. Each member pays only their share, the organiser sets everyone up on the plan, and everyone benefits from the lower per-seat price.",
        ),
      },
      {
        id: "w-protection",
        question: t("faq.wedge.protectionQ", "How is my money protected?"),
        answer: t(
          "faq.wedge.protectionA",
          "On escrow-protected deals, Grouperry holds funds securely and only releases them to the organiser after your access has been delivered. You're not charged just for reserving a seat — payment is taken when the group fills, and held until delivery is confirmed.",
        ),
      },
      {
        id: "w-charged-when",
        question: t("faq.wedge.chargedQ", "When exactly am I charged?"),
        answer: t(
          "faq.wedge.chargedA",
          "You're only charged once the group reaches the size needed to unlock the group price. Reserving a seat before that point is free and carries no commitment to pay if the group never fills.",
        ),
      },
      {
        id: "w-refunds",
        question: t("faq.wedge.refundsQ", "What happens if the group doesn't fill, or a deal falls through?"),
        answer: t(
          "faq.wedge.refundsA",
          "If a group never reaches its target, or a deal falls through before access is delivered, your share is refunded. Because funds are held in escrow until delivery, you're not left out of pocket when things don't complete.",
        ),
      },
      {
        id: "w-verification",
        question: t("faq.wedge.verificationQ", "How do I know I can trust the organiser?"),
        answer: t(
          "faq.wedge.verificationA",
          "Organisers can complete identity verification, shown as a badge on their profile and listings. Combined with escrow protection — where funds are only released after delivery — this means you can see who you're pooling with and know your money is protected until you get your seat.",
        ),
      },
      {
        id: "w-legit",
        question: t("faq.wedge.legitQ", "Is buying and sharing team seats allowed?"),
        answer: t(
          "faq.wedge.legitA",
          "Many software and SaaS products are explicitly sold as team, family, or multi-seat plans that are meant to be shared. Grouperry is designed for these legitimate group and team plans. Organisers and members are responsible for staying within the provider's own terms of service for the specific product being pooled — if a plan doesn't permit sharing, it shouldn't be listed.",
        ),
      },
      {
        id: "w-fees",
        question: t("faq.wedge.feesQ", "Are there any fees?"),
        answer: t(
          "faq.wedge.feesA",
          "Reserving and joining a group is free. Any service or payment-processing fees that apply to a deal are shown clearly before you confirm, so you always know your total share before you commit.",
        ),
      },
    ],
    [t, i18n.language],
  );

  const items = useMemo(() => [...wedgeItems, ...baseItems], [wedgeItems, baseItems]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">{t("faq.title")}</h1>
          <p className="text-muted-foreground text-lg">{t("faq.subtitle")}</p>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10" data-testid="faq-empty">
            {t("faq.emptyState")}
          </p>
        ) : (
          <div className="gp-card px-6 py-2">
            <Accordion type="single" collapsible className="w-full">
              {items.map((item) => (
                <AccordionItem key={item.id} value={item.id} data-testid={`faq-item-${item.id}`} className="last:border-b-0">
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-[15px]">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        <div className="gp-card p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl gp-chip gp-chip-soft flex-shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg font-display">{t("faq.stillTitle", "Still need a hand?")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("faq.stillBody", "Learn how group buying works, or get in touch with our team.")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 flex-shrink-0">
            <Button variant="outline" asChild>
              <Link href="/how-it-works">{t("faq.stillHiw", "How it works")}</Link>
            </Button>
            <Button asChild>
              <Link href="/contact">{t("faq.stillContact", "Contact us")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
