import { type FunctionComponent, Suspense } from 'react'

import type { SessionUser } from '@/lib/Session'

import LoadingSplashOverlay from './LoadingSplashOverlay'
import { MobileHomeFeedFilter } from './MobileHomeFeedFilter'
import NewThread from './NewThread'
import Skeleton from './Skeleton'
import Threads from './Threads'

type Props = {
  user?: SessionUser | null
  filter?: string
}

const MainFeed: FunctionComponent<Props> = ({ user, filter }) => {
  return (
    <>
      {user ? (
        <>
          <MobileHomeFeedFilter />
          <NewThread />
        </>
      ) : (
        <LoadingSplashOverlay />
      )}
      <Suspense fallback={<Skeleton />}>
        <Threads filter={filter} />
      </Suspense>
    </>
  )
}

export default MainFeed
