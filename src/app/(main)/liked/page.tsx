import { redirect } from 'next/navigation'

import { ContentPane } from '@/components/ContentPane'
import Header from '@/components/Header'
import { HeaderDropdown } from '@/components/HeaderDropdown'
import MainFeed from '@/components/MainFeed'
import { validateRequest } from '@/lib/Session'

export default async function Following() {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/')
  }

  return (
    <>
      <Header title="Liked">
        <HeaderDropdown pathname="/liked" />
      </Header>
      <ContentPane>
        <MainFeed user={user} filter="liked" />
      </ContentPane>
    </>
  )
}
