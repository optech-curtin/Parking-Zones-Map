/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Parking-Zones-Map',
  assetPrefix: '/Parking-Zones-Map/',

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
