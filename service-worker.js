const CACHE_NAME = 'russian-talk-tutor-v2';
const STATIC_CACHE = 'russian-talk-tutor-static-v2';
const DYNAMIC_CACHE = 'russian-talk-tutor-dynamic-v2';

// Static assets that should use Cache-First strategy
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other static assets as needed
];

// Install a service worker and pre-cache critical static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[Service Worker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('[Service Worker] Pre-cache failed for some assets:', err);
        // Don't fail installation if some assets can't be cached
      });
    }).then(() => {
      console.log('[Service Worker] Installation complete');
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

// Determine the caching strategy based on request type
function getCachingStrategy(request) {
  const url = new URL(request.url);

  // For API calls to Gemini, always go to the network (no caching)
  if (url.href.includes('generativelanguage.googleapis.com')) {
    return 'network-only';
  }

  // For our own API endpoints, use Network-First
  if (url.pathname.startsWith('/api/')) {
    return 'network-first';
  }

  // For static JSON conversation data, use Cache-First (these are pre-generated)
  if (url.pathname.startsWith('/data/conversations/')) {
    return 'cache-first';
  }

  // For static assets (JS, CSS, images, fonts), use Cache-First
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)) {
    return 'cache-first';
  }

  // For HTML pages, use Network-First to ensure fresh content
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    return 'network-first';
  }

  // Default to Network-First for everything else
  return 'network-first';
}

// Cache-First strategy: Check cache first, fallback to network
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('[Service Worker] Cache hit:', request.url);
    return cachedResponse;
  }

  console.log('[Service Worker] Cache miss, fetching:', request.url);
  try {
    const fetchResponse = await fetch(request);
    if (fetchResponse && fetchResponse.status === 200) {
      // Only cache http/https requests
      const url = new URL(request.url);
      if (url.protocol.startsWith('http')) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, fetchResponse.clone()).catch(err => {
          console.log('[Service Worker] Cache put failed:', err.message);
        });
      }
    }
    return fetchResponse;
  } catch (error) {
    console.log('[Service Worker] Fetch failed:', error);
    throw error;
  }
}

// Network-First strategy: Try network first, fallback to cache
async function networkFirst(request) {
  try {
    const fetchResponse = await fetch(request);
    if (fetchResponse && fetchResponse.status === 200) {
      // Only cache http/https requests
      const url = new URL(request.url);
      if (url.protocol.startsWith('http')) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, fetchResponse.clone()).catch(err => {
          console.log('[Service Worker] Cache put failed:', err.message);
        });
      }
    }
    return fetchResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Serve cached content when offline
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP(S) schemes (chrome-extension, etc.)
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) {
    return;
  }

  const strategy = getCachingStrategy(event.request);

  if (strategy === 'network-only') {
    // No caching, just fetch from network
    return;
  }

  if (strategy === 'cache-first') {
    event.respondWith(cacheFirst(event.request));
  } else if (strategy === 'network-first') {
    event.respondWith(networkFirst(event.request));
  }
});


// Clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activation complete');
      // Claim all clients so the new service worker takes effect immediately
      return self.clients.claim();
    })
  );
});