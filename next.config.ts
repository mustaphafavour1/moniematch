import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async rewrites() {
    return [
      // ── Previously in vercel.json ──────────────────────────
      // Clean URL aliases → static HTML files in public/
      { source: '/join/investor', destination: '/join-investor.html' },
      { source: '/join/business', destination: '/join-business.html' },
      { source: '/signin',        destination: '/signin.html' },

      // SPA fallback for the React /app (catches client-side routes)
      { source: '/app/investor',      destination: '/app/index.html' },
      { source: '/app/investor/:path*', destination: '/app/index.html' },
      { source: '/app/business',      destination: '/app/index.html' },
      { source: '/app/business/:path*', destination: '/app/index.html' },

      // ── New: /app root itself ───────────────────────────────
      { source: '/app',           destination: '/app/index.html' },
    ]
  },
}

export default nextConfig