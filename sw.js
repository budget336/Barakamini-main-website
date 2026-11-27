/* Baraka West Mini Hardware website — works on a weak connection and offline.
   Pages and pictures: network first, last copy when offline.
   Product prices and stock: network first, last copy when offline (so the price list still opens). */
const VERSION = 'baraka-site-v3';
const SHELL = ['/', '/site.js', '/manifest.webmanifest', '/icon-192.png', '/images/shop-front-sm.webp'];
const DATA = 'baraka-site-data';
const API = 'https://epvswsismwpkakztoijk.supabase.co/rest/v1/';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== DATA).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function networkFirst(request, cacheName, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(fallback || request, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(fallback || request) || (fallback ? null : await cache.match(request, { ignoreSearch: false }));
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Read-only product, branch and stock lists (never the private functions).
  if (req.url.startsWith(API) && /^(products|branches|branch_stock)$/.test(url.pathname.split('/').pop())) {
    e.respondWith(networkFirst(req, DATA));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // Every page (/, /fabrics, /hardware …) is the same file.
    e.respondWith(networkFirst(req, VERSION, '/'));
    return;
  }
  e.respondWith(networkFirst(req, VERSION));
});
