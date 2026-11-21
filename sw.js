const CACHE_NAME = "namu-studio-v35";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/page-logo.png?v=35",
  "/icon-192.png?v=35",
  "/icon-512.png?v=35",
  "/apple-touch-icon.png?v=35"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
