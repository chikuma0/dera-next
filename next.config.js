/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['placeholder.com'],
  },
};

module.exports = nextConfig;
