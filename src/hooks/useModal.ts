import { useContext } from 'react'

import { ModalContext } from '@/context/ModalContext'

// export type LoginAction = 'follow' | 'like' | 'repost' | 'reply' | 'save'

// export function getLoginMessage(action: LoginAction): string {
//   switch (action) {
//     case 'follow':
//       return 'Log in to follow users'
//     case 'like':
//       return 'Log in to like posts'
//     case 'repost':
//       return 'Log in to repost'
//     case 'reply':
//       return 'Log in to reply to posts'
//     case 'save':
//       return 'Log in to save posts'
//     default:
//       return 'Log in to continue'
//   }
// }

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
