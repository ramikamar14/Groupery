/**
 * Build stamp injected by vite.config.ts via `define`. Set to the first 7
 * chars of GITHUB_SHA in CI (falls back to "dev" locally), so the live build
 * can be verified in the browser console and site footer.
 */
declare const __BUILD_ID__: string;
