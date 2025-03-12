import { CookiesProvider } from 'next-client-cookies/server'

import { ContentPane } from '@/components/ContentPane'
import { CookieToast } from '@/components/CookieToast'
import Header from '@/components/Header'
import { HeaderDropdown } from '@/components/HeaderDropdown'
import MainFeed from '@/components/MainFeed'
import { VERIFIED_EMAIL_ALERT } from '@/lib/constants'
import { validateRequest } from '@/lib/Session'

export const metadata = {
  title: 'Home',
}

export default async function Home() {
  const { user } = await validateRequest()

  return (
    <>
      <Header title={`${user ? 'For you' : 'Home'}`}>{user && <HeaderDropdown pathname="/" />}</Header>
      <ContentPane>
        <MainFeed user={user} />
      </ContentPane>
      <CookiesProvider>
        <CookieToast cookieName={VERIFIED_EMAIL_ALERT} message="Email verified" />
      </CookiesProvider>
    </>
  )
}
