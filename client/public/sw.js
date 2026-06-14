const CACHE_VERSION = "grouperry-v3";
const SHELL = ["/", "/manifest.json", "/favicon.svg", "/favicon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  // Delete ALL old caches (any key that isn't the current version)
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
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

  // Hashed assets (filename contains content hash) — cache-first, immutable
  // These are safe because the filename changes whenever content changes
  if (url.pathname.match(/\/assets\/.*\.[a-f0-9]{8}\.(js|css)$/)) {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Everything else (index.html, images, fonts) — network-first so updates show immediately
  e.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(request, clone));
        return res;
      })
      .catch(() => caches.match(request).then((r) => r || caches.match("/")))
  );
});
