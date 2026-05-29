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
      // Official PostHog snippet: stubs every queued method (capture, identify,
      // …) so events fired before array.js loads are queued, not dropped.
      (function (t: any, e: any) {
        let p: any, u: any;
        t.posthog = e = e || [];
        e._i = [];
        e.init = function (i: string, s: any, a: string) {
          function g(t2: any, e2: string) {
            const o = e2.split(".");
            o.length === 2 && ((t2 = t2[o[0]]), (e2 = o[1]));
            t2[e2] = function () {
              t2.push([e2].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          let o: any = e;
          a !== undefined ? ((o = e[a] = []), (o._i = [])) : (a = "posthog");
          o.people = o.people || [];
          o.toString = function (t2?: boolean) {
            let e2 = "posthog";
            a !== "posthog" && (e2 += "." + a);
            t2 || (e2 += " (stub)");
            return e2;
          };
          o.people.toString = function () { return o.toString(1) + ".people (stub)"; };
          const methods = "init capture register register_once unregister identify alias people.set people.set_once set_config get_distinct_id reset group on off".split(" ");
          for (p = 0; p < methods.length; p++) g(o, methods[p]);
          e._i.push([i, s, a]);
        };
        e.__SV = 1;
        injectScript(`${host}/static/array.js`);
        e.init(key, { api_host: host }, undefined as any);
      })(window, (window as any).posthog);
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
