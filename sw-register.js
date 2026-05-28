(() => {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      // En desarrollo local (Live Server) el cache del Service Worker suele confundir.
      // Para evitar “errores fantasma”, en localhost/127.0.0.1 desactivamos el SW
      // y limpiamos caches automáticamente.
      const host = window.location.hostname;
      const isLocal =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "[::1]" ||
        host.endsWith(".local");

      if (isLocal) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if (window.caches?.keys) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        return;
      }

      await navigator.serviceWorker.register("./service-worker.js", { scope: "./" });
    } catch (err) {
      // Si falla el SW, la app igual funciona online.
      console.warn("Service Worker no pudo registrarse:", err);
    }
  });
})();

