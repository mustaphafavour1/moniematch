// sw.js — MonieMatch service worker
// Strategy:
//   Static assets  → cache-first  (fast on repeat visits)
//   Supabase API   → network-first (always try live data, fall back gracefully)
//   Navigation     → network-first, fall back to cached shell

const CACHE = 'moniematch-v1';

const SHELL = [
  '/app/',
  '/app/index.html',
  '/app/styles.css',
  '/app/supabase.js',
  '/app/skeleton.jsx',
  '/app/ios-frame.jsx',
  '/app/tweaks-panel.jsx',
  '/app/ui.jsx',
  '/app/mock-data.jsx',
  '/app/investor.jsx',
  '/app/investor-2.jsx',
  '/app/investor-3.jsx',
  '/app/business.jsx',
  '/app/business-2.jsx',
  '/app/app.jsx',
];

// ── Install: pre-cache the app shell ──────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove stale caches ─────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: smart routing ───────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (except fonts + CDN)
  if (request.method !== 'GET') return;

  // Supabase API — network first, silent fail
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .catch(() => new Response(
          JSON.stringify({ data: null, error: { message: 'offline' } }),
          { headers: { 'Content-Type': 'application/json' } }
        ))
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

  // CDN scripts (React, Babel, Supabase) — cache first
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

  // App shell files — cache first, network fallback
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return res;
      }).catch(() => cached || caches.match('/app/index.html'));

      // Return cache immediately if available, update in background
      return cached || network;
    })
  );
});