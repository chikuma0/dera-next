import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });
    // Ensure JSON files are processed but not cached
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
      parser: {
        parse: JSON.parse,
      },
    });
    return config;
  },
  // Enable static JSON imports
  experimental: {
    typedRoutes: true,
  },
  // Transpile modules
  transpilePackages: [],
  // Enable strict mode
  reactStrictMode: true,
  // Enable server components
  serverComponents: true,
  // Disable static optimization for i18n files
  async headers() {
    return [
      {
        source: '/i18n/locales/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
}
