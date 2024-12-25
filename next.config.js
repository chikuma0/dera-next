/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['placeholder.com'],
  },
  // Ensure TypeScript and other features are preserved
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
