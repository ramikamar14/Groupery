import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function About() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">{t("about.title")}</h1>
          <p className="text-muted-foreground text-lg">{t("about.subtitle")}</p>
        </div>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p className="text-foreground font-medium">{t("about.lead")}</p>
          <p>{t("about.body1")}</p>
          <p>{t("about.body2")}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold font-display mb-2">{t("about.missionTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("about.missionBody")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="default" asChild>
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
