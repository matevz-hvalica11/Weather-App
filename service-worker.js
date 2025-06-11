// Name for the cache version.
var CACHE_NAME = 'weather-app-cache-v1';
//List of URLs to cache.
var urlsToCache = [
    '/',
    '/index.cshtml',
    '/css/site.css',
    '/js/site.js'
    // Add any additional assets like icons or fonts here.
];

// The install event opens the cache and caches the specified resources.
self.addEventListener('install', function (event) {
    console.log("Service Worker Install Event Triggered");
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.log("Opened cache, adding files:", urlsToCache);
              return cache.addAll(urlsToCache);
            })
            .catch(error => console.error("Cache addition failed:", error))
    );
});

// The fetch event intercepts requests and serves them from the cache if available.
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
          .then(function(response) {
              // Return the cached response if found.
              if (response) {
                  return response;
              }
              // Otherwise, fetch the resource from the network.
              return fetch(event.request);
          })
    );
});

self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys.then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheNames) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});