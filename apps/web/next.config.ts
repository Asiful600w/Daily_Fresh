import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vaohkfonpifdvwarsnac.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Keep existing if needed or add for safety
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
