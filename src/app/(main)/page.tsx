import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import Header from '@/components/Header'
import { HeaderDropdown } from '@/components/HeaderDropdown'
import { MobileHomeFeedNav } from '@/components/MobileHomeFeedNav'
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
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        <MobileHomeFeedNav />
        <div className="">
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
