import { redirect } from 'next/navigation'

import { ContentPane } from '@/components/ContentPane'
import Header from '@/components/Header'
import HydrateStore from '@/components/HydrateStore'
import Notification from '@/components/Notification'
import { validateRequest } from '@/lib/Lucia'
import { getNotifications, markNotificationsAsSeen } from '@/services/users/users.queries'

export const metadata = {
  title: 'Activity',
}

const Activity = async () => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }

  const data = await getNotifications()
  await markNotificationsAsSeen()
  const replies =
    !('error' in data) && data.length > 0
      ? data.filter((e) => e.reply !== null).map((e) => ({ post: e.reply!, user: e.sourceUser }))
      : []

  return (
    <>
      <Header title="Activity" />
      <ContentPane>
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
      </ContentPane>
    </>
  )
}
export default Activity
