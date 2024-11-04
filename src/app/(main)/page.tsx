import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import { HeaderDropdown } from '@/components/HeaderDropdown'
import { MobileHomeFeedNav } from '@/components/MobileHomeFeedNav'
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
      <div className="flex min-h-screen w-full flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg md:p-5">
        <MobileHomeFeedNav />
        <div className="p-4">
          {`👋 `}
        </div>
      </div>
    </>
  )
}

export default Dashboard
