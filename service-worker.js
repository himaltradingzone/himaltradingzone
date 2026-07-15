// Himal Trading Zone - Service Worker
// এই ফাইলটা শুধুমাত্র PWA ইনস্টল-যোগ্যতার শর্ত পূরণ করার জন্য এবং সাইটটা একবার
// লোড হওয়া পেজগুলোকে অফলাইনেও দ্রুত খোলার জন্য একটা হালকা ক্যাশ রাখে।
// অ্যাপের আসল ডেটা (লগইন, সাবস্ক্রিপশন, ট্রেড হিস্টোরি) সবসময় Firebase থেকেই
// লাইভ আসে - এই ফাইল সেটাতে হাত দেয় না।

const CACHE_NAME = 'htz-cache-v1';
const PRECACHE_URLS = [
  './htz.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Firebase/API কলগুলো সবসময় নেটওয়ার্ক থেকেই আনতে হবে, ক্যাশ থেকে না
  if (event.request.method !== 'GET' || event.request.url.includes('firestore') || event.request.url.includes('googleapis')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
