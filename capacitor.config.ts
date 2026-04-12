import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.grouperry.app",
  appName: "Grouperry",
  webDir: "dist/public",
  server: {
    // All API calls go to the production backend.
    // For local dev: set CAPACITOR_SERVER_URL env var and run `npx cap run android --livereload`.
    androidScheme: "https",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,       // We control hide() manually after render
      launchAutoHide: false,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",               // White icons on coloured backgrounds
      backgroundColor: "#ffffff",
    },
  },
};

export default config;
