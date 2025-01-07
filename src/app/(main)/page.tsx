import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import { HeaderDropdown } from '@/components/HeaderDropdown'
import MainFeed from '@/components/MainFeed'
import { validateRequest } from '@/libs/Lucia'

export const metadata = {
  title: 'Home',
}

export default async function Home() {
  const { user } = await validateRequest()
  // const verified = user && user.emailVerified
  if (user && !user?.emailVerified) {
    return redirect('/verify-email')
  }

  return (
    <>
      <Header title={`${user ? 'For you' : 'Home'}`}>{user && <HeaderDropdown pathname="/" />}</Header>
      <MainFeed user={user} />
    </>
  )
}
