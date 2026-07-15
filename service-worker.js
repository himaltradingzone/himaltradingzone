// এই সার্ভিস ওয়ার্কারটা শুধু ক্রোমকে বলার জন্য যে এই ওয়েবসাইটটা একটা ইনস্টলযোগ্য
// অ্যাপ (PWA)। এটা কোনো ডেটা cache করে না, Firebase বা অন্য কোনো নেটওয়ার্ক
// রিকোয়েস্ট পরিবর্তন করে না — সব রিকোয়েস্ট স্বাভাবিকভাবেই নেটওয়ার্কে যাবে।

const CACHE_NAME = 'htz-shell-v1';
const APP_SHELL = ['./index.html'];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// শুধু app-shell এর জন্য "network first, cache fallback" — বাকি সবকিছু (Firebase,
// Firestore, CDN ইত্যাদি) সরাসরি নেটওয়ার্কে যাবে, কোনো হস্তক্ষেপ ছাড়াই।
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
        return; // browser default behavior
    }
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
