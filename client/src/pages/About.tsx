import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, Wallet, ArrowRight } from "lucide-react";

export default function About() {
  const { t } = useTranslation();

  const values: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }[] = [
    {
      icon: Users,
      title: t("about.value1Title", "Strength in numbers"),
      body: t("about.value1Body", "The best software prices are built for teams. We help communities reach those tiers together."),
    },
    {
      icon: ShieldCheck,
      title: t("about.value2Title", "Protection by default"),
      body: t("about.value2Body", "Escrow-style protection means funds are only charged when a group fills and released after delivery."),
    },
    {
      icon: Wallet,
      title: t("about.value3Title", "Fair, transparent pricing"),
      body: t("about.value3Body", "Everyone pays only their share, and you always see your total before you commit."),
    },
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">{t("about.title")}</h1>
          <p className="text-muted-foreground text-lg">{t("about.subtitle")}</p>
        </div>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p className="text-foreground font-medium">{t("about.lead")}</p>
          <p>{t("about.body1")}</p>
          <p>{t("about.body2")}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {values.map(({ icon: Icon, title, body }) => (
            <div key={title} className="gp-card p-6 flex flex-col gap-3 h-full">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl gp-chip gp-chip-soft">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold font-display">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold font-display mb-2">{t("about.missionTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("about.missionBody")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="default" asChild>
            <Link href="/how-it-works">
              {t("about.ctaHiw", "How it works")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/faq">{t("about.ctaFaq")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">{t("about.ctaContact")}</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
