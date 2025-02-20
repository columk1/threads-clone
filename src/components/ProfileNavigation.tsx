'use client'

import Link from 'next/link'
import { notFound, usePathname } from 'next/navigation'

export default function ProfileNavigation() {
  const pathname = usePathname()
  const profile = pathname.split('/').find((segment) => segment.startsWith('@')) // @username
  if (!profile) {
    return notFound()
  }
  // const username = profile?.slice(1)
  const subpath = pathname.split('/').pop()
  return (
    <>
      <nav className="flex h-12 font-semibold text-secondary-text">
        <Link
          href={`/${profile}`}
          className={`flex w-1/2 items-center justify-center border-b ${subpath === profile ? 'border-primary-text text-primary-text' : 'border-primary-outline'}`}
        >
          Threads
        </Link>
        <Link
          href={`/${profile}/replies`}
          className={`flex w-1/2 items-center justify-center border-b ${subpath === 'replies' ? 'border-primary-text' : 'border-primary-outline'}`}
        >
          Replies
        </Link>
        <Link
          href={`/${profile}/reposts`}
          className={`flex w-1/2 items-center justify-center border-b ${subpath === 'reposts' ? 'border-primary-text' : 'border-primary-outline'}`}
        >
          Reposts
        </Link>
      </nav>
      <div className="h-[0.5px] w-full bg-primary-outline md:hidden"></div>
    </>
  )
}
