import { fileURLToPath } from 'node:url'

import bundleAnalyzer from '@next/bundle-analyzer'
import createJiti from 'jiti'

const jiti = createJiti(fileURLToPath(import.meta.url))

jiti('./src/lib/Env') // Validate .env during build

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  eslint: {
    dirs: ['.'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['pino', 'pino-pretty'],
  experimental: {
    staleTimes: {
      dynamic: 300,
      static: 300,
    },
    nodeMiddleware: true,
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
export default process.env.ANALYZE === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig
