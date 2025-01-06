'use client'

import cx from 'clsx'
import type { User } from 'lucia'
import Link from 'next/link'
import { type FunctionComponent, useState } from 'react'
import { toast } from 'sonner'

import { likePost, type PostUser, unlikePost } from '@/app/actions'
import { useAppStore } from '@/hooks/useAppStore'
import { useFollow } from '@/hooks/useFollow'
import { useModal } from '@/hooks/useModal'
import type { Post } from '@/models/Schema'
import { formatCount } from '@/utils/formatCount'

import Avatar from './Avatar'
import { Like, Reply, Repost, Share } from './icons'
import PostAuthor from './PostAuthor'
import PostDropDownMenu from './PostDropDownMenu'
import ReplyModal from './ReplyModal'
import TimeAgo from './TimeAgo'
import UserModal from './UserModal'

type ThreadProps = {
  post: Post
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

const iconStyle = 'flex h-full z-10 items-center gap-1 rounded-full px-3 hover:bg-gray-3 active:scale-85 transition'

type ThreadContentProps = {
  post: Post & { isLiked?: boolean }
  user: PostUser
  onToggleFollow?: () => Promise<void>
  validateFollowStatus?: () => Promise<void>
  currentUser: User | null
  isCurrentUser?: boolean
  isAuthenticated?: boolean
  isTarget: boolean
  isParent: boolean
}

type LikeState = {
  isLiked: boolean
  count: number
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
  // const cachedPost = useAppStore(state => state.posts[post.id])
  // const [likeState, setLikeState] = useState<LikeState>({
  //   isLiked: post.isLiked || false,
  //   count: post.likeCount,
  // })

  // const cachedPost = useSyncExternalStore(
  //   useAppStore.subscribe, // Subscribe function for Zustand
  //   () => useAppStore.getState().posts[post.id], // Selector for the current post
  //   () => undefined, // Server-side fallback, optional if SSR is needed
  // )
  const cachedPost = useAppStore(state => state.posts[post.id])

  const [likeState, setLikeState] = useState<LikeState>({
    isLiked: cachedPost?.isLiked ?? post.isLiked ?? false,
    count: cachedPost?.likeCount ?? post.likeCount,
  })

  const { openModal } = useModal()
  const updatePost = useAppStore(state => state.updatePost)

  const toggleLike = () => {
    setLikeState(prev => ({
      isLiked: !prev.isLiked,
      count: prev.count + (prev.isLiked ? -1 : 1),
    }))
    if (cachedPost) {
      updatePost(post.id, {
        isLiked: !likeState.isLiked,
        likeCount: likeState.count + (likeState.isLiked ? -1 : 1),
      })
    }
  }

  const handleToggleLike = async () => {
    toggleLike()
    const result = await (likeState.isLiked ? unlikePost(post.id) : likePost(post.id))
    if (result.error) {
      // revert optimistic update
      toggleLike()
      toast(result.error)
    }
  }

  const handleInteraction = (action: 'like' | 'reply' | 'repost') => {
    if (!isAuthenticated) {
      openModal('auth-prompt', action)
      return
    }
    // Handle the actual action here
    // TODO: Implement like, reply, repost functionality
    switch (action) {
      case 'like':
        // eslint-disable-next-line no-console
        console.log('clicked like')
        handleToggleLike()
        break
      case 'reply':
        // eslint-disable-next-line no-console
        console.log('clicked reply')
        break
      case 'repost':
        // eslint-disable-next-line no-console
        console.log('clicked repost')
        break
    }
  }

  const replyButton = (
    <button
      type="button"
      className={iconStyle}
      onClick={!isAuthenticated ? () => handleInteraction('reply') : undefined}
    >
      <Reply />
      <span>42</span>
    </button>
  )

  const canFollow = !isCurrentUser && !user.isFollowed

  const getPadding = () => {
    switch (true) {
      case isTarget: return 'pt-0 pb-1'
      case isParent: return 'pt-2'
      default: return 'pt-3 pb-2'
    }
  }

  return (
    <>
      {/* Top border */}
      {(!isParent && !isTarget) && <div className="h-[0.5px] bg-gray-5"></div>}

      <div className={cx(
        'relative flex flex-col gap-2 px-6 pt-3 text-[15px]',
        getPadding(),
      )}
      >

        {/* Vertical Line to Link Parent Thread */}
        <div className="relative">
          {isParent && <div className="absolute bottom-0 left-[17px] top-[50px] w-[2px] bg-gray-5"></div>}

          <div className="grid grid-cols-[48px_minmax(0,1fr)]">
            <div className={cx('col-start-1 pt-[5px]', isTarget ? 'row-span-1' : 'row-span-2')}>
              <div className="relative z-10">
                {isAuthenticated && canFollow
                  ? (
                      <UserModal
                        user={user}
                        isAuthenticated
                        isCurrentUser={isCurrentUser}
                        onToggleFollow={onToggleFollow}
                        trigger={(
                          <button type="button">
                            <Avatar url={user.avatar} isFollowed={canFollow && user.isFollowed} />
                          </button>
                        )}
                      />
                    )
                  : (
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
            <div className={cx(
              'row-start-2',
              isParent || !isTarget ? 'col-start-2' : 'col-span-2', // parent or reply thread
              isTarget && 'mt-[7px]', // main thread
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
                  <img
                    src={post.image}
                    alt="preview"
                    className="block max-h-[430px] rounded-lg object-contain"
                  />
                </div>
              </div>
            )}

            <div className={cx('-ml-3 mt-1 flex h-9 items-center text-[13px] text-secondary-text', isTarget ? 'col-span-2' : 'col-start-2')}>
              <button type="button" className={iconStyle} onClick={() => handleInteraction('like')}>
                <Like className={likeState.isLiked ? 'fill-notification stroke-notification' : ''} />
                <span className={cx('tabular-nums', likeState.isLiked && 'text-notification')}>{formatCount(likeState.count)}</span>
              </button>
              {isAuthenticated && currentUser
                ? (
                    <ReplyModal
                      author={user}
                      post={post}
                      user={currentUser}
                      trigger={(
                        replyButton
                      )}
                    />
                  )
                : replyButton}

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
        <Link href={`/@${user.username}/post/${post.id}`} className="absolute inset-0"></Link>
      </div>
    </>
  )
}

const AuthThread: FunctionComponent<ThreadProps> = ({ post, user: initialUser, isCurrentUser, currentUser, isTarget = false, isParent = false }) => {
  const { user, handleToggleFollow, validateFollowStatus } = useFollow({ initialUser })
  // const router = useRouter()

  // useEffect(() => {
  //   router.prefetch(`/@${user.username}/post/${post.id}`)
  // }, [router, user.username, post.id])

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
  return (
    <ThreadContent
      post={post}
      user={user}
      currentUser={null}
      isTarget={isTarget}
      isParent={isParent}
    />
  )
}

const Thread: FunctionComponent<ThreadProps> = ({ post, user, currentUser, isCurrentUser, isAuthenticated, isTarget = false, isParent = false }) => {
  if (isAuthenticated) {
    return <AuthThread post={post} user={user} isAuthenticated currentUser={currentUser} isCurrentUser={isCurrentUser} isTarget={isTarget} isParent={isParent} />
  }
  return <PublicThread post={post} user={user} isTarget={isTarget} isParent={isParent} />
}

export default Thread
