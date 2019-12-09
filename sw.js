const CACHE_NAME = "football-data-pwa";
var urlsToCache = [
  "/",
  "/index.html",
  "/nav.html",
  "/images/icon-512.png",
  "/images/icon-192.png",
  "/images/icon-128.png",
  "/css/materialize.min.css",
  "/css/style.css",
  "/js/materialize.min.js",
  "/js/main.js",
  "/js/idb.js",
  "/manifest.json"
];

self.addEventListener("install", function(event) {
  console.log("ServiceWorker: Menginstall..");

  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("ServiceWorker: Membuka cache..");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", function(event) {
  // event.respondWith(
  //   caches.match(event.request).then(function(response) {
  //     console.log("ServiceWorker: Menarik data: ", event.request.url);

  //     if (response) {
  //       console.log("ServiceWorker: Gunakan aset dari cache: ", response.url);
  //       return response;
  //     }

  //     console.log(
  //       "ServiceWorker: Memuat aset dari server: ",
  //       event.request.url
  //     );
  //     return fetch(event.request);
  //   })
  // );

  // cache 1st strategy
  event.respondWith(
    caches
      .match(event.request, { cacheName: CACHE_NAME })
      .then(function(response) {
        if (response) {
          return response;
        }
        var fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(function(response) {
          if (!response || response.status !== 200) {
            return response;
          }
          var responseToCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
  );

  // stale while validate strategy
  // event.respondWith(
  //   caches.open(CACHE_NAME).then(function(cache) {
  //     return cache.match(event.request).then(function(response) {
  //       var fetchPromise = fetch(event.request).then(function(networkResponse) {
  //         cache.put(event.request, networkResponse.clone());
  //         return networkResponse;
  //       });
  //       return response || fetchPromise;
  //     });
  //   })
  // );

  self.addEventListener("notificationclick", function(event) {
    if (!event.action) {
      // Penguna menyentuh area notifikasi diluar action
      console.log("Notification Click.");
      return;
    }
    switch (event.action) {
      case "yes-action":
        console.log("Pengguna memilih action yes.");
        // buka tab baru
        // eslint-disable-next-line no-undef
        clients.openWindow("https://google.com");
        break;
      case "no-action":
        console.log("Pengguna memilih action no");
        break;
      default:
        console.log(`Action yang dipilih tidak dikenal: '${event.action}'`);
        break;
    }
    // event.notification.close();
  });
});

self.addEventListener("push", function(event) {
  var body;
  if (event.data) {
    body = event.data.text();
  } else {
    body = "Push message no payload";
  }
  var options = {
    body: body,
    icon: "images/icon-128.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  event.waitUntil(
    self.registration.showNotification("Push Notification", options)
  );
});
