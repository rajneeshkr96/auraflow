import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['superconfident-earwiggy-dorian.ngrok-free.dev', 'localhost:3000'],
    }
  }
};

export default nextConfig;
