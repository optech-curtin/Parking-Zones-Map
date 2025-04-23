import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Parking-Zones-Map',
  assetPrefix: '/Parking-Zones-Map/',
  
  images: {
    unoptimized: true,
  },
};

export default nextConfig;