const CACHE_NAME = 'no-smoking-nisa-v2';
const APP_SHELL = [
    './',
    './index.html',
    './assets/style.css',
    './assets/app.js',
    './data/funds.json',
    './data/brokers.json',
    './assets/images/camp/03_hero_background_wide.png',
    './assets/images/camp/13_icon_leaf_recovery.png',
    './assets/images/camp/14_icon_lungs.png',
    './assets/images/camp/15_icon_heart.png',
    './assets/images/camp/16_icon_walking.png',
    './assets/images/camp/17_icon_eating.png',
    './assets/images/camp/18_icon_brain_health.png',
    './assets/images/camp/19_icon_lung_recovery.png',
    './assets/images/camp/20_icon_full_recovery.png',
    './assets/images/camp/22_icon_calendar_days.png',
    './assets/images/camp/23_icon_box_count.png',
    './assets/images/camp/24_icon_money_saved.png',
    './assets/images/pwa/icon-192.png',
    './assets/images/pwa/icon-512.png',
    './assets/images/ogp/ogp.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => Promise.all(
                APP_SHELL.map((url) => cache.add(url).catch(() => null))
            ))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request).then((cached) => (
                cached || caches.match('./index.html')
            )))
    );
});
