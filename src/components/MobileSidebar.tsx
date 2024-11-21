'use client'

import type { User } from 'lucia'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type FunctionComponent, useContext } from 'react'

import { footerLinks } from '@/constants/navigation'
import { ModalContext } from '@/context/ModalContext'

type MobileSidebarProps = {
  user: User | null
}

const MobileSidebar: FunctionComponent<MobileSidebarProps> = () => {
  const pathname = usePathname()
  const { setIsOpen } = useContext(ModalContext)

  return (
    <aside className="fixed bottom-0 z-10 flex h-[68px] w-full items-center justify-evenly bg-secondary-bg md:hidden">
      {footerLinks.map((link) => {
        const isActive = pathname === link.route
          || (pathname.includes(link.route) && link.route.length > 1)

        // if (link.route === '/profile') {
        //   link.route = `${link.route}/${userId}`
        // }
        if (link.route === '/create-thread') {
          return (
            <button
              type="button"
              key={link.label}
              className={`group relative flex w-full items-center justify-center ${isActive && 'text-primary-text'}`}
              onClick={() => setIsOpen(true)}
            >
              <div className="z-10 transition duration-200 group-active:scale-90">
                {link.icon && <link.icon isActive={isActive} className="size-[26px]" />}
              </div>
              <div className="absolute z-0 flex h-[60px] w-full scale-80 items-center justify-center rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-active-bg group-active:scale-90">
              </div>
            </button>
          )
        }

        return (
          <Link
            href={link.route}
            key={link.label}
            className={`group relative flex w-full items-center justify-center ${isActive && 'text-primary-text'}`}
          >
            <div className="z-10 transition duration-200 group-active:scale-90">
              {link.icon && <link.icon isActive={isActive} className="size-[26px]" />}
            </div>
            <div className="absolute z-0 flex h-[60px] w-full scale-80 items-center justify-center rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-active-bg group-active:scale-90">
            </div>
          </Link>
        )
      })}
    </aside>
  )
}

export default MobileSidebar
