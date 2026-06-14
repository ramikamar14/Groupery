import { useEffect, useState } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { pageview } from "@/lib/analytics";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Discover from "@/pages/Discover";
import Dashboard from "@/pages/Dashboard";
import CreateListing from "@/pages/CreateListing";
import ListingDetails from "@/pages/ListingDetails";
import MyGroups from "@/pages/MyGroups";
import Profile from "@/pages/Profile";
import Onboarding from "@/pages/Onboarding";
import Admin from "@/pages/Admin";
import Notifications from "@/pages/Notifications";
import SavedListings from "@/pages/SavedListings";
import ExpiredListings from "@/pages/ExpiredListings";
import Vouchers from "@/pages/Vouchers";
import Terms from "@/pages/Terms";
import FAQ from "@/pages/FAQ";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import { useAuth } from "@/hooks/use-auth";
import { LoginModal } from "@/components/LoginModal";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ListingContextProvider } from "@/hooks/use-listing-context";
import { AIChatWidget } from "@/components/AIChatWidget";
import { CookieConsent } from "@/components/CookieConsent";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}


function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(() => {
    return new URLSearchParams(window.location.search).get("login") === "true";
  });
  const [returnTo] = useState(() => {
    const p = new URLSearchParams(window.location.search).get("returnTo");
    // Only honour same-origin relative paths that start with "/" and not "//"
    return p && p.startsWith("/") && !p.startsWith("//") ? p : null;
  });

  const [location] = useLocation();

  useEffect(() => {
    const handleLoginEvent = () => setShowLogin(true);
    window.addEventListener("open-login", handleLoginEvent);
    return () => window.removeEventListener("open-login", handleLoginEvent);
  }, []);

  // Track SPA pageviews on route change (no-op unless analytics configured)
  useEffect(() => {
    pageview(location);
  }, [location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const needsOnboarding = isAuthenticated && user && !user.onboardingComplete;

  return (
    <>
    <Switch>
      <Route path="/">
        {isAuthenticated ? (needsOnboarding ? <Redirect to="/onboarding" /> : <Discover />) : <Landing />}
      </Route>

      <Route path="/explore">
        <Redirect to="/" />
      </Route>

      <Route path="/dashboard">
        {!isAuthenticated ? <Redirect to="/" /> : needsOnboarding ? <Redirect to="/onboarding" /> : <Dashboard />}
      </Route>

      <Route path="/create">
        {!isAuthenticated ? <Redirect to="/" /> : needsOnboarding ? <Redirect to="/onboarding" /> : <CreateListing />}
      </Route>
      <Route path="/listings/:id">
        {needsOnboarding ? <Redirect to="/onboarding" /> : <ListingDetails />}
      </Route>
      <Route path="/my-groups">
        {!isAuthenticated ? <Redirect to="/" /> : needsOnboarding ? <Redirect to="/onboarding" /> : <MyGroups />}
      </Route>
      <Route path="/profile">
        {!isAuthenticated ? <Redirect to="/" /> : needsOnboarding ? <Redirect to="/onboarding" /> : <Profile />}
      </Route>
      <Route path="/onboarding">
        {isAuthenticated ? <Onboarding /> : <Redirect to="/" />}
      </Route>
      <Route path="/saved">
        {!isAuthenticated ? <Redirect to="/" /> : needsOnboarding ? <Redirect to="/onboarding" /> : <SavedListings />}
      </Route>
      <Route path="/notifications">
        {!isAuthenticated ? <Redirect to="/" /> : needsOnboarding ? <Redirect to="/onboarding" /> : <Notifications />}
      </Route>
      <Route path="/admin">
        {!isAuthenticated ? <Redirect to="/?login=true&returnTo=%2Fadmin" /> : !user?.isAdmin ? <Redirect to="/" /> : needsOnboarding ? <Redirect to="/onboarding" /> : <Admin />}
      </Route>
      <Route path="/admin-secret-dashboard">
        <Redirect to="/admin" />
      </Route>
      <Route path="/expired">
        {!isAuthenticated ? <Redirect to="/" /> : needsOnboarding ? <Redirect to="/onboarding" /> : <ExpiredListings />}
      </Route>
      <Route path="/vouchers">
        {!isAuthenticated ? <Redirect to="/" /> : needsOnboarding ? <Redirect to="/onboarding" /> : <Vouchers />}
      </Route>

      {/* Footer pages - available to all users */}
      <Route path="/terms">
        <Terms />
      </Route>
      <Route path="/privacy">
        <PrivacyPolicy />
      </Route>
      <Route path="/faq">
        <FAQ />
      </Route>
      <Route path="/about">
        <About />
      </Route>
      <Route path="/contact">
        <Contact />
      </Route>

      <Route component={NotFound} />
    </Switch>
    <LoginModal open={showLogin && !isAuthenticated} returnTo={returnTo} onClose={() => {
      setShowLogin(false);
      const url = new URL(window.location.href);
      url.searchParams.delete("login");
      url.searchParams.delete("returnTo");
      window.history.replaceState({}, "", url.toString());
    }} />
    </>
  );
}

function RTLProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language;
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [i18n.language]);

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    // Android hardware back button — go back in history, or exit if at root
    const listener = CapApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
    return () => { listener.then(h => h.remove()); };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ListingContextProvider>
          <RTLProvider>
            <ErrorBoundary>
              <Toaster />
              <Router />
              <AIChatWidget />
              <CookieConsent />
            </ErrorBoundary>
          </RTLProvider>
        </ListingContextProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
