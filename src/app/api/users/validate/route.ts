import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { logger } from '@/lib/Logger'
import { isUniqueUserField } from '@/services/users/users.queries'
import type { InferNextResponse } from '@/utils/types'

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const email = searchParams.get('email')
    const username = searchParams.get('username')

    if (email) {
      const isUnique = await isUniqueUserField('email', email.trim().toLowerCase())
      return NextResponse.json({ isUnique })
    }
    if (username) {
      const isUnique = await isUniqueUserField('username', username.trim().toLowerCase())
      return NextResponse.json({ isUnique })
    }
    return NextResponse.json({ error: 'Invalid field.' }, { status: 400 })
  } catch (error) {
    logger.error('Error checking email uniqueness:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export type ValidateUserFieldResponse = InferNextResponse<ReturnType<typeof GET>>
