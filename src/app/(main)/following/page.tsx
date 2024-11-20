import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import { HeaderDropdown } from '@/components/HeaderDropdown'
import MainFeed from '@/components/MainFeed'
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
        <HeaderDropdown pathname="/following" />
      </Header>
      <MainFeed filter="following" />
    </>
  )
}

export default Dashboard
