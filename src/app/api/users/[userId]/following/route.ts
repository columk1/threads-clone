import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getFollowStatus } from '@/lib/db/queries'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'

/*
 * Get user follow status
 */

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { user } = await validateRequest()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId } = await params
    const followStatus = await getFollowStatus(userId, user.id)
    return NextResponse.json(followStatus)
  } catch (err) {
    logger.error(err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

export type FollowingResponseData = ReturnType<typeof GET> extends Promise<NextResponse<infer T>> ? T : never
