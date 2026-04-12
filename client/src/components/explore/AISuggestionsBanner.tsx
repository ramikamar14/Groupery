import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronRight, Gift, Loader2, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AISuggestionsBanner() {
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
    queryFn: () => fetch("/api/my-groups", { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    enabled: !!user,
    staleTime: 300000,
  });

  const hasHistory = myGroups && myGroups.length > 0;

  useEffect(() => {
    if (!user || fetched.current || dismissed) return;
    if (!hasHistory) return;
    fetched.current = true;
    setLoading(true);
    fetch("/api/ai/suggestions", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.recommendedDeals && Array.isArray(data.recommendedDeals)) {
          setSuggestions(
            data.recommendedDeals
              .slice(0, 3)
              .map((d: any) => d.reason || d.title || "")
              .filter(Boolean),
          );
        }
        if (data?.estimatedSavings) setSavings(data.estimatedSavings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, hasHistory, dismissed]);

  if (!user || dismissed) return null;

  if (!hasHistory) {
    return (
      <div
        className="mb-6 bg-gradient-to-r from-primary/8 via-primary/5 to-accent/8 border border-primary/15 rounded-xl p-4 relative overflow-hidden"
        data-testid="ai-suggestions-banner"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="w-4.5 h-4.5 text-primary" style={{ width: "1.125rem", height: "1.125rem" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-1">Welcome to Grouperry</p>
            <p className="text-xs text-muted-foreground leading-snug">
              Browse deals below, or use the AI chat to find exactly what you're looking for — it can help you discover group buys that match your interests.
            </p>
          </div>
          <button
            type="button"
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
    <div
      className="mb-6 bg-gradient-to-r from-primary/8 via-primary/5 to-accent/8 border border-primary/15 rounded-xl p-4 relative overflow-hidden"
      data-testid="ai-suggestions-banner"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Brain className="w-4.5 h-4.5 text-primary" style={{ width: "1.125rem", height: "1.125rem" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-semibold">{t("home.aiPicksTitle")}</p>
            {savings && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-300/30"
              >
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
                  type="button"
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
          type="button"
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
