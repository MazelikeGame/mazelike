self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("mazelike").then((cache) => {
      return cache.addAll(["/offline.html"]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    // by default go to the server
    fetch(e.request).catch(() => {
      // fall back on offline
      return caches.match(new Request("/offline.html"));
    })
  );
});