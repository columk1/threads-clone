'use client'

import { type FunctionComponent, useState } from 'react'
import { toast } from 'sonner'

import { type PostUser, toggleFollow } from '@/app/actions'
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
}

const iconStyle = 'flex h-full items-center gap-1 rounded-full px-3 hover:bg-gray-3 active:scale-85 transition'

const Thread: FunctionComponent<ThreadProps> = ({ post, user: initialUser, isCurrentUser }) => {
  const [user, setUser] = useState(initialUser)

  const handleToggleFollow = async () => {
    // Optimistically update the UI
    setUser(prev => ({ ...prev, isFollowed: !prev.isFollowed, followerCount: prev.isFollowed ? prev.followerCount - 1 : prev.followerCount + 1 }))
    const result = await toggleFollow(user.username, user.isFollowed ? 'unfollow' : 'follow')
    if (result.error) {
      toast.error(result.error)
      setUser(user)
      return
    }
    toast(result.success)
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
                isCurrentUser={isCurrentUser}
                onToggleFollow={handleToggleFollow}
              />
            </div>
            <a href={`/@${user.username}/post/${post.id}`}>
              <TimeAgo publishedAt={post.createdAt} />
            </a>
          </div>
          <PostDropDownMenu
            isFollowed={user.isFollowed}
            onToggleFollow={handleToggleFollow}
          />
        </div>
        <div className="col-start-2 mb-[2px]">
          {post.text}
        </div>
        <div className="col-start-2 -ml-3 flex h-9 items-center text-[13px] text-secondary-text">
          <button type="button" className={iconStyle}>
            <Like />
            <span>42</span>
          </button>
          <button type="button" className={iconStyle}>
            <Reply />
            <span>42</span>
          </button>
          <button type="button" className={iconStyle}>
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

export default Thread
