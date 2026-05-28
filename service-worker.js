/* Service worker sencillo para PWA (cache-first de assets). */
const CACHE_NAME = "paramo-libre-v2";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./registro.html",
  "./recuperar.html",
  "./catalogo.html",
  "./detalle-libro.html",
  "./mis-libros.html",
  "./comentarios.html",
  "./chats.html",
  "./offline.html",
  "./styles.css",
  "./main.js",
  "./firebase.js",
  "./firebase-config.js",
  "./sw-register.js",
  "./manifest.webmanifest",
  "./img/logopl.png",
  "./img/cover-1.svg",
  "./img/cover-2.svg",
  "./img/cover-3.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key === CACHE_NAME ? Promise.resolve() : caches.delete(key)))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const url = new URL(request.url);
      const isSameOrigin = url.origin === self.location.origin;

      // Navegaciones: intentar red y si falla, offline.
      if (request.mode === "navigate") {
        try {
          const network = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, network.clone());
          return network;
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match("./offline.html"));
        }
      }

      // Assets: cache-first.
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        const network = await fetch(request);
        if (isSameOrigin) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, network.clone());
        }
        return network;
      } catch {
        // Si es algo esencial y no hay red, cae a offline.
        return (await caches.match("./offline.html")) || Response.error();
      }
    })()
  );
});

