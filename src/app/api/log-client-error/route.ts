import { NextResponse } from 'next/server'

import { logger } from '@/lib/Logger'

export async function POST(request: Request) {
  try {
    const error = await request.json()
    logger.error(error, 'Client-side error')
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error(err, 'Failed to log client error')
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
