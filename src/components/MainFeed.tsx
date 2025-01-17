import type { User } from 'lucia'
import { type FunctionComponent, Suspense } from 'react'

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
      {user && <MobileHomeFeedFilter />}

      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        <div className="">
          {user && <NewThread />}

          {/* Posts Here */}
          <Suspense fallback={<Skeleton />}>
            <Threads filter={filter} />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default MainFeed
