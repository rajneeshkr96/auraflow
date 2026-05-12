import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Include production domain — missing this blocks all server actions in prod
      allowedOrigins: [
        'aura.codeswayam.com',
        'superconfident-earwiggy-dorian.ngrok-free.dev',
        'localhost:3000',
        'localhost:3004',
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
    ],
  },
};

export default nextConfig;
