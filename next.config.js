/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',


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
