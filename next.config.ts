import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dge.dgetechs.com',
      },
      {
        protocol: 'https',
        hostname: 'dgetechs.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dge-tech-web-cjhe4jg72a-ew.a.run.app';
    const proxyUrl = apiUrl.replace('0.0.0.0', '127.0.0.1');
    console.log('NextConfig: Proxying /api to:', proxyUrl);
    return [
      {
        // Exclude: auth routes AND all /api/admin/* which have custom Next.js handlers
        source: '/api/:path((?!auth|admin).*)',
        destination: `${proxyUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
