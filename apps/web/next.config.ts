import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tka/ui'],
  agentRules: false,
};

export default nextConfig;
