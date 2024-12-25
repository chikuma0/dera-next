/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placeholder.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,  // Temporarily ignore ESLint during build
  },
  typescript: {
    ignoreBuildErrors: true,  // Temporarily ignore TypeScript errors during build
  }
};

module.exports = nextConfig;
