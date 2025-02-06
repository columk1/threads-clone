import { redirect } from 'next/navigation'

import Header from '@/components/Header'
import HydrateStore from '@/components/hydrateStore'
import Notification from '@/components/Notification'
import { validateRequest } from '@/lib/Lucia'
import { getNotifications } from '@/services/users/users.queries'

export const metadata = {
  title: 'Activity',
}

const Activity = async () => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }

  const data = await getNotifications()
  const replies =
    !('error' in data) && data.length > 0
      ? data.filter((e) => e.reply !== null).map((e) => ({ post: e.reply!, user: e.sourceUser }))
      : []

  return (
    <>
      <Header title="Activity" />
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        <div className="h-2" />
        {'error' in data || data.length === 0 ? (
          <div className="mx-auto my-[calc(50%+60px)] py-3 text-gray-8">No activity yet</div>
        ) : (
          <div role="list">
            <HydrateStore initialPosts={replies} />
            {data.map((e) => (
              <Notification key={e.notification.id} data={e} currentUser={user} />
            ))}
          </div>
        )}
        {/* <div className="mx-auto my-[calc(50%+60px)] py-3 text-gray-8">Under development</div> */}
      </div>
    </>
  )
}

export default Activity
