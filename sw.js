const VERSION = "v1";
const CACHE_NAME = `period-tracker-${VERSION}`;

const APP_STATIC_RESOURCES = [
	"/",
	"/index.html",
	"/style.css",
	"/app.js",
	"/appmanifest.json",
	"/icons/wheel.svg",
];

// on instalal, cache the static resources
self.addEventListener("install", (e) => {
	e.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			cache.addAll(APP_STATIC_RESOURCES);
		})(),
	);
});

// delete old caches on activate
self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			const names = await caches.keys();
			await Promise.all(
				names.map((name) => {
					if (name !== CACHE_NAME) {
						return caches.delete(name);
					}
				}),
			);
			await clients.claim();
		})(),
	);
});

// on fetch, intercept server requests
// and respond with cached responses instead of going to network
self.addEventListener("fetch", (event) => {
	// when seeking an HTML page
	if ( event.request.mode === "navigate" ) {
		// return to the index.html page
		event.respondWith(caches.match("/"));
		return;
	}

	// for all other requests, go to the cache first, and then the network
	event.respondWith(
		(async() => {
			const cache = await caches.open(CACHE_NAME);
			const cachedResponse = await cache.match(event.request.url);
			if ( cachedResponse ) {
				// return the cached response if it's available
				return cachedResponse;
			}
			// respond with an HTTP 404 response status
			return new Response(null, { status: 404 });
		})(),
	);
});