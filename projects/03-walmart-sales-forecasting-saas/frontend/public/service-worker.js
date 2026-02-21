// Service Worker for ForecastAI PWA
// Implements caching strategies for offline capabilities

const CACHE_VERSION = 'forecastai-v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/pwa-icon-192.png',
    '/pwa-icon-512.png',
    // Add critical CSS/JS files here once bundled
];

// API endpoints cache duration (in seconds)
const API_CACHE_DURATION = 3600; // 1 hour

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installed successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE &&
                            cacheName !== DYNAMIC_CACHE &&
                            cacheName !== API_CACHE) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated successfully');
                return self.clients.claim(); // Take control of all pages
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Strategy selection based on request type
    if (url.pathname.startsWith('/api/')) {
        // API requests: Network First with timeout, fallback to cache
        event.respondWith(networkFirstWithTimeout(request, 5000));
    } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2?)$/)) {
        // Static assets: Cache First
        event.respondWith(cacheFirst(request));
    } else {
        // HTML pages: Network First, fallback to cache, then offline page
        event.respondWith(networkFirstForPages(request));
    }
});

// Caching Strategy: Cache First
async function cacheFirst(request) {
    try {
        const cached = await caches.match(request);
        if (cached) {
            console.log('[Service Worker] Cache hit:', request.url);
            return cached;
        }

        // Not in cache, fetch from network
        const response = await fetch(request);

        // Cache successful responses
        if (response && response.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.error('[Service Worker] Cache First failed:', error);
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }
        throw error;
    }
}

// Caching Strategy: Network First with Timeout
async function networkFirstWithTimeout(request, timeout = 5000) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(request, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Cache successful API responses
        if (response && response.status === 200) {
            const cache = await caches.open(API_CACHE);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);

        // Fallback to cache
        const cached = await caches.match(request);
        if (cached) {
            console.log('[Service Worker] Serving from cache:', request.url);
            return cached;
        }

        // No cache, return error response
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'You are offline and this data is not cached.'
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Caching Strategy: Network First for Pages
async function networkFirstForPages(request) {
    try {
        const response = await fetch(request);

        // Cache successful page responses
        if (response && response.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[Service Worker] Network failed for page, trying cache');

        // Try cache first
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        // Fallback to offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }

        throw error;
    }
}

// Background Sync - Queue uploads when offline
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-uploads') {
        event.waitUntil(syncUploads());
    }
});

async function syncUploads() {
    // Retrieve queued uploads from IndexedDB
    // This will be implemented with IndexedDB integration
    console.log('[Service Worker] Syncing queued uploads...');

    try {
        // Get all queued requests from IndexedDB
        const db = await openDatabase();
        const uploads = await getQueuedUploads(db);

        // Process each upload
        for (const upload of uploads) {
            try {
                const response = await fetch(upload.url, upload.options);
                if (response.ok) {
                    // Remove from queue
                    await removeFromQueue(db, upload.id);

                    // Notify client
                    const clients = await self.clients.matchAll();
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'SYNC_COMPLETE',
                            uploadId: upload.id
                        });
                    });
                }
            } catch (error) {
                console.error('[Service Worker] Upload sync failed:', error);
            }
        }
    } catch (error) {
        console.error('[Service Worker] Background sync failed:', error);
    }
}

// Push Notifications - Notify users when analysis completes
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'Your forecast analysis is complete!',
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-96.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/forecasts'
        },
        actions: [
            {
                action: 'view',
                title: 'View Results',
                icon: '/icon-view.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(
            data.title || 'ForecastAI',
            options
        )
    );
});

// Notification Click - Handle notification interactions
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Helper: Open IndexedDB (stub for now)
async function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ForecastAI', 1);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('uploads')) {
                db.createObjectStore('uploads', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Helper: Get queued uploads (stub)
async function getQueuedUploads(db) {
    return new Promise((resolve) => {
        const transaction = db.transaction(['uploads'], 'readonly');
        const store = transaction.objectStore('uploads');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
    });
}

// Helper: Remove from queue (stub)
async function removeFromQueue(db, id) {
    return new Promise((resolve) => {
        const transaction = db.transaction(['uploads'], 'readwrite');
        const store = transaction.objectStore('uploads');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
    });
}

console.log('[Service Worker] Script loaded');
