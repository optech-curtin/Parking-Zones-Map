/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/campus-parking-planning' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/campus-parking-planning/' : '',
}

module.exports = nextConfig 