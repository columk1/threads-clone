import { type FunctionComponent, Suspense } from 'react'

import { MobileHomeFeedNav } from './MobileHomeFeedNav'
import PostButton from './PostButton'
import Threads from './Threads'

type Props = {
  filter?: string
}

const MainFeed: FunctionComponent<Props> = ({ filter }) => {
  return (
    <div className="flex w-full flex-1 flex-col pt-2 md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
      <MobileHomeFeedNav />
      <div className="">
        <div className="flex items-center border-b-[0.5px] border-gray-5 px-6 py-4 text-[15px] text-gray-7">
          <div className="flex flex-1 items-center gap-3">
            <div className="size-9 rounded-full bg-gray-7"></div>
            {/* Same new post click handler here */}
            <PostButton className="flex-1 cursor-text text-left">What's new?</PostButton>
          </div>
          <PostButton className="ml-auto h-9 rounded-lg border border-gray-5 px-4 font-semibold text-primary-text transition active:scale-95">
            Post
          </PostButton>
        </div>
        {/* Posts Here */}
        <Suspense fallback={<p>Loading...</p>}>
          <Threads filter={filter} />
        </Suspense>
      </div>
    </div>
  )
}

export default MainFeed
