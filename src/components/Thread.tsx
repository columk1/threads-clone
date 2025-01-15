'use client'

import cx from 'clsx'
import type { User } from 'lucia'
import Link from 'next/link'
import type { FunctionComponent } from 'react'

import { useFollow } from '@/hooks/useFollow'
import type { Post } from '@/lib/db/Schema'
import type { PostUser } from '@/services/users/users.queries'

import Avatar from './Avatar'
import PostAuthor from './PostAuthor'
import PostDropDownMenu from './PostDropDownMenu'
import ThreadActions from './ThreadActions'
import TimeAgo from './TimeAgo'
import UserModal from './UserModal'

type ThreadProps = {
  post: Post & { isLiked?: boolean; isReposted?: boolean }
  user: PostUser
  currentUser: User | null
  isCurrentUser: boolean
  isAuthenticated: boolean
  isTarget?: boolean
  isParent?: boolean
}

type PublicThreadProps = {
  post: Post
  user: PostUser
  isTarget: boolean
  isParent: boolean
}

type ThreadContentProps = {
  post: Post & { isLiked?: boolean; isReposted?: boolean }
  user: PostUser
  onToggleFollow?: () => Promise<void>
  validateFollowStatus?: () => Promise<void>
  currentUser: User | null
  isCurrentUser?: boolean
  isAuthenticated?: boolean
  isTarget: boolean
  isParent: boolean
}

const ThreadContent: FunctionComponent<ThreadContentProps> = ({
  isTarget,
  post,
  user,
  currentUser,
  onToggleFollow,
  validateFollowStatus,
  isCurrentUser = false,
  isAuthenticated = false,
  isParent,
}) => {
  const canFollow = !isCurrentUser && !user.isFollowed

  const getPadding = () => {
    switch (true) {
      case isTarget:
        return 'pt-0 pb-1'
      case isParent:
        return 'pt-2'
      default:
        return 'pt-3 pb-2'
    }
  }

  return (
    <>
      {/* Top border. Add "first-hidden" to remove top border for main public feed */}
      {!isParent && !isTarget && <div className={`h-[0.5px] bg-gray-5 ${!currentUser && 'first:hidden'}`}></div>}
      <div className={cx('relative flex flex-col gap-2 px-6 pt-3 text-[15px]', getPadding())}>
        {/* Vertical Line to Link Parent Thread */}
        <div className="relative">
          {isParent && <div className="absolute bottom-[-7px] left-[17px] top-[50px] w-[2px] bg-gray-5"></div>}

          <div className="grid grid-cols-[48px_minmax(0,1fr)]">
            <div className={cx('col-start-1 pt-[5px]', isTarget ? 'row-span-1' : 'row-span-2')}>
              {/* User Avatar */}
              <div className="relative z-10 h-9">
                {isAuthenticated && canFollow ? (
                  <UserModal
                    user={user}
                    isAuthenticated
                    isCurrentUser={isCurrentUser}
                    onToggleFollow={onToggleFollow}
                    trigger={
                      <button type="button">
                        <Avatar url={user.avatar} isFollowed={canFollow && user.isFollowed} />
                      </button>
                    }
                  />
                ) : (
                  <Link href={`/@${user.username}`}>
                    <Avatar url={user.avatar} />
                  </Link>
                )}
              </div>
            </div>
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="font-semibold" onMouseEnter={() => validateFollowStatus?.()}>
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
            <div
              className={cx(
                'row-start-2',
                // text position for target thread OR it's parent and replies
                isTarget ? 'col-span-2 mt-[7px]' : 'col-start-2',
              )}
            >
              {post.text}
            </div>

            {/* Media Section */}
            {post.image && (
              <div className={cx('flex text-gray-7 pt-2', isTarget ? 'col-span-2' : 'col-start-2')}>
                {/* Image */}

                <div className="mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt="preview" className="block max-h-[430px] rounded-lg object-contain" />
                </div>
              </div>
            )}

            <ThreadActions
              post={post}
              currentUser={currentUser}
              author={user}
              isAuthenticated={isAuthenticated}
              className={cx(isTarget ? 'col-span-2' : 'col-start-2')}
            />
          </div>
        </div>
        <Link href={`/@${user.username}/post/${post.id}`} className="absolute inset-0"></Link>
      </div>
    </>
  )
}

const AuthThread: FunctionComponent<ThreadProps> = ({
  post,
  user: initialUser,
  isCurrentUser,
  currentUser,
  isTarget = false,
  isParent = false,
}) => {
  const { user, handleToggleFollow, validateFollowStatus } = useFollow({ initialUser })
  // type guard to make sure it's not a PublicUser
  if (!('isFollowed' in user)) {
    return null
  }
  return (
    <ThreadContent
      post={post}
      user={user}
      isAuthenticated
      isCurrentUser={isCurrentUser}
      currentUser={currentUser}
      onToggleFollow={handleToggleFollow}
      validateFollowStatus={validateFollowStatus}
      isTarget={isTarget}
      isParent={isParent}
    />
  )
}

const PublicThread: FunctionComponent<PublicThreadProps> = ({ post, user, isTarget, isParent }) => {
  return <ThreadContent post={post} user={user} currentUser={null} isTarget={isTarget} isParent={isParent} />
}

const Thread: FunctionComponent<ThreadProps> = ({
  post,
  user,
  currentUser,
  isCurrentUser,
  isAuthenticated,
  isTarget = false,
  isParent = false,
}) => {
  if (isAuthenticated) {
    return (
      <AuthThread
        post={post}
        user={user}
        isAuthenticated
        currentUser={currentUser}
        isCurrentUser={isCurrentUser}
        isTarget={isTarget}
        isParent={isParent}
      />
    )
  }
  return <PublicThread post={post} user={user} isTarget={isTarget} isParent={isParent} />
}

export default Thread
