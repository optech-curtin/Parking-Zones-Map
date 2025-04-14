/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/campus-parking-planning',
  assetPrefix: '/campus-parking-planning/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig 