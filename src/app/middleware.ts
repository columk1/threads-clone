import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'

export async function middleware(_request: NextRequest) {
  logger.info('middleware')
  const { user } = await validateRequest()
  if (user) {
    return NextResponse.redirect('/')
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/signup'],
}
