'use client'

import cx from 'clsx'
import type { User } from 'lucia'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { FunctionComponent } from 'react'

import { useFollow } from '@/hooks/useFollow'
import type { Post } from '@/lib/db/Schema'
import type { PostUser } from '@/services/users/users.queries'
import { handleNestedInteraction } from '@/utils/handleNestedInteraction'

import Avatar from './Avatar'
import { RepostIcon } from './icons'
import PostAuthor from './PostAuthor'
import PostDropDownMenu from './PostDropDownMenu'
import ThreadActions from './ThreadActions'
import TimeAgo from './TimeAgo'
import UserModal from './UserModal'

const applyConstraints = (width: number | null, height: number | null, maxWidth = 543, maxHeight = 430) => {
  if (!width || !height) {
    return {
      containerWidth: 'auto',
      containerHeight: 'auto',
    }
  }
  const widthRatio = maxWidth / width
  const heightRatio = maxHeight / height
  const scale = Math.min(widthRatio, heightRatio, 1) // Scale down if needed, but don't upscale
  return {
    containerWidth: Math.round(width * scale),
    containerHeight: Math.round(height * scale),
  }
}

type ThreadProps = {
  post: Post & { isLiked?: boolean; isReposted?: boolean }
  user: PostUser
  currentUser: User | null
  isCurrentUser: boolean
  isAuthenticated: boolean
  isTarget?: boolean
  isParent?: boolean
  reposted?: { username: string; createdAt: number }
}

type ThreadCardProps = {
  onClick: () => void
  children: React.ReactNode
}

const ThreadCard: FunctionComponent<ThreadCardProps> = ({ onClick, children }) => {
  return (
    <div
      role="link"
      onClick={(e) => handleNestedInteraction(e, onClick)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      tabIndex={0}
      className="link cursor-pointer"
    >
      {children}
    </div>
  )
}

type ThreadLayoutProps = {
  children: React.ReactNode
  isParent: boolean
  isTarget: boolean
  currentUser: User | null
}

const ThreadLayout: FunctionComponent<ThreadLayoutProps> = ({ children, isParent, isTarget, currentUser }) => {
  const getYPadding = () => {
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
      {!isParent && !isTarget && <div className={`h-[0.5px] bg-gray-5 ${!currentUser && 'first:hidden'}`}></div>}
      <div className={cx('relative flex flex-col gap-2 px-6 text-[15px]', getYPadding())}>
        {isParent && <div className="absolute bottom-[-7px] left-[41px] top-[50px] w-[2px] bg-gray-5"></div>}
        {children}
      </div>
    </>
  )
}

const RepostHeader: FunctionComponent<{
  username: string
  createdAt: number
}> = ({ username, createdAt }) => (
  <Link href={`/@${username}`} className="group relative z-10">
    <div className="flex h-9 items-center gap-3 text-[13px] text-gray-7">
      <span className="w-9">
        <RepostIcon className="size-4 justify-self-end" />
      </span>
      <div>
        <span className="font-semibold group-hover:underline">{username}</span>
        <span>&nbsp;reposted&nbsp;</span>
        <TimeAgo publishedAt={createdAt} />
        <span>&nbsp;ago</span>
      </div>
    </div>
  </Link>
)

const ThreadContent: FunctionComponent<{
  post: Post
  user: PostUser
  isTarget: boolean
  isAuthenticated: boolean
  isCurrentUser: boolean
  currentUser: User | null
  onToggleFollow?: () => Promise<void>
  validateFollowStatus?: () => Promise<void>
}> = ({ post, user, isTarget, isAuthenticated, isCurrentUser, currentUser, onToggleFollow, validateFollowStatus }) => {
  const canFollow = !isCurrentUser && !user.isFollowed

  const media = () => {
    if (!post.image) {
      return null
    }
    const { containerWidth, containerHeight } = applyConstraints(post.imageWidth, post.imageHeight)
    // const { width, height } = { width: post.imageWidth || 543, height: post.imageHeight || 430 }
    return (
      <div className={cx('flex text-gray-7 pt-2', isTarget ? 'col-span-2' : 'col-start-2')}>
        <div
          className={cx('mb-1 max-h-[430px] rounded-lg outline outline-1 outline-offset--1 outline-primary-outline')}
          style={{
            width: containerWidth,
            height: containerHeight,
          }}
        >
          <Image
            src={post.image}
            alt="preview"
            priority
            width={Number(containerWidth)}
            height={Number(containerHeight)}
            className="block rounded-lg object-contain"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[48px_minmax(0,1fr)]">
      <div className={cx('col-start-1 pt-[5px]', isTarget ? 'row-span-1' : 'row-span-2')}>
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
            // Override focus styles to allow focus-ring to circle image for keyboard users
            <Link href={`/@${user.username}`} className="group !ring-0 !ring-offset-0">
              <Avatar
                url={user.avatar}
                className="group-focus-visible:outline-2 group-focus-visible:outline-white group-focus-visible:ring-2 group-focus-visible:ring-blue-500 group-focus-visible:ring-offset-2"
              />
            </Link>
          )}
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="font-semibold" onMouseEnter={() => (isAuthenticated ? validateFollowStatus?.() : {})}>
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

      {post.text && (
        <div className={cx('row-start-2', isTarget ? 'col-span-2 mt-[7px]' : 'col-start-2')}>{post.text}</div>
      )}

      {media()}

      <ThreadActions
        post={post}
        currentUser={currentUser}
        author={user}
        isAuthenticated={isAuthenticated}
        className={cx(isTarget ? 'col-span-2' : 'col-start-2')}
      />
    </div>
  )
}

export default function Thread({
  post,
  user,
  currentUser,
  isCurrentUser,
  isAuthenticated,
  isTarget = false,
  isParent = false,
  reposted,
}: ThreadProps) {
  const router = useRouter()
  const {
    user: followableUser,
    handleToggleFollow,
    validateFollowStatus,
  } = useFollow({
    initialUser: user,
    isAuthenticated,
  })

  return (
    <ThreadLayout isParent={isParent} isTarget={isTarget} currentUser={currentUser}>
      <ThreadCard onClick={() => router.push(`/@${followableUser.username}/post/${post.id}`)}>
        {reposted && <RepostHeader username={reposted.username} createdAt={reposted.createdAt} />}
        <ThreadContent
          post={post}
          user={followableUser}
          isTarget={isTarget}
          isAuthenticated={isAuthenticated}
          isCurrentUser={isCurrentUser}
          currentUser={currentUser}
          onToggleFollow={handleToggleFollow}
          validateFollowStatus={validateFollowStatus}
        />
      </ThreadCard>
    </ThreadLayout>
  )
}
