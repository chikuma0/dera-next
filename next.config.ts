import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });
    // Ensure JSON files are processed
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
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
}

export default nextConfig;
