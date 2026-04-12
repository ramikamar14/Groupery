import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Smartphone,
  ShoppingCart,
  Tv,
  Shirt,
  Sofa,
  Plane,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface Category {
  icon: LucideIcon;
  title: string;
  desc: string;
  chip: string;
}

export function LandingCategories() {
  const { t } = useTranslation();

  const categories: Category[] = [
    {
      icon: Smartphone,
      title: t("landing.catElectronics"),
      desc: t("landing.catElectronicsDesc"),
      chip: "bg-primary text-primary-foreground",
    },
    {
      icon: ShoppingCart,
      title: t("landing.catFood"),
      desc: t("landing.catFoodDesc"),
      chip: "bg-accent text-accent-foreground",
    },
    {
      icon: Tv,
      title: t("landing.catSubscriptions"),
      desc: t("landing.catSubscriptionsDesc"),
      chip: "bg-secondary text-secondary-foreground",
    },
    {
      icon: Shirt,
      title: t("landing.catFashion"),
      desc: t("landing.catFashionDesc"),
      chip: "bg-muted text-foreground",
    },
    {
      icon: Sofa,
      title: t("landing.catHome"),
      desc: t("landing.catHomeDesc"),
      chip: "bg-primary text-primary-foreground",
    },
    {
      icon: Plane,
      title: t("landing.catTravel"),
      desc: t("landing.catTravelDesc"),
      chip: "bg-accent text-accent-foreground",
    },
  ];

  return (
    <section
      className="landing-section border-b border-border bg-muted/40"
      aria-labelledby="categories-heading"
    >
      <div className="landing-container">
        <motion.div
          className="mx-auto mb-8 max-w-2xl text-center sm:mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
        >
          <h2 id="categories-heading" className="landing-heading-section" data-testid="text-categories-title">
            {t("landing.categoriesTitle")}
          </h2>
          <p className="landing-section-intro mt-3 sm:mt-4">{t("landing.categoriesLead")}</p>
        </motion.div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 pt-0.5 scrollbar-hide sm:-mx-6 sm:gap-4 sm:px-6 lg:hidden lg:mx-0 lg:px-0">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              className="w-[min(calc(100vw-2.5rem),280px)] shrink-0 snap-center sm:w-[min(100%,280px)] sm:snap-start"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <Card className="landing-card h-full gap-0" data-testid={`card-category-mobile-${i}`}>
                <CardContent className="landing-card-content flex min-w-0 items-start gap-3 sm:gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cat.chip}`}
                  >
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="mb-1 text-base font-bold leading-snug text-foreground">
                      {cat.title}
                    </CardTitle>
                    <CardDescription className="text-pretty text-sm leading-relaxed text-muted-foreground/95">
                      {cat.desc}
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="hidden grid-cols-3 gap-5 lg:grid lg:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {categories.map((cat, i) => (
            <motion.div key={cat.title} variants={fadeUp} transition={{ duration: 0.4 }}>
              <Card className="landing-card h-full gap-0" data-testid={`card-category-${i}`}>
                <CardContent className="landing-card-content flex min-w-0 items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cat.chip}`}
                  >
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="mb-1 text-base font-bold leading-snug text-foreground">
                      {cat.title}
                    </CardTitle>
                    <CardDescription className="text-pretty text-sm leading-relaxed text-muted-foreground/95">
                      {cat.desc}
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
