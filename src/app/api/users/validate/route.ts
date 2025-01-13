import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { isUniqueUserField } from '@/services/users/users.queries'

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const email = searchParams.get('email')
    const username = searchParams.get('username')

    if (email) {
      const isUnique = await isUniqueUserField('email', email.trim())
      return NextResponse.json({ isUnique })
    }
    if (username) {
      const isUnique = await isUniqueUserField('username', username.trim())
      return NextResponse.json({ isUnique })
    }
    return NextResponse.json({ error: 'Invalid field.' }, { status: 400 })
  } catch (error) {
    console.error('Error checking email uniqueness:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export type ValidateEmailResponse = {
  isUnique: boolean
  error?: string
}
