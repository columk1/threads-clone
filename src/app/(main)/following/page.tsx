import { redirect } from 'next/navigation'

import { ContentPane } from '@/components/ContentPane'
import Header from '@/components/Header'
import { HeaderDropdown } from '@/components/HeaderDropdown'
import MainFeed from '@/components/MainFeed'
import { validateRequest } from '@/lib/Lucia'

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
      <ContentPane>
        <MainFeed user={user} filter="following" />
      </ContentPane>
    </>
  )
}
