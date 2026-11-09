// מעבדת מבחנים — service worker: התקנה לטלפון ועבודה בלי אינטרנט (ברכבת).
// הדף: הרשת קודמת, ובלי רשת — מהמטמון. ספריית Supabase מה-CDN: מהמטמון (גרסה קבועה). קריאות ל-Supabase עצמו לא עוברות כאן.
const CACHE = "study-1.6.0";
const LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).then(() => c.add(LIB).catch(() => { }))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("study-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (req.url.startsWith(LIB)) { e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; }))); return; }
  if (url.origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
    .catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
});
