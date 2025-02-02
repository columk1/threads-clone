import { useContext } from 'react'

import { EditColorIcon, FollowColorIcon, LikeColorIcon, ReplyColorIcon, RepostColorIcon } from '@/components/icons'
import { ModalContext } from '@/contexts/ModalContext'

export type ProtectedAction = 'post' | 'activity' | 'profile' | 'follow' | 'like' | 'repost' | 'reply' | 'save'

export function getAuthModalContent(action: ProtectedAction | null): {
  title: string
  caption: string
  icon: React.FC<React.SVGProps<SVGSVGElement>> | null
} {
  switch (action) {
    case 'post':
      return {
        title: 'Sign up to post',
        caption: 'Join Threads to share ideas, ask questions, post random thoughts and more.',
        icon: EditColorIcon,
      }
    case 'activity':
      return {
        title: 'Say more with Threads',
        caption: "Join Threads to share thoughts, find out what's going on, follow your people and more.",
        icon: null,
      }
    case 'profile':
      return {
        title: 'Say more with Threads',
        caption: "Join Threads to share thoughts, find out what's going on, follow your people and more.",
        icon: null,
      }
    case 'like':
      return {
        title: 'Sign up to like',
        caption: 'Join Threads to like and interact with posts.',
        icon: LikeColorIcon,
      }
    case 'reply':
      return {
        title: 'Sign up to reply',
        caption: 'Join Threads to join the conversation.',
        icon: ReplyColorIcon,
      }
    case 'repost':
      return {
        title: 'Sign up to repost',
        caption: 'Join Threads to share this on your profile.',
        icon: RepostColorIcon,
      }
    case 'follow':
      return {
        title: 'Sign up to follow',
        caption: "Join Threads to keep up with this user's posts.",
        icon: FollowColorIcon,
      }
    default:
      return {
        title: 'Log in to continue',
        caption: "Join Threads to share thoughts, find out what's going on, follow your people and more.",
        icon: EditColorIcon,
      }
  }
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
