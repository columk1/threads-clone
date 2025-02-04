'use client'

import type { User } from 'lucia'
import Link from 'next/link'

import { useFollow } from '@/hooks/useFollow'
import type { getNotifications as getNotificationsDb } from '@/repositories/users.repository'

import Avatar from './Avatar'
import FollowButton from './FollowButton'
import PostAuthor from './PostAuthor'
import { ThreadMedia } from './Thread'
import ThreadActions from './ThreadActions'
import TimeAgo from './TimeAgo'
import UnfollowModal from './UnfollowModal'

type NotificationItem = Awaited<ReturnType<typeof getNotificationsDb>>[number]

const Notification = ({ data, currentUser }: { data: NotificationItem; currentUser: User }) => {
  const { notification, sourceUser, post, reply } = data
  const { user, handleToggleFollow, unfollowModalProps } = useFollow({
    initialUser: sourceUser,
    isAuthenticated: true,
  })
  const source = notification.type === 'FOLLOW' ? 'Followed you' : post?.text
  return (
    <>
      <div className="px-6 py-3">
        <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] text-[15px]">
          <div className="col-start-1 row-span-2 pt-[4px]">
            <Link href={`/@${user.username}`} className="group !ring-0 !ring-offset-0">
              <Avatar
                url={user.avatar}
                className="group-focus-visible:outline-2 group-focus-visible:outline-white group-focus-visible:ring-2 group-focus-visible:ring-blue-500 group-focus-visible:ring-offset-2"
              />
            </Link>
          </div>
          <div className="flex w-full items-center gap-1.5">
            <PostAuthor user={user} onToggleFollow={handleToggleFollow} />
            {post ? (
              <a href={`/@${user.username}/post/${post.id}`}>
                <TimeAgo publishedAt={post.createdAt} />
              </a>
            ) : (
              <a href={`/@${user.username}`}>
                <TimeAgo publishedAt={notification.createdAt} />
              </a>
            )}
          </div>
          <div className="col-start-2 row-start-2 leading-5 text-gray-7">{source}</div>
          {notification.type === 'FOLLOW' && (
            <div className="col-start-3 row-span-2 flex items-center">
              <FollowButton isFollowed={user.isFollowed} onToggleFollow={handleToggleFollow} isNotification />
            </div>
          )}
          {reply && (
            <div className="col-start-2 -mb-1 pt-1">
              {reply.text && <div>{reply.text}</div>}
              <ThreadMedia image={reply.image} imageWidth={reply.imageWidth} imageHeight={reply.imageHeight} />
              <ThreadActions post={reply} currentUser={currentUser} author={sourceUser} isAuthenticated />
            </div>
          )}
        </div>
        <UnfollowModal {...unfollowModalProps} />
      </div>
      <div className="ml-[72px] h-[0.5px] bg-gray-5"></div>
    </>
  )
}

export default Notification
