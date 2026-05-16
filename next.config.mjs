/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async rewrites() {
    return [
      // Sign-in → existing signin.html (phone-frame styled)
      { source: '/signin',                destination: '/signin.html' },
      // Join flows → new Next.js onboarding pages
      { source: '/join/investor',         destination: '/investor/onboarding' },
      { source: '/join/business',         destination: '/business/onboarding' },

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
