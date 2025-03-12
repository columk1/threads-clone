import { NextResponse } from 'next/server'

import { logger } from '@/lib/Logger'
import { searchUsers } from '@/services/users/users.queries'
import type { InferNextResponse } from '@/utils/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ users: [] })
    }

    const users = await searchUsers(query)
    if ('error' in users) {
      throw new Error(users.error)
    }
    return NextResponse.json(users)
  } catch (error) {
    logger.error(error, 'Search failed')
    return NextResponse.json({ users: [] })
  }
}

export type SearchResponse = InferNextResponse<ReturnType<typeof GET>>
