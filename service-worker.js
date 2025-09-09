// SW estável: cache estático; API sempre online (network-first para não travar GAS).
const CACHE = "eh-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./logo.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Arquivos estáticos: cache-first; resto (inclui API): network-first.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const isStatic = ASSETS.some(a => url.pathname.endsWith(a.replace("./","/")));
  if (isStatic) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  } else {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }
});
