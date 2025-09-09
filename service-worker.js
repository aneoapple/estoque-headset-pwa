// service-worker.js
const CACHE_VERSION = "v8-0908-2215"; // mude a cada deploy para forçar atualização
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./logo.png"
];

// Instala e faz pre-cache do app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Limpa versões antigas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia de fetch:
// 1) NUNCA interceptar/guardar requests para script.google.com (GAS) -> deixa ir direto pra rede
// 2) Para arquivos locais, usa cache-first com fallback à rede
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Deixa o GAS passar direto (evita "Failed to fetch" por SW e evita CORS em cache)
  if (url.hostname.endsWith("script.google.com") || url.hostname.endsWith("googleusercontent.com")) {
    return; // não chama respondWith
  }

  // Apenas navegação e assets locais entram no cache
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((resp) => {
          // salvo no cache respostas básicas (GET) do mesmo host
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          return resp;
        });
      })
    );
  }
});
