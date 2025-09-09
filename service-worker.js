/* PWA – cache básico do app shell + network-first para a API */
const CACHE = "eh-v10";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./logo.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Para a API do GAS: network-first
  if (url.hostname.includes("script.google.com")) {
    e.respondWith(
      fetch(e.request)
        .then(res => res)               // não cacheia API
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // App shell: cache-first com fallback à rede
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        const resClone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, resClone));
        return res;
      })
    )
  );
});
