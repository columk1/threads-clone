import cx from 'clsx'
import type { User } from 'lucia'
import type { FunctionComponent } from 'react'
import { toast } from 'sonner'

import { useAppStore } from '@/hooks/useAppStore'
import { useModal } from '@/hooks/useModal'
import type { Post } from '@/lib/db/Schema'
import { handleLikeAction } from '@/services/posts/posts.actions'
import type { PostUser } from '@/services/users/users.queries'
import { formatCount } from '@/utils/format/formatCount'

import { Like, Reply, Repost, Share } from './icons'
import ReplyModal from './ReplyModal'

const iconStyle = 'flex h-full z-10 items-center gap-1 rounded-full px-3 hover:bg-gray-3 active:scale-85 transition'

type ThreadActionsProps = {
  post: Post & { isLiked?: boolean }
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
  const replyCount = cachedPost?.replyCount ?? post.replyCount

  const toggleLike = () => {
    const newLikeCount = likeCount + (isLiked ? -1 : 1)
    if (cachedPost) {
      updatePost(post.id, {
        isLiked: !isLiked,
        likeCount: newLikeCount,
        replyCount: post.replyCount,
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
        // eslint-disable-next-line no-console
        console.log('clicked repost')
        break
    }
  }

  const replyButton = (
    <button type="button" className={iconStyle} onClick={() => handleInteraction('reply')}>
      <Reply />
      <span>{formatCount(replyCount)}</span>
    </button>
  )

  return (
    <div className={cx('-ml-3 mt-1 flex h-9 items-center text-[13px] text-secondary-text', className)}>
      <button type="button" className={iconStyle} onClick={() => handleInteraction('like')}>
        <Like className={isLiked ? 'fill-notification stroke-notification' : ''} />
        <span className={cx('tabular-nums', isLiked && 'text-notification')}>{formatCount(likeCount)}</span>
      </button>

      {isAuthenticated && currentUser ? (
        <ReplyModal author={author} post={post} user={currentUser} trigger={replyButton} />
      ) : (
        replyButton
      )}

      <button type="button" className={iconStyle} onClick={() => handleInteraction('repost')}>
        <Repost />
        <span>42</span>
      </button>

      <button type="button" className={iconStyle}>
        <Share />
        <span></span>
      </button>
    </div>
  )
}

export default ThreadActions
