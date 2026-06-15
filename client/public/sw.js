const CACHE_VERSION = "grouperry-v6";
const SHELL = ["/", "/manifest.json", "/favicon.svg", "/favicon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        clients.forEach((client) => {
          // Force-navigate the tab to itself — picks up the new SW on fresh HTML.
          // client.navigate() is called from SW context so it works even if the
          // page is running old JS with no message listener.
          try { client.navigate(client.url); } catch (_) {}
          // Fallback postMessage for browsers that don't support client.navigate()
          try { client.postMessage({ type: "SW_RELOAD", version: CACHE_VERSION }); } catch (_) {}
        });
      })
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Network-first for API calls — never cache
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ error: "offline" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }))
    );
    return;
  }

  // Hashed assets — cache-first, immutable.
  // Vite 7 uses base62 hashes like "Otfgh0QC" separated by "-", not "."
  // Pattern: /assets/name-HASH.ext
  if (url.pathname.match(/\/assets\/.+-[A-Za-z0-9_-]{6,}\.(js|css)$/)) {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, clone));
        }
        return res;
      }))
    );
    return;
  }

  // Everything else (index.html, images, fonts) — network-first so updates show immediately
  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request).then((r) => r || caches.match("/")))
  );
});
