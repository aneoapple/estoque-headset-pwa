// service-worker.js — v2 (network-first, same-origin GET only, ignora Apps Script)
const CACHE_NAME = 'estoque-headset-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instala e pré-cacheia o shell
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

// Ativa e remove caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : undefined)))
    )
  );
  self.clients.claim();
});

// Network-first só para GET do mesmo domínio.
// Nunca intercepta chamadas ao Apps Script (nem eventuais redirecionamentos).
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Só GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Deixa passar tudo que NÃO é do mesmo host (CDNs, APIs externas etc.)
  if (url.origin !== self.location.origin) {
    // E em particular, nem toca em Apps Script
    if (url.hostname.includes('script.google.com') ||
        url.hostname.includes('googleusercontent.com')) {
      return;
    }
    return; // externo → browser lida direto
  }

  // Mesma origem → network-first com fallback ao cache
  event.respondWith(
    fetch(req)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(req))
  );
});
