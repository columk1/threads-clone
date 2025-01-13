import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { isUniqueUserField } from '@/services/users/users.queries'

export const POST = async (req: NextRequest) => {
  try {
    const { username } = await req.json()

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Invalid field.' }, { status: 400 })
    }

    const isUnique = await isUniqueUserField('username', username.trim())

    return NextResponse.json({ isUnique })
  } catch (error) {
    console.error('Error checking username uniqueness:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
