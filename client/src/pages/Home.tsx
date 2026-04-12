import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ListingCard } from "@/components/ListingCard";
import { useListings } from "@/hooks/use-listings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Loader2, MapPin, X, Zap, Globe, Languages, User, Store, TrendingUp, Clock, Sparkles, ChevronRight, ChevronLeft, BookmarkPlus, Tag, Activity, UserPlus, PlusCircle, CheckCircle, Megaphone, Brain, ArrowRight, Gift, SlidersHorizontal, Users, Package, BadgePercent, Copy, CheckCheck, Star, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

function AISuggestionsBanner() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [savings, setSavings] = useState<string | null>(null);
  const fetched = useRef(false);

  const { data: myGroups } = useQuery<any[]>({
    queryKey: ["/api/my-groups"],
    queryFn: () => fetch("/api/my-groups", { credentials: "include" }).then(r => r.ok ? r.json() : []),
    enabled: !!user,
    staleTime: 300000,
  });

  const hasHistory = myGroups && myGroups.length > 0;

  useEffect(() => {
    if (!user || fetched.current || dismissed) return;
    if (!hasHistory) return; // For new users, show static banner — no AI call needed
    fetched.current = true;
    setLoading(true);
    fetch("/api/ai/suggestions", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.recommendedDeals && Array.isArray(data.recommendedDeals)) {
          setSuggestions(data.recommendedDeals.slice(0, 3).map((d: any) => d.reason || d.title || "").filter(Boolean));
        }
        if (data?.estimatedSavings) setSavings(data.estimatedSavings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, hasHistory, dismissed]);

  if (!user || dismissed) return null;

  if (!hasHistory) {
    return (
      <div className="mb-6 bg-gradient-to-r from-primary/8 via-primary/5 to-accent/8 border border-primary/15 rounded-xl p-4 relative overflow-hidden" data-testid="ai-suggestions-banner">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="w-4.5 h-4.5 text-primary" style={{ width: "1.125rem", height: "1.125rem" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-1">Welcome to Grouperry</p>
            <p className="text-xs text-muted-foreground leading-snug">Browse deals below, or use the AI chat to find exactly what you're looking for — it can help you discover group buys that match your interests.</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-2 rounded-md hover:bg-background/60 transition-colors text-muted-foreground"
            data-testid="button-dismiss-suggestions"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-primary/8 via-primary/5 to-accent/8 border border-primary/15 rounded-xl p-4 relative overflow-hidden" data-testid="ai-suggestions-banner">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Brain className="w-4.5 h-4.5 text-primary" style={{ width: "1.125rem", height: "1.125rem" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-semibold">{t("home.aiPicksTitle")}</p>
            {savings && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-300/30">
                <Gift className="w-2.5 h-2.5 mr-0.5" />
                {savings}
              </Badge>
            )}
          </div>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("home.aiPicksLoading")}</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-1.5">
              {suggestions.slice(0, expanded ? 3 : 1).map((s, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-snug flex items-start gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  {s}
                </p>
              ))}
              {suggestions.length > 1 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-primary font-medium flex items-center gap-1 mt-1 hover:underline"
                  data-testid="button-expand-suggestions"
                >
                  {expanded ? t("home.aiPicksShowLess") : `+${suggestions.length - 1}`}
                  <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t("home.aiPicksExplore")}</p>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-md hover:bg-background/60 transition-colors text-muted-foreground"
          data-testid="button-dismiss-suggestions"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function ReferralBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem("referral-dismissed") === "1");
  const [copied, setCopied] = useState(false);

  const { data: referralStats } = useQuery<{ totalReferrals: number; rewardedReferrals: number; referredUsers: any[] }>({
    queryKey: ["/api/referrals/stats"],
    enabled: !!user,
    staleTime: 60000,
  });

  if (!user || dismissed) return null;

  const referralLink = `${window.location.origin}?ref=${(user as any).id}`;
  const totalReferrals = referralStats?.totalReferrals ?? 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({ title: "Referral link copied!", description: "Share it with friends to help them discover great group deals." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy", description: referralLink });
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("referral-dismissed", "1");
  };

  return (
    <div className="mb-4 bg-gradient-to-r from-amber-500/8 to-orange-500/8 border border-amber-400/20 rounded-xl p-4" data-testid="referral-banner">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
          <Gift className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Invite friends &amp; grow your network</p>
            {totalReferrals > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0 bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full border border-amber-400/30" data-testid="text-referral-count">
                <Users className="w-2.5 h-2.5" />{totalReferrals} joined
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mb-2">Share your link — both you and your friend get a reward when they join their first group deal.</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-background/60 border border-amber-300/30 rounded-md px-2 py-1">
              <p className="text-[10px] text-muted-foreground truncate font-mono" data-testid="text-referral-link">{referralLink}</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs border-amber-300/50 hover:bg-amber-500/10 shrink-0" onClick={handleCopy} data-testid="button-copy-referral">
              {copied ? <><CheckCheck className="w-3 h-3 mr-1" />Copied!</> : <><Copy className="w-3 h-3 mr-1" />Copy</>}
            </Button>
          </div>
        </div>
        <button onClick={handleDismiss} className="p-1 rounded-md hover:bg-background/60 text-muted-foreground shrink-0 mt-0.5" data-testid="button-dismiss-referral">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

const COUNTRIES = [
  // Americas
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "MX", label: "Mexico" },
  { value: "BR", label: "Brazil" },
  { value: "AR", label: "Argentina" },
  { value: "CO", label: "Colombia" },
  // Europe
  { value: "UK", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "PT", label: "Portugal" },
  { value: "PL", label: "Poland" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "AT", label: "Austria" },
  { value: "CH", label: "Switzerland" },
  { value: "IE", label: "Ireland" },
  { value: "GR", label: "Greece" },
  // Arab Countries
  { value: "SA", label: "Saudi Arabia" },
  { value: "AE", label: "UAE" },
  { value: "EG", label: "Egypt" },
  { value: "MA", label: "Morocco" },
  { value: "DZ", label: "Algeria" },
  { value: "TN", label: "Tunisia" },
  { value: "JO", label: "Jordan" },
  { value: "LB", label: "Lebanon" },
  { value: "KW", label: "Kuwait" },
  { value: "QA", label: "Qatar" },
  { value: "BH", label: "Bahrain" },
  { value: "OM", label: "Oman" },
  { value: "IQ", label: "Iraq" },
  { value: "SY", label: "Syria" },
  { value: "PS", label: "Palestine" },
  { value: "LY", label: "Libya" },
  { value: "SD", label: "Sudan" },
  // Asia & Pacific
  { value: "AU", label: "Australia" },
  { value: "NZ", label: "New Zealand" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
  { value: "KR", label: "South Korea" },
  { value: "SG", label: "Singapore" },
  { value: "MY", label: "Malaysia" },
  { value: "ID", label: "Indonesia" },
  { value: "TH", label: "Thailand" },
  { value: "PH", label: "Philippines" },
  { value: "VN", label: "Vietnam" },
  { value: "PK", label: "Pakistan" },
  { value: "TR", label: "Turkey" },
  // Africa
  { value: "ZA", label: "South Africa" },
  { value: "NG", label: "Nigeria" },
  { value: "KE", label: "Kenya" },
  { value: "GH", label: "Ghana" },
  { value: "OTHER", label: "Other" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "OTHER", label: "Other" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function DealOfTheDaySkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 bg-card">
      <div className="h-56 sm:h-72 w-full">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function DealOfTheDay() {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState("");

  const { data: deal, isLoading } = useQuery<any>({
    queryKey: ["/api/discover/deal-of-the-day"],
    queryFn: async () => {
      const res = await fetch("/api/discover/deal-of-the-day");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 5 * 60_000,
  });

  // Countdown to midnight UTC (when deal rotates)
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setUTCHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) return <DealOfTheDaySkeleton />;
  if (!deal) return null;

  const filledPct = deal.totalSlots > 0 ? Math.round((deal.filledSlots / deal.totalSlots) * 100) : 0;
  const spotsLeft = deal.totalSlots - deal.filledSlots;
  const isAlmostFull = filledPct >= 70;
  const isUrgent = filledPct >= 90 || spotsLeft <= 3;

  const savings = deal.pricePerSlot && deal.marketPrice
    ? Math.round(((deal.marketPrice - deal.pricePerSlot) / deal.marketPrice) * 100)
    : null;

  const categoryEmoji: Record<string, string> = {
    physical: "📦", digital: "💻", offer: "🎟️",
  };

  return (
    <div className="mb-8" data-testid="deal-of-the-day-section">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-sm">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display leading-none">Deal of the Day</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Rotates in <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">{timeLeft}</span></p>
          </div>
        </div>
        <Link href={`/listings/${deal.id}`}>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
            View deal <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Card */}
      <Link href={`/listings/${deal.id}`} className="block group">
        <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5" data-testid={`deal-of-day-card-${deal.id}`}>
          {/* Image hero */}
          <div className="relative h-52 sm:h-72 bg-muted overflow-hidden">
            {deal.imageUrl ? (
              <img
                src={deal.imageUrl}
                alt={deal.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center">
                <span className="text-6xl">{categoryEmoji[deal.category] ?? "🛒"}</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md" data-testid="badge-deal-of-day">
                <Star className="w-3 h-3" /> Deal of the Day
              </span>
              {savings !== null && savings > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-md" data-testid="badge-savings">
                  Save {savings}%
                </span>
              )}
              {isUrgent && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-md animate-pulse" data-testid="badge-urgent">
                  🔥 {spotsLeft <= 3 ? `Only ${spotsLeft} left!` : "Almost full"}
                </span>
              )}
            </div>

            {/* Bottom content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
                {deal.category === "physical" ? "Physical" : deal.category === "digital" ? "Digital" : "Offer"} · {deal.location || deal.country || "Online"}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight line-clamp-2" data-testid="text-deal-title">{deal.title}</h3>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{deal.description}</p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-foreground">{deal.filledSlots} of {deal.totalSlots} spots filled</span>
                <span className={`font-bold ${isUrgent ? "text-red-600 dark:text-red-400" : isAlmostFull ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`} data-testid="text-fill-pct">{filledPct}% full</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isUrgent ? "bg-red-500" : isAlmostFull ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(filledPct, 100)}%` }}
                  data-testid="progress-bar-fill"
                />
              </div>
              {spotsLeft > 0 && (
                <p className={`text-[11px] mt-1 font-medium ${isUrgent ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} data-testid="text-spots-left">
                  {isUrgent ? `⚡ Only ${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} remaining!` : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} still available`}
                </p>
              )}
            </div>

            {/* Price + CTA row */}
            <div className="flex items-center justify-between gap-3">
              <div>
                {deal.pricePerSlot ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-display text-primary" data-testid="text-price">
                      ${(deal.pricePerSlot / 100).toFixed(0)}
                    </span>
                    {deal.marketPrice && (
                      <span className="text-sm text-muted-foreground line-through">${(deal.marketPrice / 100).toFixed(0)}</span>
                    )}
                    <span className="text-xs text-muted-foreground">/ person</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Price on request</span>
                )}
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                  By <span className="font-medium text-foreground">{deal.creator?.firstName} {deal.creator?.lastName}</span>
                  {deal.creator?.verificationStatus === "verified" && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold border border-blue-300/30">
                      <CheckCircle className="w-2.5 h-2.5" /> ID
                    </span>
                  )}
                  {deal.creator?.reliabilityScore !== undefined && deal.creator.reliabilityScore >= 70 && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-300/30">
                      <Star className="w-2.5 h-2.5" /> Trusted
                    </span>
                  )}
                  {deal.creator?.completedParticipations !== undefined && deal.creator.completedParticipations > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      · {deal.creator.completedParticipations} deals
                    </span>
                  )}
                </p>
              </div>
              <Button size="sm" className="gap-1.5 shrink-0 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white border-0 shadow-sm" data-testid="button-view-deal">
                <Zap className="w-3.5 h-3.5" /> Join Deal
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function DiscoverySectionSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="min-w-[280px] flex-shrink-0">
          <Skeleton className="h-[200px] w-full rounded-2xl mb-3" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function DiscoverySection({ title, icon, queryKey, endpoint }: { title: string, icon: React.ReactNode, queryKey: string, endpoint: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: sectionListings, isLoading } = useQuery<any[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60000,
  });

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8" data-testid={`section-${queryKey}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            {icon}
            {title}
          </h2>
        </div>
        <DiscoverySectionSkeleton />
      </div>
    );
  }

  if (!sectionListings || sectionListings.length === 0) return (
    <div className="mb-8" data-testid={`section-${queryKey}-empty`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          {icon}
          {title}
        </h2>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="min-w-[240px] flex-shrink-0 p-4 rounded-2xl border border-dashed border-border/50 bg-muted/20 flex items-center justify-center h-[160px]">
            <div className="text-center">
              <div className="text-2xl mb-1">✨</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mb-8" data-testid={`section-${queryKey}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full border border-border hover:bg-secondary transition-colors"
            aria-label="Scroll left"
            data-testid={`button-scroll-left-${queryKey}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full border border-border hover:bg-secondary transition-colors"
            aria-label="Scroll right"
            data-testid={`button-scroll-right-${queryKey}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
          {sectionListings.map((listing: any) => (
            <div key={listing.id} className="min-w-[280px] max-w-[300px] flex-shrink-0 snap-start">
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  user_joined: <UserPlus className="w-4 h-4 text-green-500" />,
  listing_created: <PlusCircle className="w-4 h-4 text-blue-500" />,
  group_completed: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  announcement_posted: <Megaphone className="w-4 h-4 text-amber-500" />,
};

function getActivityMessage(entry: any, t: any): string {
  const actorName = entry.actor?.firstName || entry.actor?.username || t("home.activitySomeone", "Someone");
  const listingTitle = entry.metadata?.listingTitle || entry.metadata?.title || entry.listing?.title || t("home.activityAListing", "a listing");
  switch (entry.type) {
    case "user_joined":
      return t("home.activityJoined", { actor: actorName, listing: listingTitle, defaultValue: `${actorName} joined "${listingTitle}"` });
    case "listing_created":
      return t("home.activityCreated", { actor: actorName, listing: listingTitle, defaultValue: `${actorName} created "${listingTitle}"` });
    case "group_completed":
      return t("home.activityCompleted", { listing: listingTitle, defaultValue: `"${listingTitle}" is now complete` });
    case "announcement_posted":
      return t("home.activityAnnouncement", { actor: actorName, listing: listingTitle, defaultValue: `${actorName} posted an update in "${listingTitle}"` });
    default:
      return t("home.activityGeneric", { defaultValue: "New activity" });
  }
}

function ActivityFeedSection() {
  const { t } = useTranslation();
  const { data: feed, isLoading } = useQuery<any[]>({
    queryKey: ["activity-feed"],
    queryFn: async () => {
      const res = await fetch("/api/activity-feed?limit=10", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="mb-8" data-testid="section-activity-feed">
        <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          {t("home.activityFeed", "Activity")}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!feed || feed.length === 0) return null;

  return (
    <div className="mb-8" data-testid="section-activity-feed">
      <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        {t("home.activityFeed", "Activity")}
      </h2>
      <div className="space-y-2">
        {feed.map((entry: any) => {
          const timeAgo = entry.createdAt ? formatTimeAgo(entry.createdAt, t) : "";
          return (
            <div key={entry.id} className="flex items-center gap-3 p-2 rounded-md" data-testid={`activity-item-${entry.id}`}>
              <div className="flex-shrink-0">
                {entry.actor ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.actor.profileImageUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {(entry.actor.firstName?.[0] || entry.actor.username?.[0] || "?").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    {ACTIVITY_ICONS[entry.type] || <Activity className="w-4 h-4 text-muted-foreground" />}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {entry.listingId ? (
                  <Link href={`/listings/${entry.listingId}`} data-testid={`activity-link-${entry.id}`}>
                    <span className="text-sm hover:underline cursor-pointer">{getActivityMessage(entry, t)}</span>
                  </Link>
                ) : (
                  <span className="text-sm">{getActivityMessage(entry, t)}</span>
                )}
              </div>
              <div className="flex-shrink-0 flex items-center gap-1">
                {ACTIVITY_ICONS[entry.type] || null}
                <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string, t: any): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t("home.timeJustNow", "just now");
  if (minutes < 60) return t("home.timeMinutesAgo", { minutes, defaultValue: `${minutes}m ago` });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("home.timeHoursAgo", { hours, defaultValue: `${hours}h ago` });
  const days = Math.floor(hours / 24);
  return t("home.timeDaysAgo", { days, defaultValue: `${days}d ago` });
}

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchInput, 300);
  const [category, setCategory] = useState<"physical" | "digital" | "offer" | undefined>(undefined);
  const [sellerType, setSellerType] = useState<"individual" | "vendor" | undefined>(undefined);
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [fillingFast, setFillingFast] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [page, setPage] = useState(1);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("grouperry-recent-searches") || "[]"); } catch { return []; }
  });
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [, setLocation] = useLocation();

  // Capture referral param from URL and store it
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        localStorage.setItem("grouperry-pending-referral", ref);
      }
    } catch {}
  }, []);

  // Claim pending referral once user is authenticated
  useEffect(() => {
    if (!user) return;
    const pendingRef = localStorage.getItem("grouperry-pending-referral");
    if (!pendingRef || pendingRef === (user as any).id) return;
    localStorage.removeItem("grouperry-pending-referral");
    fetch("/api/referrals/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ referrerId: pendingRef }),
    }).then(r => r.json()).then(data => {
      if (data.created) {
        queryClient.invalidateQueries({ queryKey: ["/api/referrals/stats"] });
      }
    }).catch(() => {});
  }, [user]);
  const { toast } = useToast();

  const { data: popularTags } = useQuery<{ tag: string; count: number }[]>({
    queryKey: ["/api/tags/popular"],
    queryFn: () => fetch("/api/tags/popular").then(r => r.json()),
    staleTime: 300000,
  });

  const { data: platformStats } = useQuery<{ activeListings: number; totalMembers: number }>({
    queryKey: ["/api/stats"],
    queryFn: () => fetch("/api/stats").then(r => r.json()),
    staleTime: 60000,
  });

  const isFiltering = !!(search || category || sellerType || country || language || fillingFast || userLocation || selectedTag);

  const saveSearchMutation = useMutation({
    mutationFn: async () => {
      const filters: any = {};
      if (category) filters.category = category;
      if (sellerType) filters.sellerType = sellerType;
      if (country) filters.country = country;
      if (language) filters.language = language;
      if (fillingFast) filters.fillingFast = true;
      return apiRequest("POST", "/api/saved-searches", {
        query: search || null,
        filters,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-searches"] });
      toast({ title: t("home.searchSaved", "Search Saved"), description: t("home.searchSavedDesc", "You'll be notified when new matching listings appear.") });
    },
    onError: (err: any) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    },
  });

  const { data: suggestions } = useQuery<string[]>({
    queryKey: ['/api/search/suggestions', `?q=${encodeURIComponent(debouncedQuery)}`],
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim() || query.length < 2) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 6);
    setRecentSearches(updated);
    try { localStorage.setItem("grouperry-recent-searches", JSON.stringify(updated)); } catch {}
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    setSearch(value);
    setShowSuggestions(value.length >= 2);
    setShowRecentSearches(value.length === 0);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setSearch(suggestion);
    setShowSuggestions(false);
    setShowRecentSearches(false);
    saveRecentSearch(suggestion);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchInput.trim()) {
      saveRecentSearch(searchInput.trim());
      setShowSuggestions(false);
      setShowRecentSearches(false);
    }
  };

  const clearRecentSearch = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== query);
    setRecentSearches(updated);
    try { localStorage.setItem("grouperry-recent-searches", JSON.stringify(updated)); } catch {}
  };
  
  // Sync filters from URL on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q"); if (q) { setSearch(q); setSearchInput(q); }
      const cat = params.get("category"); if (cat) setCategory(cat as any);
      const st = params.get("sellerType"); if (st) setSellerType(st as any);
      const co = params.get("country"); if (co) setCountry(co);
      const la = params.get("language"); if (la) setLanguage(la);
      const ff = params.get("fillingFast"); if (ff === "1") setFillingFast(true);
      const tag = params.get("tag"); if (tag) setSelectedTag(tag);
    } catch {}
  }, []);

  // Sync filters to URL when they change
  const filtersKey = JSON.stringify({ search, category, sellerType, country, language, fillingFast, selectedTag });
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (sellerType) params.set("sellerType", sellerType);
    if (country) params.set("country", country);
    if (language) params.set("language", language);
    if (fillingFast) params.set("fillingFast", "1");
    if (selectedTag) params.set("tag", selectedTag);
    const qs = params.toString();
    const newUrl = qs ? `/?${qs}` : "/";
    if (window.location.search !== (qs ? `?${qs}` : "")) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [filtersKey]);

  const allFiltersKey = JSON.stringify({ search, category, sellerType, country, language, fillingFast, selectedTag, userLocation });
  useEffect(() => {
    setPage(1);
    setAllListings([]);
  }, [allFiltersKey]);

  const { data: listings, isLoading, error, isFetching } = useListings({ 
    search, 
    category,
    sellerType,
    country,
    language,
    fillingFast: fillingFast || undefined,
    tag: selectedTag,
    lat: userLocation?.lat,
    lng: userLocation?.lng,
    radius: userLocation ? 0.1 : undefined,
    page,
  });

  useEffect(() => {
    if (!listings) return;
    if (page === 1) {
      setAllListings(listings);
    } else {
      setAllListings(prev => {
        const existingIds = new Set(prev.map((l: any) => l.id));
        const newItems = listings.filter((l: any) => !existingIds.has(l.id));
        return [...prev, ...newItems];
      });
    }
  }, [listings, page]);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: t("common.error"), description: t("home.geolocationNotSupported"), variant: "destructive" });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
        toast({ title: t("home.locationFound"), description: t("home.showingNearby") });
      },
      (err) => {
        setIsLocating(false);
        toast({ title: t("home.locationError"), description: err.message || "Could not get your location.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast, t]);

  const clearLocation = () => {
    setUserLocation(null);
  };

  const activeFilterCount = [country, language, fillingFast ? "fill" : null, userLocation ? "loc" : null, selectedTag].filter(Boolean).length + (sellerType ? 1 : 0);

  return (
    <Layout>
      <AISuggestionsBanner />
      <ReferralBanner />

      {/* Hero section — only shown when not filtering */}
      {!isFiltering && !user && (
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/15 p-8 text-center overflow-hidden relative" data-testid="hero-banner">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">{t("home.heroPlatform")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-3">{t("home.heroTitle")}</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
              {t("home.heroDesc")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-primary" />
                <span>{t("home.heroFeature1")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <span>{t("home.heroFeature2")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4 text-primary" />
                <span>{t("home.heroFeature3")}</span>
              </div>
            </div>
            <Link href="/api/login">
              <Button size="lg" className="px-8 shadow-lg shadow-primary/25" data-testid="button-hero-cta">
                {t("home.heroCta")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Platform stats bar */}
      {!isFiltering && platformStats && (platformStats.activeListings > 0 || platformStats.totalMembers > 0) && (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-6 py-3 px-4 rounded-2xl bg-muted/40 border border-border/50 text-sm" data-testid="stats-bar">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="w-4 h-4 text-primary" />
            <span>
              <strong className="text-foreground font-semibold">{platformStats.activeListings}</strong>
              {" "}active {platformStats.activeListings === 1 ? "deal" : "deals"}
            </span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>
              <strong className="text-foreground font-semibold">{platformStats.totalMembers}</strong>
              {" "}{platformStats.totalMembers === 1 ? "member" : "members"}
            </span>
          </div>
        </div>
      )}

      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {user ? (
              <>
                <h1 className="text-2xl font-display font-bold">
                  {(() => {
                    const hour = new Date().getHours();
                    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
                    const firstName = (user as any).firstName;
                    return firstName ? `${greeting}, ${firstName}` : t("home.title");
                  })()}
                </h1>
                <p className="text-sm text-muted-foreground">{t("home.subtitle")}</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-display font-bold">{t("home.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("home.subtitle")}</p>
              </>
            )}
          </div>
          
          <div className="relative w-full sm:w-72" ref={searchContainerRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input 
              placeholder={t("home.search")} 
              className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-all"
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onFocus={() => {
                if (searchInput.length >= 2) setShowSuggestions(true);
                else if (recentSearches.length > 0) setShowRecentSearches(true);
              }}
              onKeyDown={handleSearchKeyDown}
              data-testid="input-search"
              autoComplete="off"
            />
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md z-50 max-h-60 overflow-y-auto" data-testid="search-suggestions">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted cursor-pointer flex items-center gap-2"
                    onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(suggestion); }}
                    data-testid={`suggestion-item-${index}`}
                  >
                    <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
            {/* Recent searches dropdown */}
            {showRecentSearches && !showSuggestions && recentSearches.length > 0 && searchInput.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md z-50" data-testid="recent-searches">
                <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Recent searches</div>
                {recentSearches.map((query, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted cursor-pointer group" data-testid={`recent-search-${index}`}>
                    <button className="flex items-center gap-2 flex-1 text-left" onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(query); }}>
                      <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{query}</span>
                    </button>
                    <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground" onMouseDown={(e) => clearRecentSearch(query, e)} data-testid={`clear-recent-${index}`}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Segment tabs — Individuals vs Businesses */}
        <div className="flex items-center gap-2" data-testid="segment-tabs">
          <Button
            onClick={() => setSellerType(undefined)}
            variant={sellerType === undefined ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            data-testid="segment-all"
          >
            {t("home.all")}
          </Button>
          <Button
            onClick={() => setSellerType(sellerType === "individual" ? undefined : "individual")}
            variant={sellerType === "individual" ? "default" : "outline"}
            size="sm"
            className="rounded-full flex items-center gap-1.5"
            data-testid="segment-individuals"
          >
            <User className="w-3.5 h-3.5" />
            {t("home.individuals")}
          </Button>
          <Button
            onClick={() => setSellerType(sellerType === "vendor" ? undefined : "vendor")}
            variant={sellerType === "vendor" ? "default" : "outline"}
            size="sm"
            className="rounded-full flex items-center gap-1.5"
            data-testid="segment-businesses"
          >
            <Store className="w-3.5 h-3.5" />
            {t("home.businesses")}
          </Button>
        </div>

        {/* Category pills + Filters button */}
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            onClick={() => setCategory(undefined)}
            variant={category === undefined ? "default" : "secondary"}
            size="sm"
            className="rounded-full"
            data-testid="filter-all"
          >
            {t("home.all")}
          </Button>
          {[
            { key: "physical", label: t("home.physical") },
            { key: "digital", label: t("home.digital") },
            { key: "offer", label: t("home.offer") }
          ].map((cat) => (
            <Button
              key={cat.key}
              onClick={() => setCategory(cat.key as any)}
              variant={category === cat.key ? "default" : "secondary"}
              size="sm"
              className="rounded-full"
              data-testid={`filter-${cat.key}`}
            >
              {cat.label}
            </Button>
          ))}

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          {/* Filters drawer trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant={activeFilterCount > 0 ? "default" : "outline"}
                size="sm"
                className="rounded-full ml-auto sm:ml-0"
                data-testid="button-open-filters"
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                {t("home.filters")}
                {activeFilterCount > 0 && (
                  <span className="ml-1.5 bg-background/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  {t("home.filters")}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                {/* Seller type */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("home.sellerType")}</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setSellerType(sellerType === "individual" ? undefined : "individual")}
                      variant={sellerType === "individual" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full flex-1"
                      data-testid="filter-individual"
                    >
                      <User className="w-4 h-4 mr-1" />
                      {t("home.individuals")}
                    </Button>
                    <Button 
                      onClick={() => setSellerType(sellerType === "vendor" ? undefined : "vendor")}
                      variant={sellerType === "vendor" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full flex-1"
                      data-testid="filter-vendor"
                    >
                      <Store className="w-4 h-4 mr-1" />
                      {t("home.shops")}
                    </Button>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("home.country")}</p>
                  <Select value={country || "all"} onValueChange={(v) => setCountry(v === "all" ? undefined : v)}>
                    <SelectTrigger data-testid="filter-country">
                      <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder={t("home.country")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("home.allCountries")}</SelectItem>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("home.language")}</p>
                  <Select value={language || "all"} onValueChange={(v) => setLanguage(v === "all" ? undefined : v)}>
                    <SelectTrigger data-testid="filter-language">
                      <Languages className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder={t("home.language")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("home.allLanguages")}</SelectItem>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick filters */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("home.quickFilters")}</p>
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={() => setFillingFast(!fillingFast)}
                      variant={fillingFast ? "default" : "outline"}
                      size="sm"
                      className="rounded-full justify-start"
                      data-testid="filter-filling-fast"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      {t("home.fillingFast")}
                    </Button>
                    {userLocation ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearLocation}
                        className="rounded-full justify-start"
                        data-testid="button-clear-location"
                      >
                        <MapPin className="w-4 h-4 mr-1 text-green-500" />
                        {t("home.nearby")}
                        <X className="w-3 h-3 ml-auto" />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className="rounded-full justify-start"
                        data-testid="button-nearby"
                      >
                        {isLocating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <MapPin className="w-4 h-4 mr-1" />}
                        {isLocating ? t("home.locating") : t("home.nearby")}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Popular tags */}
                {popularTags && popularTags.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t("home.filterTags")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {popularTags.slice(0, 15).map((pt) => (
                        <button
                          key={pt.tag}
                          onClick={() => setSelectedTag(selectedTag === pt.tag ? undefined : pt.tag)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selectedTag === pt.tag ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:border-primary/50"}`}
                          data-testid={`button-tag-filter-${pt.tag}`}
                        >
                          {pt.tag}
                          <span className="ml-1 opacity-60">({pt.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save search */}
                {isFiltering && user && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full"
                    onClick={() => saveSearchMutation.mutate()}
                    disabled={saveSearchMutation.isPending}
                    data-testid="button-save-search"
                  >
                    {saveSearchMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <BookmarkPlus className="w-4 h-4 mr-1" />}
                    {t("home.saveSearch", "Save This Search")}
                  </Button>
                )}

                {/* Active filter indicator */}
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive"
                    onClick={() => {
                      setSellerType(undefined);
                      setCountry(undefined);
                      setLanguage(undefined);
                      setFillingFast(false);
                      setUserLocation(null);
                      setSelectedTag(undefined);
                    }}
                    data-testid="button-clear-filters"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active filter chips */}
        {(selectedTag || fillingFast || userLocation) && (
          <div className="flex flex-wrap items-center gap-2" data-testid="active-filters">
            {selectedTag && (
              <Badge variant="default" className="text-xs rounded-full" data-testid={`active-tag-filter-${selectedTag}`}>
                <Tag className="w-3 h-3 mr-1" />
                {selectedTag}
                <button onClick={() => setSelectedTag(undefined)} className="ml-1" data-testid="button-clear-tag-filter">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {fillingFast && (
              <Badge variant="default" className="text-xs rounded-full bg-amber-500 hover:bg-amber-500" data-testid="active-filling-fast">
                <Zap className="w-3 h-3 mr-1" />
                Filling Fast
                <button onClick={() => setFillingFast(false)} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {userLocation && (
              <Badge variant="default" className="text-xs rounded-full bg-green-600 hover:bg-green-600" data-testid="active-nearby">
                <MapPin className="w-3 h-3 mr-1" />
                Nearby
                <button onClick={() => setUserLocation(null)} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {!isFiltering && (
        <div className="mb-8">
          <DealOfTheDay />
          <DiscoverySection
            title={t("home.trending", "Trending")}
            icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
            queryKey="discover-trending"
            endpoint="/api/discover/trending"
          />
          <DiscoverySection
            title={t("home.endingSoon", "Ending Soon")}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            queryKey="discover-expiring"
            endpoint="/api/discover/expiring-soon"
          />
          <DiscoverySection
            title={t("home.recentlyAdded", "Recently Added")}
            icon={<Sparkles className="w-5 h-5 text-blue-500" />}
            queryKey="discover-recent"
            endpoint="/api/discover/recent"
          />
          <DiscoverySection
            title={t("home.nearCompletion", "Filling Up Fast")}
            icon={<Flame className="w-5 h-5 text-rose-500" />}
            queryKey="discover-near-completion"
            endpoint="/api/discover/near-completion"
          />
          <ActivityFeedSection />
        </div>
      )}

      {isFiltering && (
        <>
          {isLoading && page === 1 ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center p-12 bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive">
              {t("common.error")}
            </div>
          ) : allListings.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-3xl border border-dashed border-border space-y-4" data-testid="no-results-state">
              <div className="text-5xl mb-2">🔍</div>
              <h3 className="text-xl font-bold font-display">{t("home.noListings", "No deals found")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">{t("home.noListingsHint", "Try adjusting your search or filters.")}</p>
              {search && (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p className="font-medium">Try:</p>
                  <ul className="list-none"><li>· Different or shorter keywords</li><li>· Removing some filters</li></ul>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button variant="outline" onClick={() => { setSearch(""); setSearchInput(""); setCategory(undefined); setSellerType(undefined); setCountry(undefined); setLanguage(undefined); setFillingFast(false); setSelectedTag(undefined); setUserLocation(null); }} data-testid="button-clear-filters">
                  Clear all filters
                </Button>
                <Link href="/create"><Button data-testid="button-create-deal-empty">Create a Deal</Button></Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allListings.map((listing: any) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              {listings && listings.length === 20 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={isFetching} data-testid="button-load-more">
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {t("home.loadMore", "Load More")}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {!isFiltering && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold">{t("home.allListings", "All Listings")}</h2>
          </div>
          {isLoading && page === 1 ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : allListings.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-3xl border border-dashed border-border space-y-4" data-testid="no-results-state">
              <div className="text-5xl mb-2">🔍</div>
              <h3 className="text-xl font-bold font-display">{t("home.noListings", "No deals found")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">{t("home.noListingsHint", "Try adjusting your search or filters.")}</p>
              {search && (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p className="font-medium">Try:</p>
                  <ul className="list-none"><li>· Different or shorter keywords</li><li>· Removing some filters</li></ul>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button variant="outline" onClick={() => { setSearch(""); setSearchInput(""); setCategory(undefined); setSellerType(undefined); setCountry(undefined); setLanguage(undefined); setFillingFast(false); setSelectedTag(undefined); setUserLocation(null); }} data-testid="button-clear-filters">
                  Clear all filters
                </Button>
                <Link href="/create"><Button data-testid="button-create-deal-empty">Create a Deal</Button></Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allListings.map((listing: any) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              {listings && listings.length === 20 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={isFetching} data-testid="button-load-more">
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {t("home.loadMore", "Load More")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Layout>
  );
}
