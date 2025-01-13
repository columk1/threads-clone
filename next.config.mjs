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
    dynamicIO: true,
    // serverExternalPackages: ['@libsql/client'],
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
export default withBundleAnalyzer(nextConfig)
