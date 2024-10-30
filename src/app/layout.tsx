import '@/styles/global.css'

import type { Metadata } from 'next'
import { CookiesProvider } from 'next-client-cookies/server'
import { ThemeProvider } from 'next-themes'
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CookiesProvider>
            <div className="flex min-h-screen flex-col justify-between">
              {props.children}
              <Toaster />
              <footer className="flex h-[70px] w-full items-center justify-center text-xs text-gray-1">
                © 2024
              </footer>
            </div>
          </CookiesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
