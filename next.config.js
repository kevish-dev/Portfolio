/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Resume PDFs are uploaded through a server action (Vercel caps request bodies at 4.5 MB).
    serverActions: { bodySizeLimit: '4.5mb' },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
}

module.exports = nextConfig
