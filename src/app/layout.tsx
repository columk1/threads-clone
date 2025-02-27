import '@/styles/global.css'

import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

import { ModalProvider } from '@/contexts/ModalContext'

export const metadata: Metadata = {
  title: {
    default: 'Threads',
    template: '%s • Threads',
  },
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

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    // Supress hydration warning for theme script
    <html lang="en-US" suppressHydrationWarning>
      <body className="overflow-y-scroll bg-primary-bg font-system text-primary-text antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ModalProvider>
            <div className="flex min-h-screen flex-1 flex-col items-center justify-center">
              {/* <div className="flex min-h-screen flex-col justify-between"> */}
              {props.children}
              <Toaster
                position="bottom-center"
                className="flex w-fit justify-center text-ms font-semibold"
                toastOptions={{
                  unstyled: true,
                  classNames: {
                    toast: 'bg-primary-text rounded-lg text-black w-fit py-3.5 px-5',
                    icon: 'hidden',
                  },
                  duration: 2500,
                }}
              />
            </div>
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
