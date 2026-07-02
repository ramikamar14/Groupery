import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Search,
  Users,
  PackageCheck,
  PlusCircle,
  Share2,
  Truck,
  Wallet,
  ShieldCheck,
  RotateCcw,
  BadgeCheck,
  Cloud,
  Sparkles,
  GraduationCap,
  KeyRound,
  LayoutGrid,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

type Step = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
};

function StepCard({ index, step }: { index: number; step: Step }) {
  const Icon = step.icon;
  return (
    <div className="gp-card p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl text-white"
          style={{ background: "linear-gradient(180deg, var(--v-500), var(--v-700))" }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-3xl font-bold font-display text-muted-foreground/30 tabular-nums">
          {String(index).padStart(2, "0")}
        </span>
      </div>
      <div className="space-y-1.5">
        <h3 className="font-semibold text-lg font-display">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="gp-card p-6 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-center w-11 h-11 rounded-xl gp-chip gp-chip-soft">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-lg font-display">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

export default function HowItWorks() {
  const { t } = useTranslation();

  const joinerSteps: Step[] = [
    { icon: Search, title: t("hiw.join.s1Title", "Find a deal you want"), body: t("hiw.join.s1Body", "Browse live group buys for the tools you already use — SaaS seats, AI credits, cloud, courses and more. Reserve your seat in one click, no payment upfront.") },
    { icon: Users, title: t("hiw.join.s2Title", "The group fills, you pay your share"), body: t("hiw.join.s2Body", "You're only charged once enough people join to unlock the group price. You pay your share — never the full plan — split fairly across the group.") },
    { icon: PackageCheck, title: t("hiw.join.s3Title", "Seats delivered, funds released"), body: t("hiw.join.s3Body", "The organiser sets everyone up and delivers your access. Only then are the funds released to them. If the group never fills, you're refunded.") },
  ];

  const organiserSteps: Step[] = [
    { icon: PlusCircle, title: t("hiw.org.s1Title", "Create a deal"), body: t("hiw.org.s1Body", "Pick the plan you want to split, set how many seats you need to unlock the group price, and publish your listing in minutes.") },
    { icon: Share2, title: t("hiw.org.s2Title", "Share it to fill"), body: t("hiw.org.s2Body", "Share your deal with your community and on Grouperry. Members reserve seats until the group reaches the size that unlocks the discount.") },
    { icon: Truck, title: t("hiw.org.s3Title", "Deliver access"), body: t("hiw.org.s3Body", "Once the group fills and payments clear, set members up on the plan and confirm delivery so everyone gets their seat.") },
    { icon: Wallet, title: t("hiw.org.s4Title", "Get paid"), body: t("hiw.org.s4Body", "Funds collected from the group are released to you after delivery is confirmed — clean, escrow-style payouts with no chasing people down.") },
  ];

  const categories: { icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { icon: LayoutGrid, label: t("hiw.cats.saas", "SaaS seats") },
    { icon: Sparkles, label: t("hiw.cats.ai", "AI credits") },
    { icon: Cloud, label: t("hiw.cats.cloud", "Cloud & hosting") },
    { icon: GraduationCap, label: t("hiw.cats.courses", "Courses") },
    { icon: KeyRound, label: t("hiw.cats.licenses", "Licenses") },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero */}
        <section className="text-center space-y-6 pt-2">
          <span className="gp-chip gp-chip-soft inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {t("hiw.badge", "How Grouperry works")}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight">
            {t("hiw.heroTitle", "Pay team prices without a team")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("hiw.heroSubtitle", "Grouperry lets communities pool together to hit the group discounts on SaaS, AI tools and other software — with escrow-style protection, so you're only charged when the group actually fills.")}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/explore">
                {t("hiw.ctaBrowse", "Browse deals")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/create">{t("hiw.ctaStart", "Start a deal")}</Link>
            </Button>
          </div>
        </section>

        {/* What Grouperry is */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-2">
              {t("hiw.whatTitle", "What is Grouperry?")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("hiw.whatBody", "Many of the best software plans are priced for teams — the bigger the group, the lower the price per seat. Grouperry is where individuals and small communities join forces to reach those group tiers together, then split the cost fairly. You get the team price without needing a team of your own.")}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <InfoCard icon={Users} title={t("hiw.value1Title", "Pool your buying power")} body={t("hiw.value1Body", "Combine with others to hit the seat counts that unlock the best per-person pricing.")} />
            <InfoCard icon={ShieldCheck} title={t("hiw.value2Title", "Escrow-style protection")} body={t("hiw.value2Body", "Your money is only taken when the group fills, and released to the organiser after delivery.")} />
            <InfoCard icon={BadgeCheck} title={t("hiw.value3Title", "Verified organisers")} body={t("hiw.value3Body", "Organisers can verify their identity, so you know who you're pooling with.")} />
          </div>
        </section>

        {/* For joiners */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <span className="gp-chip gp-chip-soft">{t("hiw.joinBadge", "For joiners")}</span>
            <h2 className="text-2xl md:text-3xl font-bold font-display mt-3 mb-2">
              {t("hiw.joinTitle", "Join a deal in three steps")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("hiw.joinIntro", "Reserving a seat is free. You only pay your share once the group is ready to unlock the price.")}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {joinerSteps.map((step, i) => (
              <StepCard key={step.title} index={i + 1} step={step} />
            ))}
          </div>
        </section>

        {/* For organisers */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <span className="gp-chip gp-chip-soft">{t("hiw.orgBadge", "For organisers")}</span>
            <h2 className="text-2xl md:text-3xl font-bold font-display mt-3 mb-2">
              {t("hiw.orgTitle", "Run a deal from start to payout")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("hiw.orgIntro", "Organisers set up the plan and bring people together. Grouperry handles collecting funds and holding them until you deliver.")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {organiserSteps.map((step, i) => (
              <StepCard key={step.title} index={i + 1} step={step} />
            ))}
          </div>
        </section>

        {/* Protection model */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-2">
              {t("hiw.protectTitle", "How you're protected")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("hiw.protectIntro", "Group buying only works if everyone can trust the process. That's why Grouperry holds funds in escrow and never charges you speculatively.")}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <InfoCard icon={Wallet} title={t("hiw.protect1Title", "Charged only when it fills")} body={t("hiw.protect1Body", "Reserving a seat costs nothing. Your card is only charged once the group reaches the size that unlocks the price.")} />
            <InfoCard icon={RotateCcw} title={t("hiw.protect2Title", "Refunded if it doesn't")} body={t("hiw.protect2Body", "If a group never fills or a deal falls through before delivery, your share is refunded — you don't lose out.")} />
            <InfoCard icon={BadgeCheck} title={t("hiw.protect3Title", "ID-verified organisers")} body={t("hiw.protect3Body", "Organisers can complete identity verification, and funds are only released to them after access is delivered.")} />
          </div>
        </section>

        {/* What you can group-buy */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-2">
              {t("hiw.catsTitle", "What you can group-buy")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("hiw.catsIntro", "If it's sold in tiers or seats, it's a candidate for a group buy. Common categories include:")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map(({ icon: Icon, label }) => (
              <div key={label} className="gp-card px-5 py-4 flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ teaser */}
        <section className="gp-card p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
          <div className="flex items-start gap-4 max-w-xl">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl gp-chip gp-chip-soft flex-shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display mb-1">
                {t("hiw.faqTitle", "Still have questions?")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("hiw.faqBody", "Read our FAQ for details on payments, refunds, verification and the legitimacy of sharing team seats.")}
              </p>
            </div>
          </div>
          <Button variant="outline" size="lg" asChild className="flex-shrink-0">
            <Link href="/faq">
              {t("hiw.faqCta", "Read the FAQ")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </section>

        {/* Final CTA */}
        <section
          className="rounded-2xl p-10 text-center text-white space-y-5"
          style={{ background: "linear-gradient(120deg, var(--v-500), var(--v-700))" }}
        >
          <h2 className="text-2xl md:text-3xl font-bold font-display">
            {t("hiw.finalTitle", "Ready to pay less, together?")}
          </h2>
          <p className="text-white/85 max-w-xl mx-auto leading-relaxed">
            {t("hiw.finalBody", "Join a deal that's already filling, or start your own and bring your community along.")}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/explore">{t("hiw.ctaBrowse", "Browse deals")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/create">{t("hiw.ctaStart", "Start a deal")}</Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
