import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { validateRequest } from '@/lib/Session'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  /*
   * Redirect authenticated users away from login and signup pages
   */
  if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) {
    const { user } = await validateRequest()
    if (user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  /*
   * Extend session cookie expiration on GET requests. Only GET to avoid overriding cookies set by server actions
   */
  if (request.method === 'GET') {
    const response = NextResponse.next()
    const token = request.cookies.get('session')?.value ?? null
    if (token !== null) {
      // Only extend cookie expiration on GET requests since we can be sure
      // a new session wasn't set when handling the request.
      response.cookies.set('session', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
    }
    return response
  }

  /*
   * CSRF protection
   */
  const originHeader = request.headers.get('Origin')
  // `X-Forwarded-Host` instead of 'Host' for deployments behind reverse proxy
  const hostHeader = request.headers.get('X-Forwarded-Host') || request.headers.get('Host')
  if (originHeader === null || hostHeader === null) {
    return new NextResponse(null, {
      status: 403,
    })
  }
  let origin: URL
  try {
    origin = new URL(originHeader)
  } catch {
    return new NextResponse(null, {
      status: 403,
    })
  }
  if (origin.host !== hostHeader) {
    return new NextResponse(null, {
      status: 403,
    })
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
  runtime: 'nodejs',
}
