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
}

export default nextConfig