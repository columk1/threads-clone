import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import { HeaderDropdown } from '@/components/HeaderDropdown'
import MainFeed from '@/components/MainFeed'
import { validateRequest } from '@/libs/Lucia'

export default async function Following() {
  const { user } = await validateRequest()
  const userExists = user && user.emailVerified
  if (!userExists) {
    return redirect('/')
  }

  return (
    <>
      <Header title="Following">
        <HeaderDropdown pathname="/following" />
      </Header>
      <MainFeed user={user} filter="following" />
    </>
  )
}
