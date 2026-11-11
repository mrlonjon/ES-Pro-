/* Exam Scanner service worker. เปลี่ยนเลขเวอร์ชันด้านล่างทุกครั้งที่อัปเดต index.html เพื่อให้เครื่องผู้ใช้โหลดของใหม่ */
const CACHE = 'exam-scanner-v5';
const CORE = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !FONT_HOSTS.includes(url.hostname)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await cache.match('./index.html') : undefined);
    const fresh = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    }).catch(() => undefined);
    if (cached) { e.waitUntil(fresh); return cached; }
    return (await fresh) || new Response('ออฟไลน์อยู่ และยังไม่เคยโหลดหน้านี้ไว้', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
