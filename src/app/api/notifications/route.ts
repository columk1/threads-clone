import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { NOT_AUTHORIZED_ERROR, SERVER_ERROR } from '@/lib/constants'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Session'
import { getNotifications, getUnseenNotificationsCount } from '@/repositories/users.repository'

/**
 * GET /api/notifications
 * Get notifications or notification count for the current user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: NOT_AUTHORIZED_ERROR }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const countOnly = searchParams.get('count') === 'true'
    const unseenOnly = searchParams.get('unseen') === 'true'

    if (countOnly) {
      // If count=true, return just the count
      if (unseenOnly) {
        const count = await getUnseenNotificationsCount(user.id)
        return NextResponse.json({ count })
      }
      const notifications = await getNotifications(user.id)
      return NextResponse.json({ count: notifications.length })
    }

    // Otherwise return the full notifications
    const notifications = await getNotifications(user.id, { seen: unseenOnly ? false : undefined })
    return NextResponse.json({ notifications })
  } catch (error) {
    logger.error('Error fetching notifications:', error)
    return NextResponse.json({ error: SERVER_ERROR }, { status: 500 })
  }
}
