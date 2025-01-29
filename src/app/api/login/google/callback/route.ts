import type { OAuth2Tokens } from 'arctic'
import { decodeIdToken } from 'arctic'
import { cookies } from 'next/headers'

import { logger } from '@/lib/Logger'
import { lucia } from '@/lib/Lucia'
import { google } from '@/lib/oauth'
import type { GoogleClaims } from '@/lib/schemas/zod.schema'
import { googleClaimsSchema } from '@/lib/schemas/zod.schema'
import { getUserByGoogleId } from '@/repositories/auth.repository'
import { createGoogleUser, getUserByUsername } from '@/repositories/users.repository'

function isGoogleClaims(claims: unknown): claims is GoogleClaims {
  return googleClaimsSchema.safeParse(claims).success
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieStore = await cookies()
  const storedState = cookieStore.get('google_oauth_state')?.value ?? null
  const codeVerifier = cookieStore.get('google_code_verifier')?.value ?? null

  if (code === null || state === null || storedState === null || codeVerifier === null) {
    return new Response(null, {
      status: 400,
    })
  }

  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    })
  }

  let tokens: OAuth2Tokens
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier)
  } catch (err) {
    logger.error(err, 'Failed to validate Google authorization code')
    return new Response(null, {
      status: 400,
    })
  }

  const claims = decodeIdToken(tokens.idToken())

  if (!isGoogleClaims(claims)) {
    logger.error('Invalid Google claims format')
    return new Response(null, {
      status: 400,
    })
  }

  const googleUserId = claims.sub
  const name = `${claims.given_name} ${claims.family_name}`.trim()
  const email = claims.email
  const avatar = claims.picture

  try {
    // Check if user exists
    const existingUser = await getUserByGoogleId(googleUserId)

    if (existingUser?.id) {
      // Create session with Lucia
      const session = await lucia.createSession(existingUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
        },
      })
    }

    // Create new user
    const usernamePart = email.split('@')[0]
    if (!usernamePart) {
      throw new Error('Failed to create username')
    }

    // Generate base username
    let username = usernamePart.toLowerCase()

    // Check if username exists and append random number if it does
    const existingUsername = await getUserByUsername(username)
    if (existingUsername) {
      const randomSuffix = Math.floor(Math.random() * 10000)
      username = `${username}${randomSuffix}`
    }

    const user = await createGoogleUser({
      googleId: googleUserId,
      email,
      name,
      username,
      emailVerified: 1, // Google accounts are already verified
      avatar, // Add the Google profile picture as avatar
    })

    if (!user?.id) {
      throw new Error('Failed to create user')
    }

    // Create session with Lucia
    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
      },
    })
  } catch (err) {
    logger.error(err, 'Failed to handle Google authentication')
    return new Response(null, {
      status: 500,
    })
  }
}
