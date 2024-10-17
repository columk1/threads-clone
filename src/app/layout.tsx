import '@/styles/global.css'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/favicon-192x192.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '192x192',
      url: '/favicon-192x192.png',
    },
    {
      rel: 'icon',
      url: '/favicon-192x192.png',
    },
  ],
}

// export function generateStaticParams() {
//   return '/'
// }

export default function RootLayout(props: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-US">
      <body className="min-h-screen bg-primary-bg font-system text-primary-text">
        {props.children}
        <footer className="flex h-[70px] items-center justify-center text-xs text-gray-text">
          © 2024
        </footer>
      </body>
    </html>
  )
}
