import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
              <h1 className="text-2xl font-bold text-foreground">{t("notFound.title")}</h1>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">{t("notFound.description")}</p>

            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <Button variant="outline" asChild>
                <Link href="/explore">{t("notFound.browse")}</Link>
              </Button>
              <Button asChild>
                <Link href="/">{t("notFound.home")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
