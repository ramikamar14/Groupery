import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoIcon } from "@/components/Logo";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Users, UserPlus, CheckCircle, Handshake,
  Smartphone, ShoppingCart, Tv, Shirt, Sofa, Plane,
  ShieldCheck, Star, Flag, MessageCircle, TrendingUp, Globe,
  Banknote, Sparkles, Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Landing() {
  const { t } = useTranslation();

  const steps = [
    { icon: Users, title: t("landing.step1Title"), desc: t("landing.step1Desc"), num: "01", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { icon: UserPlus, title: t("landing.step2Title"), desc: t("landing.step2Desc"), num: "02", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
    { icon: CheckCircle, title: t("landing.step3Title"), desc: t("landing.step3Desc"), num: "03", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { icon: Handshake, title: t("landing.step4Title"), desc: t("landing.step4Desc"), num: "04", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  ];

  const categories = [
    { icon: Smartphone, title: t("landing.catElectronics"), desc: t("landing.catElectronicsDesc"), color: "bg-blue-500/10 text-blue-600" },
    { icon: ShoppingCart, title: t("landing.catFood"), desc: t("landing.catFoodDesc"), color: "bg-emerald-500/10 text-emerald-600" },
    { icon: Tv, title: t("landing.catSubscriptions"), desc: t("landing.catSubscriptionsDesc"), color: "bg-teal-500/10 text-teal-600" },
    { icon: Shirt, title: t("landing.catFashion"), desc: t("landing.catFashionDesc"), color: "bg-pink-500/10 text-pink-600" },
    { icon: Sofa, title: t("landing.catHome"), desc: t("landing.catHomeDesc"), color: "bg-amber-500/10 text-amber-600" },
    { icon: Plane, title: t("landing.catTravel"), desc: t("landing.catTravelDesc"), color: "bg-cyan-500/10 text-cyan-600" },
  ];

  const trustFeatures = [
    { icon: ShieldCheck, title: t("landing.trustVerifiedTitle"), desc: t("landing.trustVerifiedDesc") },
    { icon: Star, title: t("landing.trustRatingsTitle"), desc: t("landing.trustRatingsDesc") },
    { icon: Flag, title: t("landing.trustModerationTitle"), desc: t("landing.trustModerationDesc") },
    { icon: MessageCircle, title: t("landing.trustChatTitle"), desc: t("landing.trustChatDesc") },
    { icon: Banknote, title: t("landing.noPayments"), desc: t("landing.noPaymentsDesc") },
  ];

  const { data: platformStats } = useQuery<{ activeListings: number; totalMembers: number }>({
    queryKey: ["/api/stats"],
    staleTime: 5 * 60_000,
  });

  const stats = [
    {
      value: platformStats?.activeListings != null
        ? platformStats.activeListings > 0 ? `${platformStats.activeListings}` : "Growing"
        : "—",
      label: t("landing.statsGroups"),
      icon: Users,
    },
    {
      value: platformStats?.totalMembers != null
        ? platformStats.totalMembers > 0 ? `${platformStats.totalMembers}+` : "Early Access"
        : "—",
      label: t("landing.statsMembers"),
      icon: TrendingUp,
    },
    { value: "30%", label: t("landing.statsSaved"), icon: Banknote },
    { value: "Global", label: t("landing.statsCountries"), icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="landing-page">

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5" data-testid="text-brand">
            <LogoIcon size={32} />
            <span className="text-base font-bold font-display tracking-tight">Grouperry</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button asChild size="sm" variant="ghost" data-testid="button-sign-in-secondary">
              <a href="/api/login">{t("landing.signIn")}</a>
            </Button>
            <Button asChild size="sm" data-testid="button-get-started-header">
              <a href="/api/login" className="gap-1.5">
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 right-0 w-80 h-80 bg-foreground/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-secondary/80 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left copy */}
            <motion.div
              className="flex-1 space-y-7 text-center lg:text-start"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium mb-6 inline-flex">
                  <Sparkles className="w-3 h-3 text-primary" />
                  AI-powered group buying
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-[1.1] text-balance"
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                data-testid="text-hero-title"
              >
                {t("landing.heroTitle")}
                <br />
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  {t("landing.heroTitleHighlight")}
                </span>
              </motion.h1>

              <motion.p
                className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed"
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                data-testid="text-hero-subtitle"
              >
                {t("landing.heroSubtitle")}
              </motion.p>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow" data-testid="button-get-started">
                  <a href="/api/login">
                    {t("landing.getStarted")}
                    <ArrowRight className="w-4.5 h-4.5" style={{ width: "1.125rem", height: "1.125rem" }} />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="gap-2" data-testid="button-learn-more">
                  <a href="#how-it-works">
                    See how it works
                  </a>
                </Button>
              </motion.div>

              {/* Trust strip */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-4 justify-center lg:justify-start flex-wrap pt-2"
              >
                <div className="flex -space-x-2">
                  {["🧑", "👩", "👨", "🧑‍💻"].map((e, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs">
                      {e}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {platformStats?.totalMembers != null && platformStats.totalMembers > 0
                      ? `${platformStats.totalMembers}+`
                      : "Growing community of"}
                  </span>{" "}
                  members saving together
                </p>
              </motion.div>
            </motion.div>

            {/* Right visual */}
            <motion.div
              className="flex-1 w-full max-w-lg"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/15 border border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2532&auto=format&fit=crop"
                    alt="Group collaboration"
                    className="w-full h-full object-cover"
                    data-testid="img-hero"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                </div>

                {/* Floating cards */}
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-card border border-border/60 rounded-xl px-4 py-3 shadow-xl"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Save more together</p>
                      <p className="text-[10px] text-muted-foreground">per group deal</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -top-4 -right-4 bg-card border border-border/60 rounded-xl px-4 py-3 shadow-xl"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Group deals</p>
                      <p className="text-[10px] text-muted-foreground">join or start one</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/60 bg-secondary/30 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-2 text-center"
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                data-testid={`stat-${i}`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold font-display text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium mb-4 inline-flex">
              <Zap className="w-3 h-3 text-primary" />
              Simple by design
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-balance" data-testid="text-how-it-works">
              {t("landing.howItWorks")}
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUp} transition={{ duration: 0.4 }}>
                <div className="relative bg-card border border-border/60 rounded-xl p-6 h-full hover:border-border hover:shadow-sm transition-all duration-200" data-testid={`card-step-${i}`}>
                  <span className="absolute top-4 right-4 text-4xl font-display font-bold text-border/60">
                    {step.num}
                  </span>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${step.color}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 sm:py-28 bg-secondary/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-balance" data-testid="text-categories-title">
              {t("landing.categoriesTitle")}
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            {categories.map((cat, i) => (
              <motion.div key={i} variants={fadeUp} transition={{ duration: 0.4 }}>
                <div className="flex items-start gap-4 bg-card border border-border/60 rounded-xl p-5 hover:border-border hover:shadow-sm transition-all duration-200" data-testid={`card-category-${i}`}>
                  <div className={`w-11 h-11 rounded-xl ${cat.color.split(" ")[0]} flex items-center justify-center shrink-0`}>
                    <cat.icon className={`w-5 h-5 ${cat.color.split(" ")[1]}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold mb-1 text-sm">{cat.title}</h3>
                    <p className="text-sm text-muted-foreground leading-snug">{cat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-balance" data-testid="text-trust-title">
              {t("landing.trustTitle")}
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            {trustFeatures.map((feat, i) => (
              <motion.div key={i} variants={fadeUp} transition={{ duration: 0.4 }}>
                <div className="bg-card border border-border/60 rounded-xl p-6 h-full hover:border-border hover:shadow-sm transition-all duration-200" data-testid={`card-trust-${i}`}>
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <feat.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-secondary/25">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <div className="relative bg-gradient-to-br from-foreground to-primary rounded-2xl p-10 sm:p-14 text-center overflow-hidden shadow-2xl shadow-foreground/20">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />
              </div>
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 text-balance" data-testid="text-cta-title">
                  {t("landing.ctaTitle")}
                </h2>
                <p className="text-white/80 mb-8 max-w-xl mx-auto text-sm sm:text-base" data-testid="text-cta-subtitle">
                  {t("landing.ctaSubtitle")}
                </p>
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-foreground hover:bg-white/90 shadow-lg gap-2 font-semibold"
                  data-testid="button-cta"
                >
                  <a href="/api/login">
                    {t("landing.ctaButton")}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <LogoIcon size={24} />
            <span className="font-bold font-display text-sm">Grouperry</span>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-footer">
            &copy; {new Date().getFullYear()} Grouperry. {t("landing.footer")}
          </p>
        </div>
      </footer>
    </div>
  );
}
