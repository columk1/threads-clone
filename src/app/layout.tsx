import '@/styles/global.css'

import type { Metadata } from 'next'
import { CookiesProvider } from 'next-client-cookies/server'
import { Toaster } from 'sonner'

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
      <body className="bg-primary-bg font-system text-primary-text">
        <div className="flex min-h-screen flex-col justify-between">
          <CookiesProvider>
            {props.children}
            <Toaster />
          </CookiesProvider>
          <footer className="flex h-[70px] w-full items-center justify-center text-xs text-gray-text">
            © 2024
          </footer>
        </div>
      </body>
    </html>
  )
}
