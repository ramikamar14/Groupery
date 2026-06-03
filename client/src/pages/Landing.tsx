import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header, Hero, Stats, HowItWorks, Categories, Trust, CTA, Footer } from "@/components/landing-v2";

export default function Landing() {
  // Capture ?ref=userId from the URL and store for post-registration claim
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) sessionStorage.setItem("grouperry_ref", ref);
  }, []);

  const { data: platformStats } = useQuery<{ activeListings: number; totalMembers: number }>({
    queryKey: ["/api/stats"],
    staleTime: 5 * 60_000,
  });

  return (
    <div className="theme-v2 min-h-screen bg-background text-foreground flex flex-col" data-testid="landing-page">
      <Header />
      <main className="flex-1">
        <Hero activeListings={platformStats?.activeListings} totalMembers={platformStats?.totalMembers} />
        <Stats activeListings={platformStats?.activeListings} totalMembers={platformStats?.totalMembers} />
        <HowItWorks />
        <Categories />
        <Trust />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
