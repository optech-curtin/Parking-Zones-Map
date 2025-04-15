/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/ArcGIS_WebApp_Integration',
  assetPrefix: '/ArcGIS_WebApp_Integration/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Only enable static export in production
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {})
}

module.exports = nextConfig 