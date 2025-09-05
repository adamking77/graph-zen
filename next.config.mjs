/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Enable ESLint during builds for better code quality
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript checking during builds
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Enable static export optimization
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        // Apply headers to all routes
        source: '/(.*)',
        headers: [
          {
            // Allow iframe embedding from any origin for embeds
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Content Security Policy for iframe embedding
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.notion.so https://notion.so https://*.notion.site",
          },
        ],
      },
      {
        // Special headers for embed routes
        source: '/\\?(.*)embed=true(.*)',
        headers: [
          {
            // Allow embedding for embed URLs specifically
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            // More permissive CSP for embed mode
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
          {
            // CORS headers for iframe requests
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            // Allow iframe embedding
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Accept, Origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig