import { useContext } from 'react'

import { ModalContext } from '@/context/ModalContext'

export type GatedAction = 'post' | 'activity' | 'profile' | 'follow' | 'like' | 'repost' | 'reply' | 'save'

export function getAuthModalContent(action: GatedAction | null): { title: string, caption: string } {
  switch (action) {
    case 'post':
      return { title: 'Sign up to post', caption: 'Join Threads to share ideas, ask questions, post random thoughts and more.' }
    case 'activity':
      return { title: 'Say more with Threads', caption: 'Join Threads to share thoughts, find out what\'s going on, follow your people and more.' }
    case 'profile':
      return { title: 'Say more with Threads', caption: 'Join Threads to share thoughts, find out what\'s going on, follow your people and more.' }
    case 'like':
      return { title: 'Sign up to like', caption: 'Join Threads to like and interact with posts.' }
    case 'reply':
      return { title: 'Sign up to reply', caption: 'Join Threads to join the conversation.' }
    case 'repost':
      return { title: 'Sign up to repost', caption: 'Join Threads to share this on your profile.' }
    case 'follow':
      return { title: 'Sign up to follow', caption: 'Join Threads to keep up with this user\'s posts.' }
    default:
      return { title: 'Log in to continue', caption: 'Join Threads to share thoughts, find out what\'s going on, follow your people and more.' }
  }
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
