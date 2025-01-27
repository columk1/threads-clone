import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import { HeaderDropdown } from '@/components/HeaderDropdown'
import MainFeed from '@/components/MainFeed'
import { ROUTES } from '@/lib/constants'
import { validateRequest } from '@/lib/Lucia'

export const metadata = {
  title: 'Home',
}

export default async function Home() {
  const { user } = await validateRequest()
  // const verified = user && user.emailVerified
  if (user && !user?.emailVerified) {
    return redirect(ROUTES.VERIFY_EMAIL)
  }

  return (
    <>
      <Header title={`${user ? 'For you' : 'Home'}`}>{user && <HeaderDropdown pathname="/" />}</Header>
      <MainFeed user={user} />
    </>
  )
}
