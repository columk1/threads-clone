import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle'
import { Lucia, type Session, TimeSpan, type User } from 'lucia'
import { cookies } from 'next/headers'
import React from 'react'

import { db } from '@/libs/DB'
import { sessionTable, userTable } from '@/models/Schema'

const IS_DEV = process.env.NODE_ENV === 'development' ? 'DEV' : 'PROD'

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: 'user_session',
    expires: false,
    attributes: {
      secure: !IS_DEV,
    },
  },
  sessionExpiresIn: new TimeSpan(1, 'h'), // 1 hour
  // Expose user attributes to the session cookie
  getUserAttributes: (attributes) => {
    return {
      emailVerified: attributes.emailVerified,
      email: attributes.email,
    }
  },
})

const uncachedValidateRequest = async (): Promise<
  { user: User, session: Session } | { user: null, session: null }
> => {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null
  if (!sessionId) {
    return {
      user: null,
      session: null,
    }
  }

  const result = await lucia.validateSession(sessionId)
  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id)
      const cookieStore = await cookies()
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      const cookieStore = await cookies()
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }
  } catch {}
  return result
}

export const validateRequest = React.cache(uncachedValidateRequest)

declare module 'lucia' {
  // Extend Register type to include user fields
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: {
      email: string
      emailVerified: number
    }
  }
}
