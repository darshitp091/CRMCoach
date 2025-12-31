/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['three', 'gsap', '@gsap/react'],
  webpack: (config) => {
    config.externals.push({
      canvas: 'canvas',
    });
    return config;
  },
  images: {
    domains: [
      'localhost',
      // Add your Supabase storage domain
      // e.g., 'your-project.supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Coaching CRM',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Complete CRM for Coaching & Consulting Businesses',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
