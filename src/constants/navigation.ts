import type { FunctionComponent } from 'react'
import type React from 'react'

import {
  CreateIcon,
  EditIcon,
  HomeIcon,
  NotificationsFooterIcon,
  NotificationsIcon,
  ProfileIcon,
  SearchIcon,
} from '@/components/icons'

type IconProps = {
  className?: string
  isActive?: boolean
}

export type NavigationLink = {
  icon: FunctionComponent<IconProps & React.SVGProps<SVGSVGElement>>
  route: string
  label: string
  classNames?: string
}

export const sidebarLinks: NavigationLink[] = [
  {
    icon: HomeIcon,
    route: '/',
    label: 'Home',
  },
  {
    icon: SearchIcon,
    route: '/search',
    label: 'Search',
  },
  {
    icon: CreateIcon,
    route: '/create-thread',
    label: 'Create Thread',
    classNames: 'bg-active-bg text-gray-7 hover:text-primary-text',
  },
  {
    icon: NotificationsIcon,
    route: '/activity',
    label: 'Notifications',
  },
  {
    icon: ProfileIcon,
    route: '/profile',
    label: 'Profile',
  },
]

export const footerLinks = sidebarLinks.map((link) => {
  if (link.icon === CreateIcon) {
    return { ...link, icon: EditIcon }
  }
  if (link.icon === NotificationsIcon) {
    return { ...link, icon: NotificationsFooterIcon }
  }
  return link
})
