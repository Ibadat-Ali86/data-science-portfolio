/**
 * PWA Service Worker Registration
 * Handles service worker lifecycle and provides utilities for PWA features
 */

// Register service worker
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/'
                });

                console.log('[PWA] Service Worker registered:', registration.scope);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            console.log('[PWA] New version available! Refresh to update.');

                            // Notify user
                            if (window.confirm('A new version is available! Refresh to update?')) {
                                window.location.reload();
                            }
                        }
                    });
                });

                return registration;
            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
            }
        });
    } else {
        console.warn('[PWA] Service Workers not supported in this browser');
    }
}

// Get install prompt event
let deferredPrompt = null;

export function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent automatic prompt
        e.preventDefault();

        // Store for later use
        deferredPrompt = e;

        console.log('[PWA] Install prompt available');

        // Dispatch custom event for UI components
        window.dispatchEvent(new CustomEvent('pwa-installable'));
    });

    // Track successful install
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App installed successfully');
        deferredPrompt = null;

        // Track analytics
        if (window.gtag) {
            window.gtag('event', 'pwa_install', {
                event_category: 'engagement'
            });
        }
    });
}

// Show install prompt
export async function showInstallPrompt() {
    if (!deferredPrompt) {
        console.warn('[PWA] Install prompt not available');
        return false;
    }

    try {
        // Show the prompt
        deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`[PWA] User choice: ${outcome}`);

        // Reset prompt
        deferredPrompt = null;

        return outcome === 'accepted';
    } catch (error) {
        console.error('[PWA] Install prompt error:', error);
        return false;
    }
}

// Check if app is already installed
export function isAppInstalled() {
    // Check standalone mode (iOS)
    if (window.navigator.standalone) {
        return true;
    }

    // Check display mode (Android/Desktop)
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }

    return false;
}

// Background Sync - Queue upload for offline
export async function queueUpload(url, data) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            // Store in IndexedDB
            const db = await openDatabase();
            await addToUploadQueue(db, { url, data, timestamp: Date.now() });

            // Register sync
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('sync-uploads');

            console.log('[PWA] Upload queued for background sync');
            return true;
        } catch (error) {
            console.error('[PWA] Background sync failed:', error);
            return false;
        }
    }

    return false;
}

// IndexedDB helpers
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('AdaptIQ', 1);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object stores
            if (!db.objectStoreNames.contains('uploads')) {
                db.createObjectStore('uploads', { keyPath: 'id', autoIncrement: true });
            }

            if (!db.objectStoreNames.contains('forecasts')) {
                const forecastStore = db.createObjectStore('forecasts', { keyPath: 'id' });
                forecastStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            if (!db.objectStoreNames.contains('cache_metadata')) {
                db.createObjectStore('cache_metadata', { keyPath: 'key' });
            }
        };
    });
}

function addToUploadQueue(db, upload) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['uploads'], 'readwrite');
        const store = transaction.objectStore('uploads');
        const request = store.add(upload);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Cache forecast result
export async function cacheForecast(forecastData) {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(['forecasts'], 'readwrite');
        const store = transaction.objectStore('forecasts');

        const forecast = {
            id: forecastData.id || Date.now().toString(),
            name: forecastData.name || 'Unnamed Forecast',
            description: forecastData.description || '',
            data: forecastData,
            timestamp: Date.now()
        };

        await new Promise((resolve, reject) => {
            const request = store.put(forecast);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log('[PWA] Forecast cached:', forecast.id);
        return true;
    } catch (error) {
        console.error('[PWA] Cache forecast failed:', error);
        return false;
    }
}

// Get cached forecasts
export async function getCachedForecasts(limit = 5) {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(['forecasts'], 'readonly');
        const store = transaction.objectStore('forecasts');
        const index = store.index('timestamp');

        return new Promise((resolve, reject) => {
            const request = index.openCursor(null, 'prev'); // Descending order
            const results = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('[PWA] Get cached forecasts failed:', error);
        return [];
    }
}

// Request push notification permission
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('[PWA] Notifications not supported');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications() {
    try {
        const registration = await navigator.serviceWorker.ready;

        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // Subscribe
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    // Replace with your VAPID public key
                    'YOUR_PUBLIC_VAPID_KEY_HERE'
                )
            });
        }

        console.log('[PWA] Push subscription:', subscription);

        // Send subscription to server
        // await fetch('/api/push/subscribe', {
        //   method: 'POST',
        //   body: JSON.stringify(subscription),
        //   headers: { 'Content-Type': 'application/json' }
        // });

        return subscription;
    } catch (error) {
        console.error('[PWA] Push subscription failed:', error);
        return null;
    }
}

// Helper: Convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

// Network status
export function onlineStatus() {
    return {
        isOnline: navigator.onLine,
        addEventListener: (callback) => {
            window.addEventListener('online', () => callback(true));
            window.addEventListener('offline', () => callback(false));
        }
    };
}

// Initialize all PWA features
export function initializePWA() {
    console.log('[PWA] Initializing...');

    registerServiceWorker();
    setupInstallPrompt();

    // Log install status
    console.log('[PWA] App installed:', isAppInstalled());
    console.log('[PWA] Online status:', navigator.onLine);

    // Listen to network changes
    window.addEventListener('online', () => {
        console.log('[PWA] Back online!');
    });

    window.addEventListener('offline', () => {
        console.log('[PWA] Gone offline');
    });
}
