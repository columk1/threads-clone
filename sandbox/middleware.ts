import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import type { NextFetchEvent, NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Run Clerk middleware only when necessary
  return clerkMiddleware((auth) => {
    if (!isPublicRoute(request)) {
      const signInUrl = new URL('/sign-in', request.url)

      auth().protect({
        // `unauthenticatedUrl` is needed to avoid error: "Unable to find `next-intl` locale because the middleware didn't run on this request"
        unauthenticatedUrl: signInUrl.toString(),
      })
    }
  })(request, event)
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'], // Also exclude tunnelRoute used in Sentry from the matcher
}


// import { type NextRequest, NextResponse } from 'next/server'

// import { validateRequest } from './libs/Lucia'

// export async function middleware(request: NextRequest) {
//   const { user } = await validateRequest()
//   const validUser = user && user.emailVerified
//   if (!validUser) {
//     return NextResponse.redirect(new URL('/login', request.url))
//   }
//   return NextResponse.next()
// }

// export const config = {
//   matcher: '/',
// }
