import { CookiesProvider } from 'next-client-cookies/server'
import { Suspense } from 'react'

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <CookiesProvider>{children}</CookiesProvider>
    </Suspense>
  )
}
