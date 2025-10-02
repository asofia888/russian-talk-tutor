const CACHE_NAME = 'russian-talk-tutor-v1';

// Install a service worker and cache the app shell
self.addEventListener('install', event => {
  // Perform install steps
  // We don't pre-cache anything here, we will cache on the fly.
  // This ensures we always get the latest from the network on first load,
  // but can serve from cache for subsequent offline loads.
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For API calls to Gemini, always go to the network.
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    // This will fall back to the browser's default fetch behavior.
    return;
  }

  event.respondWith(
    // Try the network first
    fetch(event.request).then(fetchResponse => {
      // If we get a valid response, we cache it
      if (fetchResponse && fetchResponse.status === 200) {
        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
      }
      return fetchResponse;
    }).catch(() => {
      // If the network fails, try to serve from the cache
      return caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // If not in cache and network fails, the browser will handle the error.
        // For navigation requests, we could return a specific offline page if we had one cached.
      });
    })
  );
});


// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});