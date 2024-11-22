'use client'

import { redirect } from 'next/navigation'
import { type FunctionComponent, useState } from 'react'
import { toast } from 'sonner'

import { type PostUser, toggleFollow } from '@/app/actions'
import { useModal } from '@/hooks/useModal'
import type { Post } from '@/models/Schema'

import Avatar from './Avatar'
import { Like, Reply, Repost, Share } from './icons'
import PostAuthor from './PostAuthor'
import PostDropDownMenu from './PostDropDownMenu'
import TimeAgo from './TimeAgo'

type ThreadProps = {
  post: Post
  user: PostUser
  isCurrentUser: boolean
  isAuthenticated?: boolean
}

type PublicThreadProps = {
  post: Post
  user: PostUser
}

const iconStyle = 'flex h-full items-center gap-1 rounded-full px-3 hover:bg-gray-3 active:scale-85 transition'

type ThreadContentProps = {
  post: Post
  user: PostUser
  onToggleFollow: () => Promise<void>
  isCurrentUser: boolean
  isAuthenticated?: boolean
}

const ThreadContent: FunctionComponent<ThreadContentProps> = ({
  post,
  user,
  onToggleFollow,
  isCurrentUser,
  isAuthenticated = false,
}) => {
  const { openModal } = useModal()

  const handleInteraction = (action: 'like' | 'reply' | 'repost') => {
    if (!isAuthenticated) {
      openModal('auth-prompt', action)
      // return
    }
    // Handle the actual action here
    // TODO: Implement like, reply, repost functionality
  }

  return (
    <div className="flex flex-col gap-2 border-b-[0.5px] border-gray-5 px-6 py-3 text-[15px]">
      <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-y-[3px]">
        <div className="col-start-1 row-start-1 row-end-[span_2] pt-1">
          <Avatar />
        </div>
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="font-semibold">
              <PostAuthor
                user={user}
                isAuthenticated={isAuthenticated}
                isCurrentUser={isCurrentUser}
                onToggleFollow={onToggleFollow}
              />
            </div>
            <a href={`/@${user.username}/post/${post.id}`}>
              <TimeAgo publishedAt={post.createdAt} />
            </a>
          </div>
          <PostDropDownMenu
            isFollowed={user.isFollowed}
            onToggleFollow={onToggleFollow}
            isAuthenticated={isAuthenticated}
          />
        </div>
        <div className="col-start-2 mb-[2px]">{post.text}</div>
        <div className="col-start-2 -ml-3 flex h-9 items-center text-[13px] text-secondary-text">
          <button type="button" className={iconStyle} onClick={() => handleInteraction('like')}>
            <Like />
            <span>42</span>
          </button>
          <button type="button" className={iconStyle} onClick={() => handleInteraction('reply')}>
            <Reply />
            <span>42</span>
          </button>
          <button type="button" className={iconStyle} onClick={() => handleInteraction('repost')}>
            <Repost />
            <span>42</span>
          </button>
          <button type="button" className={iconStyle}>
            <Share />
            <span>42</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const AuthThread: FunctionComponent<ThreadProps> = ({ post, user: initialUser, isCurrentUser }) => {
  const [user, setUser] = useState(initialUser)

  const handleToggleFollow = async () => {
    setUser(prev => ({
      ...prev,
      isFollowed: !prev.isFollowed,
      followerCount: prev.isFollowed ? prev.followerCount - 1 : prev.followerCount + 1,
    }))
    const result = await toggleFollow(user.username, user.isFollowed ? 'unfollow' : 'follow')
    if (result.error) {
      toast.error(result.error)
      setUser(user)
      return
    }
    toast(result.success)
  }

  return (
    <ThreadContent
      post={post}
      user={user}
      onToggleFollow={handleToggleFollow}
      isCurrentUser={isCurrentUser}
      isAuthenticated
    />
  )
}

const PublicThread: FunctionComponent<PublicThreadProps> = ({ post, user }) => {
  const openModal = () => Promise.resolve().then(() => redirect('/login'))
  const handleLoginPrompt = () => openModal()

  return (
    <ThreadContent
      post={post}
      user={user}
      onToggleFollow={handleLoginPrompt}
      isCurrentUser={false}
    />
  )
}

const Thread: FunctionComponent<ThreadProps> = ({ post, user, isCurrentUser, isAuthenticated }) => {
  if (isAuthenticated) {
    return <AuthThread post={post} user={user} isCurrentUser={isCurrentUser} />
  }
  return <PublicThread post={post} user={user} />
}

export default Thread
