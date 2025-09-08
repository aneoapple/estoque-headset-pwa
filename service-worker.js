// network-first para o app shell; NUNCA intercepta chamadas ao script.google.com
const CACHE_NAME = 'estoque-headset-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './logo.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // deixa as requisições ao GAS seguirem direto (evita CORS/cache)
  if (url.hostname.includes('script.google.com')) return;

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
