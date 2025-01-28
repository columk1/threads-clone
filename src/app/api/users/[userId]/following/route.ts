import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { DEFAULT_ERROR, NOT_AUTHORIZED_ERROR } from '@/lib/constants'
import { getFollowStatus } from '@/lib/db/queries'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'

/*
 * Get user follow status
 */

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { user } = await validateRequest()
  if (!user) {
    return NextResponse.json({ error: NOT_AUTHORIZED_ERROR }, { status: 401 })
  }

  try {
    const { userId } = await params
    const followStatus = await getFollowStatus(userId, user.id)
    return NextResponse.json(followStatus)
  } catch (err) {
    logger.error(err)
    return NextResponse.json({ error: DEFAULT_ERROR }, { status: 500 })
  }
}

export type FollowingResponseData = ReturnType<typeof GET> extends Promise<NextResponse<infer T>> ? T : never
