const CACHE_NAME = 'ttrpg-tools-v9';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/firebase-config.js',
  './js/auth.js',
  './js/sync.js',
  './js/eventbus.js',
  './js/audio.js',
  './js/dice.js',
  './js/oracle.js',
  './js/tables.js',
  './js/initiative.js',
  './js/encounter.js',
  './js/npc.js',
  './js/reference.js',
  './js/journal.js',
  './js/loot.js',
  './js/spells.js',
  './js/dungeon.js',
  './js/cof.js',
  './js/bestiary.js',
  './data/oracle-tables.json',
  './data/random-tables.json',
  './data/monsters-srd.json',
  './data/npc-tables.json',
  './data/reference.json',
  './data/cof-tables.json',
  './data/loot-tables.json',
  './data/dungeon-tables.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
