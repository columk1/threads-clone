import { decodeIdToken, type OAuth2Tokens } from 'arctic'
import { cookies } from 'next/headers'

import { logger } from '@/lib/Logger'
import { google } from '@/lib/oauth'
import type { GoogleClaims } from '@/lib/schemas/zod.schema'
import { googleClaimsSchema } from '@/lib/schemas/zod.schema'
import { createSession, generateSessionToken, setSessionTokenCookie } from '@/lib/Session'
import { getUserByEmail, getUserByGoogleId } from '@/repositories/auth.repository'
import { createGoogleUser, getUserByUsername, updateUserWithGoogleCredentials } from '@/repositories/users.repository'

function isGoogleClaims(claims: unknown): claims is GoogleClaims {
  return googleClaimsSchema.safeParse(claims).success
}

export async function GET(request: Request): Promise<Response> {
  try {
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
      throw new Error('Invalid Google claims format')
    }

    const googleUserId = claims.sub
    const name = `${claims.given_name} ${claims.family_name}`.trim()
    const email = claims.email
    const avatar = claims.picture

    // First check if user exists by Google ID
    const existingGoogleUser = await getUserByGoogleId(googleUserId)

    if (existingGoogleUser?.id) {
      // User already exists with this Google account
      const token = generateSessionToken()
      const session = await createSession(token, existingGoogleUser.id)
      setSessionTokenCookie(token, session.expiresAt)

      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
        },
      })
    }

    // Check if user exists by email
    const existingEmailUser = await getUserByEmail(email)

    if (existingEmailUser) {
      // Link Google account to existing email account
      const updatedUser = await updateUserWithGoogleCredentials({
        id: existingEmailUser.id,
        googleId: googleUserId,
        avatar: existingEmailUser.avatar ?? avatar,
        emailVerified: 1,
      })

      if (!updatedUser) {
        throw new Error('Failed to update user with Google credentials')
      }

      // Create session
      const token = generateSessionToken()
      const session = await createSession(token, updatedUser.id)
      setSessionTokenCookie(token, session.expiresAt)

      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
        },
      })
    }

    // Create new user if no existing account found
    const usernamePart = email.split('@')[0]
    if (!usernamePart) {
      return new Response(null, {
        status: 400,
        statusText: 'Invalid email format',
      })
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

    if (!user) {
      throw new Error('Failed to create user')
    }

    // Create session
    const token = generateSessionToken()
    const session = await createSession(token, user.id)
    setSessionTokenCookie(token, session.expiresAt)

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
