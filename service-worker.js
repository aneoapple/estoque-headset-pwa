// service-worker.js (network-first + ignora chamadas à API do Apps Script)
const CACHE_NAME = 'estoque-headset-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// instala e pré-cacheia shell
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

// ativa e limpa caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// estratégia: network-first; mas nunca intercepta a API do Apps Script
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Deixa a API do Apps Script passar direto (evita CORS/cache)
  if (url.hostname.includes('script.google.com') || url.hostname.includes('script.googleusercontent.com')) {
    return; // não responde — o browser segue normal
  }

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy)).catch(()=>{});
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
