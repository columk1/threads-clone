import type { User } from 'lucia'
import { type FunctionComponent, Suspense } from 'react'

import LoadingSplashOverlay from './LoadingSplashOverlay'
import { MobileHomeFeedFilter } from './MobileHomeFeedFilter'
import NewThread from './NewThread'
import Skeleton from './Skeleton'
import Threads from './Threads'

type Props = {
  user?: User | null
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
