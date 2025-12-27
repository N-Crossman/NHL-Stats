import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.nhle.com',
      },
      {
        protocol: 'https',
        hostname: 'api-web.nhle.com',
      },
    ],
  },
};

export default nextConfig;
