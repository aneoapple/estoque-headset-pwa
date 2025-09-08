// v4 — ignora totalmente chamadas ao Google/AppScript
const CACHE_NAME = 'estoque-headset-v4';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
const BYPASS_HOSTS = [
  'script.google.com',
  'script.googleusercontent.com',
  'googleusercontent.com'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Não intercepta chamadas para o Google/AppScript
  if (BYPASS_HOSTS.some(h => url.hostname.includes(h))) {
    return; // deixa seguir direto para a rede
  }

  // Para os demais, aplica network-first
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
