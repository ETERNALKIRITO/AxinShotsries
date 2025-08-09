const CACHE_NAME = 'dynamic-link-library-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js'
];

// Install the service worker and pre-cache the app shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
    // --- START of the fix ---
    // Only handle http and https requests. Ignore others (like chrome-extension://)
    if (!event.request.url.startsWith('http')) {
        return; 
    }
    // --- END of the fix ---

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // If the resource is in the cache, return it
                if (cachedResponse) {
                    return cachedResponse;
                }

                // If the resource is not in the cache, fetch it from the network
                return fetch(event.request).then(
                    networkResponse => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                            return networkResponse;
                        }

                        // Clone the response because it's a stream and can only be consumed once
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Cache the new resource for future offline use
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    }
                ).catch(error => {
                    console.log('Fetch failed; user is likely offline.', error);
                });
            })
    );
});