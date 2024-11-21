import type { FunctionComponent } from 'react'

import PostButton from './PostButton'

const NewThread: FunctionComponent = () => {
  return (
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
  )
}

export default NewThread
