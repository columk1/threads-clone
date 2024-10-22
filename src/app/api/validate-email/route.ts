import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { isEmailUnique } from '@/app/actions'

export const POST = async (req: NextRequest) => {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Invalid email provided' },
        { status: 400 },
      )
    }

    const isUnique = await isEmailUnique(email.trim())

    return NextResponse.json({ isUnique })
  } catch (error) {
    console.error('Error checking email uniqueness:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
