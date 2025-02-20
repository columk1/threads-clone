import type { Metadata } from 'next'
import Link from 'next/link'

import AuthPromptModal from '@/components/AuthPromptModal'
import MobileHeader from '@/components/MobileHeader'
import MobileSidebar from '@/components/MobileSidebar'
import FloatingActionButton from '@/components/NewPostFAB'
import NewThreadModal from '@/components/NewThreadModal'
import Sidebar from '@/components/Sidebar'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { validateRequest } from '@/lib/Lucia'

export const metadata: Metadata = {
  title: {
    default: 'Threads',
    template: '%s • Threads',
  },
}

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const { user } = await validateRequest()
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-primary-bg md:bg-secondary-bg md:px-5">
      <MobileHeader />
      <NotificationsProvider isAuthenticated={!!user}>
        <Sidebar user={user} />
        <MobileSidebar user={user} />
      </NotificationsProvider>
      {user ? (
        <>
          <NewThreadModal username={user.username} avatar={user.avatar} />
          <FloatingActionButton />
        </>
      ) : (
        <>
          <AuthPromptModal />
          <Link
            href="/login"
            className="fixed right-5 top-5 z-30 flex h-[34px] items-center justify-center rounded-lg border border-primary-outline bg-white px-4 text-[15px] font-semibold text-black transition active:scale-95 disabled:opacity-30"
          >
            Log in
          </Link>
        </>
      )}
      <main className="flex w-full flex-1 flex-col text-primary-text max-md:mt-header-height md:w-full md:max-w-[min(calc(100%-(1.5*var(--sidebar-width))),640px)]">
        {children}
      </main>
    </div>
  )
}

// export const dynamic = 'force-dynamic'
