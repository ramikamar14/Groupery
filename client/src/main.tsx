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
  window.addEventListener("load", () => {
    navigator.serviceWorker
      // updateViaCache:'none' → browser ALWAYS re-fetches sw.js over the network,
      // bypassing HTTP cache (Cloudflare, disk cache, etc.).  Without this, the
      // browser may serve the old sw.js from cache and never see our version bump.
      .register("/sw.js", { updateViaCache: "none" })
      .then((reg) => {
        // Force an immediate update check so an already-installed SW doesn't
        // linger until the next page load.
        reg.update().catch(() => {});
      })
      .catch(() => {});
  });
}
