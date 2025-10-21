const CACHE = 'mr-v5';
const ASSETS = [
  '/', '/index.html',
  '/css/style.css', '/js/app.js', '/js/calendar.js',
  '/img/icon-192.png', '/img/icon-512.png', '/img/beep.wav'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));