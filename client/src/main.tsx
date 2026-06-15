import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import App from "./App";
import "./index.css";
import "./lib/i18n";
import { initAnalytics } from "./lib/analytics";

// Load analytics provider (no-op unless configured via env)
initAnalytics();

// Native-only startup setup
if (Capacitor.isNativePlatform()) {
  // Keep splash screen visible until React has fully rendered
  SplashScreen.show({ autoHide: false }).catch(() => {});

  // Use light-content status bar icons (white) on dark-primary backgrounds
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Hide splash screen after first render is committed
if (Capacitor.isNativePlatform()) {
  SplashScreen.hide().catch(() => {});
}

// Register PWA service worker in production web builds
if (!Capacitor.isNativePlatform() && "serviceWorker" in navigator) {
  // Nuke all old caches immediately from page context — does NOT wait for SW
  // to activate. This kills the "grouperry-v4" cache that had the initial
  // design stored, even if the old SW is still the active controller.
  const CURRENT_CACHE = "grouperry-v6";
  if ("caches" in window) {
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CURRENT_CACHE).map((k) => caches.delete(k)))
    ).catch(() => {});
  }

  // Reload when the SW tells us to (SW's activate handler sends this after
  // clients.claim() so even pages running old JS get a forced refresh).
  let reloading = false;
  navigator.serviceWorker.addEventListener("message", (ev) => {
    if (ev.data?.type === "SW_RELOAD" && !reloading) {
      reloading = true;
      window.location.reload();
    }
  });

  // Also reload on controllerchange (works when new JS is already running).
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController && !reloading) {
      reloading = true;
      window.location.reload();
    }
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((reg) => {
        // Force immediate check for new SW — bypasses browser HTTP cache.
        // Cloudflare sees the no-cache header on /sw.js and revalidates.
        reg.update().catch(() => {});
      })
      .catch(() => {});
  });
}
