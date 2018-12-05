/* eslint-disable */
const VERSION = "VERSION-HERE";
const CACHE_FILES = [
  "/offline.html",
  "/css/bootstrap.min.css",
  "/css/bootstrap4.min.css",
  "/css/custom.css",
  "/css/font-awesome.min.css",
  "/css/loggedinstyle.css",
  "/css/loginstyle.css",
  "/css/magnific-popup.css",
  "/css/style-responsive.css",
  "/css/style.css",
  "/fonts/fontawesome-webfont.eot",
  "/fonts/fontawesome-webfont.svg",
  "/fonts/fontawesome-webfont.ttf",
  "/fonts/fontawesome-webfont.woff",
  "/fonts/fontawesome-webfont.woff2",
  "/fonts/FontAwesome.otf",
  "/fonts/glyphicons-halflings-regular.eot",
  "/fonts/glyphicons-halflings-regular.svg",
  "/fonts/glyphicons-halflings-regular.ttf",
  "/fonts/glyphicons-halflings-regular.woff",
  "/img/background1.jpg",
  "/img/m main.png",
  "/img/m-alt.png",
  "/img/m-black.png",
  "/img/mazelike logo black.png",
  "/img/mazelike logo white.png",
  "/img/mazelike logo.png",
  "/img/profilepic.jpg",
  "/js/bootstrap.min.js",
  "/js/bootstrap4.min.js",
  "/js/pep.js",
  "/js/common-scripts.js",
  "/js/jquery.dcjqaccordion.2.7.js",
  "/js/jquery.js",
  "/js/jquery.magnific-popup.js",
  "/js/main.js",
  "/js/pixi.min.js",
  "/js/socket.io.js",
  "/scripts/common.js",
  "/scripts/lobby.js",
  "/game/game.js",
  "/game/index.html",
  "/game/DawnLike/Objects/Floor.json",
  "/game/DawnLike/Characters/dog.json",
  "/game/DawnLike/Characters/demon.json",
  "/game/DawnLike/Characters/player.json",
  "/game/DawnLike/Items/boot.json",
  "/game/DawnLike/Items/hat.json",
  "/game/DawnLike/Items/shield.json",
  "/game/DawnLike/Items/shortWep.json",
  "/game/DawnLike/Objects/Floor.png",
  "/game/DawnLike/Characters/Dog0.png",
  "/game/DawnLike/Characters/Demon0.png",
  "/game/DawnLike/Characters/Player0.png",
  "/game/DawnLike/Items/Boot.png",
  "/game/DawnLike/Items/Hat.png",
  "/game/DawnLike/Items/Shield.png",
  "/game/DawnLike/Items/ShortWep.png"
];

// Download the app
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(`mazelike-${VERSION}`).then((cache) => {
      return cache.addAll(CACHE_FILES);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Remove old versions
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => {
        if(name === `mazelike-${VERSION}`) {
          return Promise.resolve();
        }
        return caches.delete(name);
      })).then(() => {
        if(self.clients && self.clients.claim) {
          return self.clients.claim();
        }
      });
    })
  );
});

self.addEventListener("fetch", (e) => {
  let request = e.request;
  let url = new URL(e.request.url);

  if(url.pathname.match(/\/game\/[A-Za-z0-9]{12}$/)) {
    request = new Request("/game/index.html");
  }

  e.respondWith(
    // Use the cached version if we have one
    caches.match(request).then((res) => {
      if(res) {
        return res;
      }

      // Then go to the server
      return fetch(request).catch(() => {
        // Finally fall back to the offline page
        return caches.match(new Request("/offline.html"));
      });
    })
  );
});