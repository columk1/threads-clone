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
  // user = undefined
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

      {/* Posts Here */}
      <Suspense fallback={<Skeleton />}>
        <Threads filter={filter} />
      </Suspense>
    </>
  )
}

export default MainFeed
