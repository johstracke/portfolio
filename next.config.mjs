/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
        pathname: '/assets/**',
      },
      {
        protocol: 'http',
        hostname: 'directus',
        port: '8055',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/assets/**',
      },
    ],
  },
};

export default nextConfig;

