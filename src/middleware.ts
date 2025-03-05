import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  /*
   * CSRF protection
   */
  if (request.method === 'GET') {
    return NextResponse.next()
  }
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
  matcher: '/api/:path*',
}
