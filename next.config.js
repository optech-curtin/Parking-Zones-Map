/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/ArcGIS_WebApp_Integration',
  assetPrefix: '/ArcGIS_WebApp_Integration/',

  images: {
    unoptimized: true,
  },
  experimental: {
  },
  staticPageGenerationTimeout: 300,
  compiler: {
    removeConsole: false,
  },
}

module.exports = nextConfig 
