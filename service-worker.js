// network-first e IGNORA chamadas ao Apps Script
const CACHE_NAME = 'estoque-headset-v1';
const APP_SHELL = ['./','./index.html','./logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE_NAME ? caches.delete(k) : null))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // deixa a API do Apps Script passar direto
  if (url.hostname.includes('script.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(resp => { caches.open(CACHE_NAME).then(c => c.put(e.request, resp.clone())).catch(()=>{}); return resp; })
      .catch(() => caches.match(e.request))
  );
});
