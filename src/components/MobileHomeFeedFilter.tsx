'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const MobileHomeFeedFilter = () => {
  // const user = await currentUser()
  const pathname = usePathname()

  return (
    <>
      <div className="flex h-12 font-semibold text-gray-7 md:hidden">
        <Link href="/" className={`flex w-1/2 items-center justify-center border-b ${pathname === '/' ? 'border-primary-text text-primary-text' : 'border-gray-4'}`}>For you</Link>
        <Link href="/following" className={`flex w-1/2 items-center justify-center border-b ${pathname === '/following' ? 'border-primary-text' : 'border-gray-4'}`}>Following</Link>
      </div>
      <div className="h-[0.5px] w-full bg-gray-4 md:hidden"></div>
      {/* {`Hello ${user?.emailAddresses[0]?.emailAddress}`} */}
    </>
  )
}
