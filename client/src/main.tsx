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
