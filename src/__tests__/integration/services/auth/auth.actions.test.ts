import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { createTestUser } from '@/__tests__/utils/factories'
import { setupIntegrationTest } from '@/__tests__/utils/setupIntegrationTest'
import { testDb } from '@/__tests__/utils/testDb'
import { ROUTES, VERIFIED_EMAIL_ALERT } from '@/lib/constants'
import { emailVerificationCodeSchema, sessionSchema } from '@/lib/db/Schema'
import { createSessionAndSetCookie } from '@/lib/Session'
import { login, logout, resendVerificationEmail, signup } from '@/services/auth/auth.actions'

setupIntegrationTest()

// Mock external dependencies
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
} as { get: Mock; set: Mock; delete: Mock }

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookieStore),
}))

vi.mock('@/lib/Logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('Auth Actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Clear any existing sessions
    await testDb.delete(sessionSchema)
  })

  describe('login', () => {
    it('should successfully log in a user with verified email', async () => {
      const password = 'password123'
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await createTestUser({
        email: 'test@example.com',
        password: hashedPassword,
        emailVerified: 1,
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', password)

      await login(null, formData)

      // Verify session was created in DB
      const session = await testDb.query.sessionSchema.findFirst({
        where: (sessions, { eq }) => eq(sessions.userId, user.id),
      })

      expect(session).toBeDefined()
      expect(session!.userId).toBe(user.id)

      // Verify session cookie was set
      expect((await cookies()).set).toHaveBeenCalled()

      // Verify redirect to home
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('should redirect unverified users to verify email page', async () => {
      const password = 'password123'
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await createTestUser({
        email: 'test@example.com',
        password: hashedPassword,
        emailVerified: 0,
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', password)

      await login(null, formData)

      // Verify session was created in DB
      const session = await testDb.query.sessionSchema.findFirst({
        where: (sessions, { eq }) => eq(sessions.userId, user.id),
      })

      expect(session).toBeDefined()

      // Verify redirect to verify email page
      expect(redirect).toHaveBeenCalledWith(ROUTES.VERIFY_EMAIL)
    })

    it('should handle invalid credentials', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'wrongpassword')

      const result = await login(null, formData)

      expect(result).toMatchObject({
        status: 'error',
        error: {
          password: ['Incorrect password.'],
        },
      })

      // Verify no session was created
      const sessions = await testDb.query.sessionSchema.findMany()

      expect(sessions.length).toBe(0)

      expect(redirect).not.toHaveBeenCalled()
    })

    it('should handle incorrect password for existing user', async () => {
      // Create a user with known password
      const correctPassword = 'correctpassword123'
      const hashedPassword = await bcrypt.hash(correctPassword, 10)
      await createTestUser({
        email: 'test@example.com',
        password: hashedPassword,
      })

      // Try to login with wrong password
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'wrongpassword123')

      const result = await login(null, formData)

      expect(result).toMatchObject({
        status: 'error',
        error: {
          password: [expect.any(String)],
        },
      })

      // Verify no session was created
      const sessions = await testDb.query.sessionSchema.findMany()

      expect(sessions.length).toBe(0)
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should handle invalid email format', async () => {
      const formData = new FormData()
      formData.append('email', 'not-an-email')
      formData.append('password', 'password123')

      const result = await login(null, formData)

      expect(result.error).toBeDefined()

      // Verify no session was created
      const sessions = await testDb.query.sessionSchema.findMany()

      expect(sessions.length).toBe(0)

      expect(redirect).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      // Create a user and session
      const user = await createTestUser()
      const { session, token } = await createSessionAndSetCookie(user.id)
      mockCookieStore.get.mockReturnValue({ value: token })

      await logout()

      // Verify session was invalidated in DB
      const dbSession = await testDb.query.sessionSchema.findFirst({
        where: (sessions, { eq }) => eq(sessions.id, session.id),
      })

      expect(dbSession).toBeUndefined()

      // Verify blank session cookie was set
      expect((await cookies()).set).toHaveBeenCalledWith(
        'session',
        '',
        expect.objectContaining({
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        }),
      )

      // Verify email verification alert cookie was deleted
      expect((await cookies()).delete).toHaveBeenCalledWith(VERIFIED_EMAIL_ALERT)

      // Verify redirect to login
      expect(redirect).toHaveBeenCalledWith(ROUTES.LOGIN)
    })

    it('should handle unauthorized logout attempt', async () => {
      mockCookieStore.get.mockReturnValue(null)

      const result = await logout()

      expect(result).toEqual({ error: 'Unauthorized' })
      expect((await cookies()).set).not.toHaveBeenCalled()
      expect(redirect).not.toHaveBeenCalled()
    })
  })

  describe('signup', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should successfully create a new user', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('name', 'Test User')
      formData.append('username', 'testuser')

      await signup(null, formData)

      // Verify user was created in DB
      const user = await testDb.query.userSchema.findFirst({
        where: (users, { eq }) => eq(users.email, 'test@example.com'),
      })

      expect(user).toBeDefined()
      expect(user!.name).toBe('Test User')
      expect(user!.username).toBe('testuser')
      expect(user!.emailVerified).toBe(0)

      // Verify session was created in DB
      const session = await testDb.query.sessionSchema.findFirst({
        where: (sessions, { eq }) => eq(sessions.userId, user!.id),
      })

      expect(session).toBeDefined()
      expect(session!.userId).toBe(user!.id)

      // Verify cookies were set
      expect((await cookies()).set).toHaveBeenCalledWith(
        VERIFIED_EMAIL_ALERT,
        'true',
        expect.objectContaining({
          expires: expect.any(Date),
        }),
      )

      // Verify redirect
      expect(redirect).toHaveBeenCalledWith(ROUTES.VERIFY_EMAIL)
    })

    it('should handle validation errors', async () => {
      const formData = new FormData()
      formData.append('email', 'not-an-email')
      formData.append('password', '123') // Too short
      formData.append('name', '') // Required
      formData.append('username', 'test@invalid') // Invalid characters

      const result = await signup(null, formData)

      expect(result.error).toBeDefined()

      // Verify no session was created
      const sessions = await testDb.query.sessionSchema.findMany()

      expect(sessions.length).toBe(0)

      expect(redirect).not.toHaveBeenCalled()
    })

    it('should handle duplicate email', async () => {
      // First create a user
      await createTestUser({
        email: 'test@example.com',
        username: 'existinguser',
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('name', 'Test User')
      formData.append('username', 'testuser')

      const result = await signup(null, formData)

      expect(result).toMatchObject({
        status: 'error',
        error: {
          email: [expect.any(String)],
        },
      })

      // Verify no session was created
      const sessions = await testDb.query.sessionSchema.findMany()

      expect(sessions.length).toBe(0)

      expect(redirect).not.toHaveBeenCalled()
    })
  })

  describe('resendVerificationEmail', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should successfully resend verification email', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
        emailVerified: 0,
      })

      const { token } = await createSessionAndSetCookie(testUser.id)
      mockCookieStore.get.mockReturnValue({ value: token })

      const result = await resendVerificationEmail()

      expect(result).toEqual({ success: true })

      // Verify verification code was created in DB
      const verificationCode = await testDb.query.emailVerificationCodeSchema.findFirst({
        where: (codes, { eq }) => eq(codes.userId, testUser.id),
      })

      expect(verificationCode).toBeDefined()
      expect(verificationCode!.userId).toBe(testUser.id)
    })

    it('should handle rate limiting', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
        emailVerified: 0,
      })

      // Create a recent verification code
      await testDb.insert(emailVerificationCodeSchema).values({
        userId: testUser.id,
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      })

      const { token } = await createSessionAndSetCookie(testUser.id)
      mockCookieStore.get.mockReturnValue({ value: token })

      const result = await resendVerificationEmail()

      expect(result.error).toMatch(/^Please wait \d+m \d+s before resending$/)
    })

    it('should redirect if user is not authenticated', async () => {
      mockCookieStore.get.mockReturnValue(null)

      await resendVerificationEmail()

      expect(redirect).toHaveBeenCalledWith(ROUTES.LOGIN)
    })
  })
})
