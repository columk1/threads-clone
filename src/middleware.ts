import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { validateRequest } from '@/lib/Session'

export async function middleware(request: NextRequest) {
  const { user } = await validateRequest()
  if (user) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/signup'],
  runtime: 'nodejs',
}
