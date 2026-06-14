import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCheck, Copy, Gift, Users, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function ReferralBanner() {
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
  const rewardedReferrals = referralStats?.rewardedReferrals ?? 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Referral link copied!",
        description: "Share it with friends to help them discover great group deals.",
      });
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
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Invite friends, earn rewards</p>
            {totalReferrals > 0 && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0 bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full border border-amber-400/30"
                data-testid="text-referral-count"
              >
                <Users className="w-2.5 h-2.5" />
                {totalReferrals} joined
              </span>
            )}
            {rewardedReferrals > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0 bg-green-500/15 text-green-800 dark:text-green-300 text-[10px] font-bold rounded-full border border-green-400/30">
                ✓ {rewardedReferrals} rewarded
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mb-2">
            Share your link — both you and your friend get a reward when they complete their first group deal.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-background/60 border border-amber-300/30 rounded-md px-2 py-1">
              <p className="text-[10px] text-muted-foreground truncate font-mono" data-testid="text-referral-link">
                {referralLink}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-amber-300/50 hover:bg-amber-500/10 shrink-0"
              onClick={handleCopy}
              data-testid="button-copy-referral"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-md hover:bg-background/60 text-muted-foreground shrink-0 mt-0.5"
          data-testid="button-dismiss-referral"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
