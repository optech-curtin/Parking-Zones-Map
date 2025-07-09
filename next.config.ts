import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/Parking-Zones-Map',
  assetPrefix: '/Parking-Zones-Map/',
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@arcgis/core'],
  },

  // Turbopack configuration (stable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Webpack configuration for optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            arcgis: {
              test: /[\\/]node_modules[\\/]@arcgis[\\/]/,
              name: 'arcgis',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }

    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimize webpack cache performance
    config.cache = {
      ...config.cache,
      type: 'filesystem',
      compression: 'gzip',
      maxAge: 172800000, // 2 days
    };

    return config;
  },

  // Image optimization
  images: {
    domains: ['arcgis.curtin.edu.au'],
    formats: ['image/webp', 'image/avif'],
  },

  // Compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade', // More permissive for cross-origin requests
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Output configuration
  output: 'standalone',

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;