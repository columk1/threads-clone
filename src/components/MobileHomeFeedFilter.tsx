'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const MobileHomeFeedFilter = () => {
  const pathname = usePathname()

  return (
    <>
      <div className="flex h-12 font-semibold text-secondary-text md:hidden">
        <Link
          href="/"
          className={`flex w-1/2 items-center justify-center border-b ${pathname === '/' ? 'border-primary-text text-primary-text' : 'border-primary-outline'}`}
        >
          For you
        </Link>
        <Link
          href="/following"
          className={`flex w-1/2 items-center justify-center border-b ${pathname === '/following' ? 'border-primary-text' : 'border-primary-outline'}`}
        >
          Following
        </Link>
      </div>
      <div className="h-[0.5px] w-full bg-primary-outline md:hidden"></div>
    </>
  )
}
