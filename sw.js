// GoalTracker 1.0.5 - Offline-Zwischenspeicher
var CACHE = 'goaltracker-1.0.5';
var FILES = ["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png","lib/jspdf.plugin.autotable.min.js","lib/jspdf.umd.min.js","lib/xlsx.full.min.js"];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url), same = u.origin === location.origin;
  var isPage = same && (e.request.mode === 'navigate' || /\/(index\.html)?$/.test(u.pathname));
  if (isPage) {
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(function (r) {
      if (r && r.ok) { var c = r.clone(); caches.open(CACHE).then(function (ch) { ch.put('index.html', c); }); }
      return r;
    }).catch(function () { return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function (hit) {
    return hit || fetch(e.request).then(function (r) {
      if (r && r.ok && same) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return r;
    });
  }));
});