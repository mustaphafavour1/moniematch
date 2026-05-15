// sw.js — MonieMatch service worker
// v4 — clears old broken cache, stops caching JSX files
// JSX files change constantly during dev — always fetch fresh from network

const CACHE = 'moniematch-v4';  // bump version whenever you need a force refresh

// Only cache the HTML shells and static CSS — NOT JSX files
const SHELL = [
  '/app/shared/styles.css',
];

// ── Install ────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete ALL old caches ───────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log('[SW] deleting old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ──────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Supabase API — always network, never cache
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request).catch(() => new Response(
        JSON.stringify({ data: null, error: { message: 'offline' } }),
        { headers: { 'Content-Type': 'application/json' } }
      ))
    );
    return;
  }

  // JSX files — ALWAYS fetch fresh, never serve from cache
  // (they change frequently during development)
  if (url.pathname.endsWith('.jsx')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response('// offline', { headers: { 'Content-Type': 'application/javascript' } })
      )
    );
    return;
  }

  // Google Fonts — cache first (they never change)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // CDN scripts (React, Babel, Supabase JS) — cache first, they're versioned
  if (url.hostname.includes('unpkg.com') || url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Everything else — network first, cache as fallback
  event.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});