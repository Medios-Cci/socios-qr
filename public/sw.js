const CACHE_NAME = 'cci-credencial-v1';

// Archivos que queremos que funcionen offline
const ARCHIVOS_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://unpkg.com/qrcode-generator@1.4.4/qrcode.js'
];

// Instalación: guardamos archivos en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpiamos caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: primero red, si falla usamos cache
self.addEventListener('fetch', (event) => {
  // Las llamadas a /verificar/ siempre van a la red (datos en tiempo real)
  if (event.request.url.includes('/verificar/')) {
    return fetch(event.request);
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardamos en cache la respuesta
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si no hay red, usamos cache
        return caches.match(event.request);
      })
  );
});
