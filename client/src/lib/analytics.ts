/**
 * Provider-agnostic analytics.
 *
 * Activated by env at build time. Supports Plausible, Google Analytics 4, and
 * PostHog behind a single `track()` / `pageview()` API. When no provider is
 * configured every call is a silent no-op, so the app is unaffected.
 *
 * Env vars:
 *   VITE_ANALYTICS_PROVIDER = "plausible" | "ga4" | "posthog" | "none"
 *   VITE_PLAUSIBLE_DOMAIN   = e.g. "grouperry.com"
 *   VITE_PLAUSIBLE_SRC      = optional custom script src
 *   VITE_GA4_ID             = e.g. "G-XXXXXXX"
 *   VITE_POSTHOG_KEY        = project API key
 *   VITE_POSTHOG_HOST       = optional, defaults to https://us.i.posthog.com
 */

type Props = Record<string, string | number | boolean | undefined>;

const provider = (import.meta.env.VITE_ANALYTICS_PROVIDER as string | undefined)?.toLowerCase() ?? "none";

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Props }) => void;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    posthog?: any;
  }
}

let initialized = false;

function injectScript(src: string, attrs: Record<string, string> = {}): void {
  const s = document.createElement("script");
  s.src = src;
  s.defer = true;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  document.head.appendChild(s);
}

/** Load the configured provider's script once. Call early (e.g. in main.tsx). */
export function initAnalytics(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  try {
    if (provider === "plausible") {
      const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
      if (!domain) return;
      const src = (import.meta.env.VITE_PLAUSIBLE_SRC as string) || "https://plausible.io/js/script.js";
      injectScript(src, { "data-domain": domain });
    } else if (provider === "ga4") {
      const id = import.meta.env.VITE_GA4_ID as string | undefined;
      if (!id) return;
      injectScript(`https://www.googletagmanager.com/gtag/js?id=${id}`);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() { window.dataLayer!.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", id, { send_page_view: false });
    } else if (provider === "posthog") {
      const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
      if (!key) return;
      const host = (import.meta.env.VITE_POSTHOG_HOST as string) || "https://us.i.posthog.com";
      // Minimal PostHog snippet loader
      (function (h: any) {
        h.posthog = h.posthog || [];
        injectScript(`${host}/static/array.js`);
        h.posthog._i = h.posthog._i || [];
        h.posthog.init = (apiKey: string, opts: any) => h.posthog._i.push([apiKey, opts]);
        h.posthog.init(key, { api_host: host });
      })(window);
    }
  } catch {
    /* analytics must never break the app */
  }
}

export const analyticsEnabled = provider !== "none";

/** Record a custom event. No-op when analytics is disabled. */
export function track(event: string, props?: Props): void {
  if (provider === "none" || typeof window === "undefined") return;
  try {
    if (provider === "plausible") window.plausible?.(event, props ? { props } : undefined);
    else if (provider === "ga4") window.gtag?.("event", event, props);
    else if (provider === "posthog") window.posthog?.capture?.(event, props);
  } catch {
    /* swallow */
  }
}

/** Record a pageview for SPA route changes. */
export function pageview(path: string): void {
  if (provider === "none" || typeof window === "undefined") return;
  try {
    if (provider === "plausible") window.plausible?.("pageview");
    else if (provider === "ga4") window.gtag?.("event", "page_view", { page_path: path });
    else if (provider === "posthog") window.posthog?.capture?.("$pageview", { path });
  } catch {
    /* swallow */
  }
}
