/**
 * AI Buffet - Service Worker
 * Provides offline functionality and asset caching
 */

const CACHE_VERSION = 'ai-buffet-v1.0.0';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/main.min.css',
    '/assets/js/main.min.js',
    '/assets/css/critical.css',
    '/img/Logo.png',
    '/static/favicon.ico',
    '/static/apple-touch-icon.png',
    '/static/favicon-32x32.png',
    '/static/favicon-16x16.png'
];

// Routes to cache dynamically
const CACHE_ROUTES = [
    '/articles/',
    '/categories/',
    '/posts/'
];

// Maximum runtime cache size
const MAX_RUNTIME_CACHE_SIZE = 50;

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name.startsWith('ai-buffet-') && name !== CACHE_NAME && name !== RUNTIME_CACHE;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip API calls (if any)
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version and update in background
                    fetchAndCache(request);
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetchAndCache(request);
            })
            .catch((error) => {
                console.error('[SW] Fetch failed:', error);

                // Return offline page if available
                if (request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }

                throw error;
            })
    );
});

/**
 * Fetch and cache helper function
 */
async function fetchAndCache(request) {
    try {
        const response = await fetch(request);

        // Only cache successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
            return response;
        }

        // Check if this route should be cached
        const url = new URL(request.url);
        const shouldCache = CACHE_ROUTES.some(route => url.pathname.startsWith(route));

        if (shouldCache) {
            const cache = await caches.open(RUNTIME_CACHE);

            // Clone the response because it can only be consumed once
            cache.put(request, response.clone());

            // Limit cache size
            limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
        }

        return response;
    } catch (error) {
        console.error('[SW] Network fetch failed:', error);
        throw error;
    }
}

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxSize) {
        const keysToDelete = keys.slice(0, keys.length - maxSize);
        await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
}

/**
 * Message event - handle cache updates
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => caches.delete(name))
            );
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

/**
 * Background sync (if supported)
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-articles') {
        event.waitUntil(syncArticles());
    }
});

async function syncArticles() {
    try {
        // Fetch latest articles when back online
        const response = await fetch('/api/articles/latest');
        const articles = await response.json();

        // Update cache
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put('/api/articles/latest', new Response(JSON.stringify(articles)));

        console.log('[SW] Articles synced successfully');
    } catch (error) {
        console.error('[SW] Article sync failed:', error);
    }
}
