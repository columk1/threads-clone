import cx from 'clsx'
import type { User } from 'lucia'
import type { FunctionComponent } from 'react'
import { toast } from 'sonner'

import { useAppStore } from '@/hooks/useAppStore'
import { useModal } from '@/hooks/useModal'
import type { Post } from '@/lib/db/Schema'
import { handleLikeAction, handleRepostAction } from '@/services/posts/posts.actions'
import type { PostUser } from '@/services/users/users.queries'
import { formatCount } from '@/utils/format/formatCount'

import { LikeIcon, ReplyIcon, RepostedIcon, RepostIcon, ShareIcon } from './icons'
import ReplyModal from './ReplyModal'

const iconStyle = 'flex h-full z-10 items-center gap-1 rounded-full px-3 hover:bg-gray-3 active:scale-85 transition'

type ThreadActionsProps = {
  post: Post & { isLiked?: boolean; isReposted?: boolean }
  currentUser: User | null
  author: PostUser
  isAuthenticated: boolean
  className?: string
}

const ThreadActions: FunctionComponent<ThreadActionsProps> = ({
  post,
  currentUser,
  author,
  isAuthenticated,
  className,
}) => {
  const { openModal } = useModal()
  const updatePost = useAppStore((state) => state.updatePost)
  const cachedPost = useAppStore((state) => state.posts[post.id])
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

  const likeCount = cachedPost?.likeCount ?? post.likeCount
  const isLiked = cachedPost?.isLiked ?? post.isLiked ?? false
  const isReposted = cachedPost?.isReposted ?? post.isReposted ?? false
  const replyCount = cachedPost?.replyCount ?? post.replyCount
  const repostCount = cachedPost?.repostCount ?? post.repostCount

  const toggleLike = () => {
    const newLikeCount = likeCount + (isLiked ? -1 : 1)
    if (cachedPost) {
      updatePost(post.id, {
        isLiked: !isLiked,
        likeCount: newLikeCount,
        replyCount: post.replyCount,
        isReposted,
        repostCount,
      })
    }
  }

  const toggleRepost = () => {
    const newRepostCount = repostCount + (isReposted ? -1 : 1)
    if (cachedPost) {
      updatePost(post.id, {
        isLiked,
        likeCount,
        replyCount,
        isReposted: !isReposted,
        repostCount: newRepostCount,
      })
    }
  }

  const handleToggleLike = async () => {
    toggleLike()
    const likeAction = isLiked ? 'unlike' : 'like'
    const result = await handleLikeAction(likeAction, post.id)
    if (result.error) {
      // revert optimistic update
      toggleLike()
      toast(result.error)
    }
  }

  const handleToggleRepost = async () => {
    toggleRepost()
    const repostAction = isReposted ? 'unrepost' : 'repost'
    const successMessage = isReposted ? 'Removed' : 'Reposted'
    const result = await handleRepostAction(repostAction, post.id)
    if (result.error) {
      // revert optimistic update
      toggleRepost()
      toast(result.error)
      return
    }
    toast(successMessage)
  }

  const handleInteraction = (action: 'like' | 'reply' | 'repost') => {
    if (!isAuthenticated) {
      openModal('auth-prompt', action)
      return
    }

    switch (action) {
      case 'like':
        handleToggleLike()
        break
      case 'repost':
        handleToggleRepost()
        break
    }
  }

  const replyButton = (
    <button type="button" className={iconStyle} onClick={() => handleInteraction('reply')}>
      <ReplyIcon />
      <span>{formatCount(replyCount)}</span>
    </button>
  )

  return (
    <div className={cx('-ml-3 mt-1 flex h-9 items-center text-[13px] text-secondary-text', className)}>
      <button type="button" className={iconStyle} onClick={() => handleInteraction('like')}>
        <LikeIcon className={isLiked ? 'fill-notification stroke-notification' : ''} />
        <span className={cx('tabular-nums', isLiked && 'text-notification')}>{formatCount(likeCount)}</span>
      </button>

      {isAuthenticated && currentUser ? (
        <ReplyModal author={author} post={post} user={currentUser} trigger={replyButton} />
      ) : (
        replyButton
      )}

      <button type="button" className={iconStyle} onClick={() => handleInteraction('repost')}>
        {isReposted ? <RepostedIcon /> : <RepostIcon />}

        <span className="tabular-nums">{formatCount(repostCount)}</span>
      </button>

      <button type="button" className={iconStyle}>
        <ShareIcon />
        <span></span>
      </button>
    </div>
  )
}

export default ThreadActions
