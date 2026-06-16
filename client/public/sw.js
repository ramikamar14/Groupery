// Self-destruct service worker.
// This file intentionally does nothing except unregister itself and delete all
// caches. It is served at /sw.js so that any browser that previously registered
// a service worker from this path will receive this file on the next SW update
// check (every 24 h, or immediately when reg.update() is called), install it,
// activate it, and then cleanly remove itself.
//
// The old SW (grouperry-v4 through v6) had a circular-cache problem on Safari
// iOS where client.navigate() from the activate handler is silently ignored,
// meaning pages running old JS could never receive the forced reload. Removing
// the SW entirely sidesteps the problem: the browser's own HTTP cache with
// Cache-Control: immutable on hashed assets provides equivalent performance,
// and index.html with Cache-Control: no-cache always revalidates.

self.addEventListener("install", () => {
  // Skip waiting immediately so we become active without delay.
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    // 1. Delete every cache this origin has ever created.
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      // 2. Claim all open clients so we are their controller immediately.
      .then(() => self.clients.claim())
      // 3. Unregister ourselves — after this the browser has no SW for this origin.
      .then(() => self.registration.unregister())
      // 4. Tell every open tab to reload so they pick up a fresh network response
      //    without any SW in the way. We use postMessage here because
      //    client.navigate() is unreliable on Safari iOS (silently no-ops).
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SW_UNREGISTERED" });
        });
      })
  );
});

// No fetch handler — let every request go straight to the network.
// (Once we unregister in activate, this SW will never handle another fetch anyway.)
