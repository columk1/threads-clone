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
    // DynamicIO doesn't work with Sentry https://github.com/getsentry/sentry-javascript/issues/14118
    // DynamicIO doesn't work with next-test-api-route-handler
    // dynamicIO: true,
    // cacheLife: {
    //   post: {
    //     stale: 30, // 30 seconds
    //     revalidate: 15, // 15 seconds
    //     expire: 60, // 1 minute
    //   },
    // },
    staleTimes: {
      dynamic: 300,
      static: 300,
    },
    // serverExternalPackages: ['@libsql/client'],
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
export default withBundleAnalyzer(nextConfig)
