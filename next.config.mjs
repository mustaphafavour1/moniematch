/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async rewrites() {
    return [
      // Landing page static routes
      { source: '/join/investor',         destination: '/join-investor.html' },
      { source: '/join/business',         destination: '/join-business.html' },
      // NOTE: /signin is now a Next.js page — no rewrite needed

      // Legacy React app (still in public/) — fallback while migration completes
      { source: '/app',                   destination: '/app/index.html' },
      { source: '/app/investor',          destination: '/app/index.html' },
      { source: '/app/investor/:path*',   destination: '/app/index.html' },
      { source: '/app/business',          destination: '/app/index.html' },
      { source: '/app/business/:path*',   destination: '/app/index.html' },
    ]
  },
}

export default nextConfig
