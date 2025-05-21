/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'ja'],
    defaultLocale: 'en',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'node:' modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        net: false,
        tls: false,
        url: false,
        fs: false,
        stream: false,
        timers: false,
        'timers/promises': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
