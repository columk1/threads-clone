'use client'

import cx from 'clsx'
import type { User } from 'lucia'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { FunctionComponent } from 'react'

import Avatar from '@/components/Avatar'
import { RepostIcon } from '@/components/icons'
import NestedLinkWrapper from '@/components/NestedLinkWrapper'
import PostAuthor from '@/components/PostAuthor'
import PostDropDownMenu from '@/components/PostDropDownMenu'
import ThreadActions from '@/components/ThreadActions'
import TimeAgo from '@/components/TimeAgo'
import UnfollowModal from '@/components/UnfollowModal'
import UserModal from '@/components/UserModal'
import { useFollow } from '@/hooks/useFollow'
import type { PostData } from '@/repositories/posts.repository'
import type { PostUser } from '@/services/users/users.queries'

// URL regex pattern that matches URLs starting with http://, https://, or www.
const URL_PATTERN = /(https?:\/\/\S+)|(www\.\S+)/g

type ThreadTextProps = {
  text: string | null
}

export const ThreadText: FunctionComponent<ThreadTextProps> = ({ text }) => {
  if (!text) {
    return null
  }

  const parts = text.split(URL_PATTERN)
  return (
    <div className="whitespace-pre-line leading-[1.35rem]">
      {parts.map((part, i) => {
        if (!part) {
          return null
        }
        if (part.match(URL_PATTERN)) {
          const href = part.startsWith('www.') ? `https://${part}` : part
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-link-text hover:underline"
            >
              {part}
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </div>
  )
}

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

type ThreadMediaProps = {
  image: string | null
  imageWidth: number | null
  imageHeight: number | null
  isTarget?: boolean
  imagePriority?: boolean
}

export const ThreadMedia = ({
  image,
  imageWidth,
  imageHeight,
  isTarget = false,
  imagePriority = false,
}: ThreadMediaProps) => {
  if (!image) {
    return null
  }

  const { containerWidth, containerHeight } = applyConstraints(imageWidth, imageHeight)

  return (
    <div className={cx('flex text-secondary-text pt-2', isTarget ? 'col-span-2' : 'col-start-2')}>
      <div className={cx('mb-1 rounded-lg outline -outline-offset-1 outline-primary-outline')}>
        <Image
          src={image}
          alt="preview"
          priority={imagePriority}
          width={Number(containerWidth)}
          height={Number(containerHeight)}
          quality={65}
          className="block size-auto max-h-[430px] rounded-lg object-contain"
          style={{
            width: `${containerWidth}px`,
            height: `auto`,
          }}
        />
      </div>
    </div>
  )
}

type ThreadProps = {
  post: PostData
  user: PostUser
  currentUser: User | null
  isCurrentUser: boolean
  isAuthenticated: boolean
  isTarget?: boolean
  isParent?: boolean
  reposted?: { username: string; createdAt: number }
  imagePriority?: boolean
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
      {!isParent && !isTarget && (
        <div className={`h-[0.5px] bg-primary-outline ${!currentUser && 'first:hidden'}`}></div>
      )}
      <div className={cx('relative flex flex-col gap-2 px-6 text-ms', getYPadding())}>
        {isParent && <div className="absolute bottom-[-7px] left-[41px] top-[50px] w-[2px] bg-primary-outline"></div>}
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
    <div className="flex h-9 items-center gap-3 text-[13px] text-secondary-text">
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
  post: PostData
  user: PostUser
  isTarget: boolean
  isAuthenticated: boolean
  isCurrentUser: boolean
  currentUser: User | null
  onToggleFollow?: () => Promise<void>
  imagePriority?: boolean
}> = ({ post, user, isTarget, isAuthenticated, isCurrentUser, currentUser, onToggleFollow, imagePriority }) => {
  const canFollow = !isCurrentUser && !user.isFollowed

  return (
    <div role="article" aria-label={`${user.username} thread`} className="grid grid-cols-[48px_minmax(0,1fr)]">
      <div className={cx('col-start-1 pt-[5px]', isTarget ? 'row-span-1' : 'row-span-2')}>
        <div className="relative z-10 h-9">
          {isAuthenticated && canFollow ? (
            <UserModal
              user={user}
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
                priority={imagePriority}
                className="group-focus-visible:outline-2 group-focus-visible:outline-white group-focus-visible:ring-2 group-focus-visible:ring-blue-500 group-focus-visible:ring-offset-2"
              />
            </Link>
          )}
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2 leading-6">
          <PostAuthor user={user} isCurrentUser={isCurrentUser} onToggleFollow={onToggleFollow} />
          <a href={`/@${user.username}/post/${post.id}`}>
            <TimeAgo publishedAt={post.createdAt} />
          </a>
        </div>
        <PostDropDownMenu
          isFollowed={user.isFollowed}
          onToggleFollow={onToggleFollow}
          isAuthenticated={isAuthenticated}
          isCurrentUser={isCurrentUser}
          postId={post.id}
        />
      </div>

      <div className={cx('row-start-2', isTarget ? 'col-span-2 mt-[7px]' : 'col-start-2')}>
        {post.replyingTo && <span className="text-secondary-text">{`Replying to ${post.replyingTo}`}</span>}
        <ThreadText text={post.text} />
      </div>

      <ThreadMedia
        image={post.image}
        imageWidth={post.imageWidth}
        imageHeight={post.imageHeight}
        isTarget={isTarget}
        imagePriority={imagePriority}
      />

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
  imagePriority = false,
}: ThreadProps) {
  const router = useRouter()
  const {
    user: followableUser,
    handleToggleFollow,
    unfollowModalProps,
  } = useFollow({
    initialUser: user,
    isAuthenticated,
  })

  return (
    <ThreadLayout isParent={isParent} isTarget={isTarget} currentUser={currentUser}>
      <NestedLinkWrapper onClick={() => router.push(`/@${followableUser.username}/post/${post.id}`)}>
        {reposted && <RepostHeader username={reposted.username} createdAt={reposted.createdAt} />}
        <ThreadContent
          post={post}
          user={followableUser}
          isTarget={isTarget}
          isAuthenticated={isAuthenticated}
          isCurrentUser={isCurrentUser}
          currentUser={currentUser}
          onToggleFollow={handleToggleFollow}
          imagePriority={imagePriority}
        />
      </NestedLinkWrapper>
      <UnfollowModal {...unfollowModalProps} />
    </ThreadLayout>
  )
}
