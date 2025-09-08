self.addEventListener('install', e=>{
  e.waitUntil(caches.open('eh-cache').then(c=>c.addAll(['./','./index.html'])));
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(resp=>resp || fetch(e.request))
  );
});
