import type { FunctionComponent } from 'react'

import { getAllPosts, getFollowingPosts } from '@/app/actions'

import { Like, Reply, Repost, Share } from './icons'
import PostAuthor from './PostAuthor'
import PostDropDownMenu from './PostDropDownMenu'
import TimeAgo from './TimeAgo'

type ThreadsProps = {
  // posts: Post[]
  filter?: string
}

const iconStyle = 'flex h-full items-center gap-1 rounded-full px-3 hover:bg-gray-3 active:scale-85 transition'

const Threads: FunctionComponent<ThreadsProps> = async ({ filter }) => {
  const rows = await filter === undefined ? await getAllPosts() : await getFollowingPosts()
  return rows.map(row => (
    <div key={row.post.id} className="flex flex-col gap-2 border-b-[0.5px] border-gray-5 px-6 py-3 text-[15px]">
      <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-y-[3px]">
        <div className="col-start-1 row-start-1 row-end-[span_2] pt-1 ">
          <div className="size-9 rounded-full bg-gray-7"></div>
        </div>
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="font-semibold">
              <PostAuthor username={row.user.username} isFollowed={row.user.isFollowed} />
            </div>
            <a href={`/@${row.user.username}/post/${row.post.id}`}>
              <TimeAgo publishedAt={row.post.createdAt} />
            </a>
          </div>
          {/* TODO: Implement followers/following */}
          <PostDropDownMenu isFollowed />
        </div>
        <div className="col-start-2 mb-[2px]">
          {row.post.text}
        </div>
        {/* {row.post.image && (
        <img src={row.post.image} alt="Post image" className="w-full" />
      )} */}
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
  ))
}

export default Threads

// grid-rows-[fit-content_19px_max-content_max-content]
