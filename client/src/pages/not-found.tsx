import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center space-y-6 max-w-sm mx-auto px-6">
          <div className="text-8xl font-black font-display text-primary/20 select-none">404</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-display">{t("notFound.title")}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">{t("notFound.description")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                {t("notFound.home")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Search className="w-4 h-4 mr-2" />
                {t("notFound.browse")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
