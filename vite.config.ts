import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  // Web builds need absolute asset paths ("/assets/...") so deep routes like
  // /listing/abc resolve assets correctly. Capacitor builds (CAP_BUILD=1) need
  // relative paths so the app works from the native webview's file:// origin
  // (no server involved for static assets).
  base: process.env.CAP_BUILD ? "./" : "/",
  define: {
    __BUILD_ID__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) || "dev"),
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
