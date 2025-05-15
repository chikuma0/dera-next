/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'ja'],
    defaultLocale: 'en',
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      net: false,
      tls: false,
      url: false,
    };
    return config;
  },
};

module.exports = nextConfig;
