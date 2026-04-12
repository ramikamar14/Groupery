"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";
import { mockPlatformStats } from "./data";

const mockAnalysis = `Platform health is strong with 1,247 registered users and a 74% average group-buy fill rate — well above the 60% minimum threshold.

Key observations:
• Verification backlog (3 pending) is minor but should be cleared within 24h to unblock organisers.
• 5 open reports signal a small but active fraud/harassment surface; the flagged users system has correctly surfaced 2 high-risk accounts.
• The job queue is in a degraded state (142 pending, 7 failed jobs) — this is the most urgent infrastructure concern and should be investigated before it impacts payment processing.
• AI Analytics and ID Verification feature flags are enabled, which aligns with the current growth phase.

Recommended actions:
1. Resolve the 7 failed queue jobs — likely related to payment webhooks.
2. Ban SuspiciousUser99 (risk score 87) and BulkBuyer2024 (risk score 72) after review.
3. Enable bulk_export flag to support upcoming compliance reporting needs.
4. Consider raising the referral_program flag to accelerate user growth.`;

export function AnalyticsTab() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const stats = mockPlatformStats;

  const analyze = () => {
    setLoading(true);
    setAnalysis(null);
    setTimeout(() => {
      setLoading(false);
      setAnalysis(mockAnalysis);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Platform stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-primary" },
          { label: "Active Listings", value: stats.activeListings, icon: ShoppingBag, color: "text-accent" },
          { label: "Total Revenue", value: stats.totalRevenue, icon: DollarSign, color: "text-emerald-600" },
          { label: "Avg Fill Rate", value: stats.avgFillRate, icon: TrendingUp, color: "text-accent" },
          { label: "Pending Verifications", value: stats.pendingVerifications, icon: Users, color: "text-yellow-600" },
          { label: "Open Reports", value: stats.openReports, icon: Brain, color: "text-destructive" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="py-4 flex items-center gap-3">
              <Icon className={`w-8 h-8 ${color} shrink-0`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold tabular-nums">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-5 h-5 text-accent" />
            AI Platform Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={analyze}
            disabled={loading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analysing platform…
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyse Platform
              </>
            )}
          </Button>

          {analysis && (
            <div className="rounded-lg bg-muted/50 border border-border p-5">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">{analysis}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
