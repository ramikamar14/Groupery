import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqItems = useMemo(() => {
    const raw = t("faq.items", { returnObjects: true });
    if (!Array.isArray(raw)) return [];
    return raw.filter(isFaqItemRow);
  }, [t, i18n.language]);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">{t("faq.title")}</h1>
          <p className="text-muted-foreground">{t("faq.subtitle")}</p>
        </div>

        <div className="space-y-3">
          {faqItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10" data-testid="faq-empty">
              {t("faq.emptyState")}
            </p>
          ) : null}
          {faqItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => toggleExpanded(item.id)}
              data-testid={`faq-item-${item.id}`}
            >
              <div className="p-6 flex items-start justify-between gap-4">
                <h3 className="font-semibold text-lg flex-1">{item.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 mt-1 flex-shrink-0 transition-transform ${
                    expandedId === item.id ? "rotate-180" : ""
                  }`}
                />
              </div>

              {expandedId === item.id && (
                <div className="px-6 pb-6 pt-0 text-muted-foreground border-t border-border/50">
                  {item.answer}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
