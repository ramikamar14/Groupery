/**
 * Server-rendered SEO: per-listing OG/Twitter meta injection and a dynamic
 * sitemap. Social scrapers (WhatsApp/Discord/Twitter) and search crawlers do
 * not execute the SPA's client-side meta effects — the share-to-fill growth
 * loop depends on link previews showing the actual deal, so the meta must be
 * in the initial HTML response.
 *
 * Registered BEFORE serveStatic / the SPA fallback so GET /listings/:id and
 * GET /sitemap.xml are handled here first. Any failure falls through to
 * next() — SEO must never break the page.
 */
import fs from "fs";
import path from "path";
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const SITE_ORIGIN = "https://grouperry.com";
const DEFAULT_SHARE_IMAGE = `${SITE_ORIGIN}/grouperry-app-icon-share.png`;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function xmlEsc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// index.html is read once per process (content-hashed assets change per build,
// and pm2 restarts the process on deploy, so caching is safe).
let indexHtmlCache: string | null = null;
function readIndexHtml(): string | null {
  if (indexHtmlCache) return indexHtmlCache;
  try {
    const p = path.resolve(__dirname, "public", "index.html");
    indexHtmlCache = fs.readFileSync(p, "utf-8");
    return indexHtmlCache;
  } catch {
    return null;
  }
}

function truncate(s: string, max: number): string {
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + "…";
}

/** Replace the content of an existing meta tag by property/name, if present. */
function setMeta(html: string, attr: "property" | "name", key: string, value: string): string {
  const re = new RegExp(`(<meta\\s+${attr}="${key.replace(/[:.]/g, "\\$&")}"\\s+content=")[^"]*(")`);
  return re.test(html) ? html.replace(re, `$1${value}$2`) : html;
}

function buildListingHtml(base: string, listing: any): string {
  const id = listing.id;
  const url = `${SITE_ORIGIN}/listings/${id}`;
  const savePct =
    listing.marketPrice && listing.pricePerSlot && listing.marketPrice > listing.pricePerSlot
      ? Math.round((1 - listing.pricePerSlot / listing.marketPrice) * 100)
      : 0;
  const titleBits = [
    listing.title,
    `${listing.filledSlots}/${listing.totalSlots} joined`,
    savePct > 0 ? `save ${savePct}%` : "",
  ].filter(Boolean);
  const title = esc(truncate(`${titleBits.join(" — ")} | Grouperry`, 120));
  const desc = esc(truncate(String(listing.description || "Join this group buy on Grouperry."), 160));
  const image = esc(listing.imageUrl ? String(listing.imageUrl) : DEFAULT_SHARE_IMAGE);

  let html = base;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = setMeta(html, "name", "description", desc);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", desc);
  html = setMeta(html, "property", "og:url", esc(url));
  html = setMeta(html, "property", "og:image", image);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", desc);
  html = setMeta(html, "name", "twitter:image", image);
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${esc(url)}"`,
  );

  // JSON-LD Product schema for search engines.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: truncate(String(listing.description || ""), 300),
    image: listing.imageUrl || DEFAULT_SHARE_IMAGE,
    url,
    offers: {
      "@type": "Offer",
      price: listing.pricePerSlot ? (listing.pricePerSlot / 100).toFixed(2) : undefined,
      priceCurrency: "USD",
      availability:
        listing.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      url,
    },
  };
  html = html.replace(
    "</head>",
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script></head>`,
  );
  return html;
}

export function registerSeoRoutes(app: Express): void {
  // Dynamic sitemap: static routes + active listings.
  app.get("/sitemap.xml", async (_req: Request, res: Response) => {
    try {
      const staticRoutes = ["/", "/explore", "/how-it-works", "/faq", "/about", "/contact", "/terms", "/privacy"];
      const listings = await storage.getListings({ limit: 500, offset: 0 });
      const now = new Date().toISOString().slice(0, 10);
      const urls: string[] = [
        ...staticRoutes.map(
          (r) => `<url><loc>${xmlEsc(SITE_ORIGIN + r)}</loc><lastmod>${now}</lastmod></url>`,
        ),
        ...listings
          .filter((l: any) => l.status === "active")
          .map((l: any) => {
            const lastmod = (l.updatedAt || l.createdAt || new Date()).toISOString?.()?.slice(0, 10) || now;
            return `<url><loc>${xmlEsc(`${SITE_ORIGIN}/listings/${l.id}`)}</loc><lastmod>${lastmod}</lastmod></url>`;
          }),
      ];
      res
        .status(200)
        .set("Content-Type", "application/xml")
        .set("Cache-Control", "public, max-age=3600")
        .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
    } catch (e) {
      res.status(200).set("Content-Type", "application/xml").send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE_ORIGIN}/</loc></url></urlset>`,
      );
    }
  });

  // Per-listing OG injection — HTML navigations only; API/JSON callers and
  // asset requests fall through untouched.
  app.get("/listings/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accept = String(req.headers.accept || "");
      if (!accept.includes("text/html")) return next();
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) return next();

      const base = readIndexHtml();
      if (!base) return next(); // dev mode (vite serves HTML) or missing build

      const listing = await storage.getListing(id);
      if (!listing) return next();

      // Same caching posture as the SPA fallback: always revalidate at the edge.
      res
        .status(200)
        .set("Content-Type", "text/html; charset=utf-8")
        .set("Cache-Control", "no-cache, stale-if-error=30")
        .send(buildListingHtml(base, listing));
    } catch {
      next();
    }
  });
}
