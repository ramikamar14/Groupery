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

// Service worker management for production web builds.
// The SW has been intentionally removed (sw.js is now a self-destruct script).
// This block ensures any previously registered SW is cleaned up and does NOT
// re-register a new one. Once the self-destruct SW activates and unregisters
// itself, this origin will have no SW — which is the desired steady state.
if (!Capacitor.isNativePlatform() && "serviceWorker" in navigator) {
  // Nuke all caches from page context immediately — runs before any SW
  // update check completes, so it clears caches even if the old SW is still
  // the active controller.
  if ("caches" in window) {
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).catch(() => {});
  }

  // The self-destruct sw.js sends SW_UNREGISTERED after it unregisters itself.
  // Reload so the tab is running with no SW controller and gets a fresh network response.
  let reloading = false;
  navigator.serviceWorker.addEventListener("message", (ev) => {
    if ((ev.data?.type === "SW_UNREGISTERED" || ev.data?.type === "SW_RELOAD") && !reloading) {
      reloading = true;
      window.location.reload();
    }
  });

  // Reload on controllerchange too — fires when the self-destruct SW takes
  // control (claim()) before unregistering. The subsequent reload runs without
  // any SW controller.
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController && !reloading) {
      reloading = true;
      window.location.reload();
    }
  });

  window.addEventListener("load", () => {
    // Check if an old SW registration still exists and trigger an update so
    // it fetches the self-destruct sw.js. If no registration exists, do nothing
    // — we intentionally do NOT call navigator.serviceWorker.register() here.
    navigator.serviceWorker.getRegistration("/sw.js").then((reg) => {
      if (reg) {
        // Force the browser to fetch sw.js right now, bypassing the 24-hour
        // update throttle. This delivers the self-destruct SW immediately.
        reg.update().catch(() => {});
      }
    }).catch(() => {});
  });
}
