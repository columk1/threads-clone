import cx from 'clsx'
import type { User } from 'lucia'
import { useRouter } from 'next/navigation'
import { type FunctionComponent, useState } from 'react'
import { toast } from 'sonner'

import { useAppStore } from '@/hooks/useAppStore'
import { useModal } from '@/hooks/useModal'
import type { Post } from '@/lib/db/Schema'
import { handleLikeAction, handleRepostAction, handleShareAction } from '@/services/posts/posts.actions'
import type { PostUser } from '@/services/users/users.queries'
import { formatCount } from '@/utils/format/formatCount'

import CountWheel from './CountWheel'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './DropdownMenu'
import { LikeIcon, ReplyIcon, RepostedIcon, RepostIcon, ShareIcon } from './icons'
import ReplyModal from './ReplyModal'

const iconStyle =
  'flex h-full z-10 items-center gap-1 rounded-full px-2.5 hover:bg-tertiary-bg active:scale-85 transition overflow-y-hidden'

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
  const [hasLikeIconBeenToggled, setHasLikeIconBeenToggled] = useState(false)
  const { openModal } = useModal()
  const updatePost = useAppStore((state) => state.updatePost)
  const cachedPost = useAppStore((state) => state.posts[post.id])

  const likeCount = cachedPost?.likeCount ?? post.likeCount
  const isLiked = cachedPost?.isLiked ?? post.isLiked ?? false
  const isReposted = cachedPost?.isReposted ?? post.isReposted ?? false
  const replyCount = cachedPost?.replyCount ?? post.replyCount
  const repostCount = cachedPost?.repostCount ?? post.repostCount

  const router = useRouter()

  const toggleLike = (state?: boolean) => {
    const isToggling = state === undefined
    updatePost(post.id, {
      isLiked: isToggling ? !isLiked : isLiked,
      likeCount: isToggling ? likeCount + (!isLiked ? 1 : -1) : post.likeCount,
      replyCount: post.replyCount,
      isReposted,
      repostCount,
    })
  }

  const toggleRepost = (state?: boolean) => {
    const isToggling = state === undefined
    updatePost(post.id, {
      isLiked,
      likeCount,
      replyCount,
      isReposted: isToggling ? !isReposted : isReposted,
      repostCount: isToggling ? repostCount + (!isReposted ? 1 : -1) : post.repostCount,
    })
  }

  const handleToggleLike = async () => {
    const previousIsLiked = isLiked
    setHasLikeIconBeenToggled(true)
    toggleLike()
    const likeAction = isLiked ? 'unlike' : 'like'
    const result = await handleLikeAction(likeAction, post.id)
    if (result.error) {
      // revert optimistic update to previous state
      toggleLike(previousIsLiked)
      toast(result.error)
    }
  }

  const handleToggleRepost = async () => {
    const previousIsReposted = isReposted
    toggleRepost()
    const repostAction = isReposted ? 'unrepost' : 'repost'
    const successMessage = isReposted ? 'Removed' : 'Reposted'
    const result = await handleRepostAction(repostAction, post.id)
    router.refresh()
    if (result.error) {
      // revert optimistic update to previous state
      toggleRepost(previousIsReposted)
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

  const handleShare = async () => {
    navigator.clipboard.writeText(`${window.location.origin}/@${author.username}/post/${post.id}`)
    const result = await handleShareAction(post.id)
    if (result.error) {
      toast(result.error)
      return
    }
    toast('Copied')
  }

  return (
    <div className={cx('-ml-2.5 mt-1 flex h-9 items-center text-[13px] text-charcoal-text', className)}>
      <button type="button" className={iconStyle} onClick={() => handleInteraction('like')}>
        <LikeIcon className={isLiked ? 'fill-notification stroke-notification' : ''} />
        <span className={cx('tabular-nums', isLiked && 'text-notification')}>
          <CountWheel likeCount={likeCount} isLiked={isLiked} hasBeenToggled={hasLikeIconBeenToggled} />
        </span>
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

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className={iconStyle}>
          <ShareIcon />
          <span className="tabular-nums">{formatCount(post.shareCount)}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60 origin-top-left text-ms font-semibold">
          <DropdownMenuItem asChild className="leading-none">
            <button type="button" onClick={handleShare} className="flex w-full justify-between">
              Copy link
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ThreadActions
