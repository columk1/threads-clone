'use client'

import Link from 'next/link'
import type { FunctionComponent } from 'react'

import type { PostUser } from '@/app/actions'
import { useFollow } from '@/hooks/useFollow'
import { useModal } from '@/hooks/useModal'
import type { Post } from '@/models/Schema'

import Avatar from './Avatar'
import { Like, Reply, Repost, Share } from './icons'
import PostAuthor from './PostAuthor'
import PostDropDownMenu from './PostDropDownMenu'
import ReplyModal from './ReplyModal'
import TimeAgo from './TimeAgo'

type ThreadProps = {
  post: Post
  user: PostUser
  isCurrentUser: boolean
  isAuthenticated: boolean
}

type PublicThreadProps = {
  post: Post
  user: PostUser
}

const iconStyle = 'flex h-full items-center gap-1 rounded-full px-3 hover:bg-gray-3 active:scale-85 transition'

type ThreadContentProps = {
  post: Post
  user: PostUser
  onToggleFollow?: () => Promise<void>
  isCurrentUser?: boolean
  isAuthenticated?: boolean
}

const ThreadContent: FunctionComponent<ThreadContentProps> = ({
  post,
  user,
  onToggleFollow,
  isCurrentUser = false,
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
    switch (action) {
      case 'like':
        // eslint-disable-next-line no-console
        console.log('clicked like')
        break
      case 'reply':
        openModal('reply')
        break
      case 'repost':
        // eslint-disable-next-line no-console
        console.log('clicked repost')
        break
    }
  }

  return (
    // <button type="button" role="link" onClick={() => router.push(`/@${user.username}/post/${post.id}`)}>
    <Link href={`/@${user.username}/post/${post.id}`}>
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
    </Link>
  )
}

const AuthThread: FunctionComponent<ThreadProps> = ({ post, user: initialUser, isCurrentUser }) => {
  // const router = useRouter()
  const { user, handleToggleFollow } = useFollow({ initialUser })

  // useEffect(() => {
  //   router.prefetch(`/@${user.username}/post/${post.id}`)
  // }, [router, user.username, post.id])

  // type guard to make sure it's not a PublicUser
  if (!('isFollowed' in user)) {
    return null
  }
  return (
    <>
      <ThreadContent
        post={post}
        user={user}
        isAuthenticated
        isCurrentUser={isCurrentUser}
        onToggleFollow={handleToggleFollow}
      />
      <ReplyModal username={user.username} post={post} />
    </>
  )
}

const PublicThread: FunctionComponent<PublicThreadProps> = ({ post, user }) => {
  // const openModal = () => Promise.resolve().then(() => redirect('/login'))
  // const handleLoginPrompt = () => openModal()

  return (
    <ThreadContent
      post={post}
      user={user}
    />
  )
}

const Thread: FunctionComponent<ThreadProps> = ({ post, user, isCurrentUser, isAuthenticated }) => {
  if (isAuthenticated) {
    return <AuthThread post={post} user={user} isAuthenticated isCurrentUser={isCurrentUser} />
  }
  return <PublicThread post={post} user={user} />
}

export default Thread
