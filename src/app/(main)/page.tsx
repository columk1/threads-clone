import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import Header from '@/components/Header'
import { HeaderDropdown } from '@/components/HeaderDropdown'
import { MobileHomeFeedNav } from '@/components/MobileHomeFeedNav'
import PostButton from '@/components/PostButton'
import Threads from '@/components/Threads'
import { validateRequest } from '@/libs/Lucia'

const Dashboard = async () => {
  const { user } = await validateRequest()
  const userExists = user && user.emailVerified
  if (!userExists) {
    return redirect('/login')
  }

  return (
    <>
      <Header title="For you">
        <HeaderDropdown pathname="/" />
      </Header>
      <div className="flex w-full flex-1 flex-col pt-2 md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        <MobileHomeFeedNav />
        <div className="">
          <div className="flex items-center border-b-[0.5px] border-gray-5 px-6 py-4 text-[15px] text-gray-7">
            <div className="flex flex-1 items-center gap-3">
              <div className="size-9 rounded-full bg-gray-7"></div>
              {/* Same new post click handler here */}
              <span role="button" className="flex-1 cursor-text">What's new?</span>
            </div>
            <PostButton className="ml-auto h-9 rounded-lg border border-gray-5 px-4 font-semibold text-primary-text transition active:scale-95">
              Post
            </PostButton>
          </div>
          {/* Posts Here */}
          <Suspense fallback={<p>Loading...</p>}>
            <Threads />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default Dashboard
