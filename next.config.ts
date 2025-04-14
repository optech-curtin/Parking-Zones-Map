import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/campus-parking-planning' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/campus-parking-planning/' : '',
}

export default nextConfig
