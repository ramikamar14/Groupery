import { useQuery } from "@tanstack/react-query";
import {
  LandingHeader,
  LandingHero,
  LandingStats,
  LandingHowItWorks,
  LandingCategories,
  LandingTrust,
  LandingCTA,
  LandingFooter,
} from "@/components/landing";

export default function Landing() {
  const { data: platformStats } = useQuery<{ activeListings: number; totalMembers: number }>({
    queryKey: ["/api/stats"],
    staleTime: 5 * 60_000,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="landing-page">
      <LandingHeader />
      <LandingHero totalMembers={platformStats?.totalMembers} activeListings={platformStats?.activeListings} />
      <LandingStats activeListings={platformStats?.activeListings} totalMembers={platformStats?.totalMembers} />
      <LandingHowItWorks />
      <LandingCategories />
      <LandingTrust activeListings={platformStats?.activeListings} totalMembers={platformStats?.totalMembers} />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
