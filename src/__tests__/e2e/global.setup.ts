import { test as setup } from '@playwright/test'
import bcrypt from 'bcrypt'

import * as schema from '@/lib/db/Schema'
import { logger } from '@/lib/Logger'

import { createTestUser } from '../utils/factories'
import { setupTestDb, testDb } from '../utils/testDb'

// Initial database setup and table cleanup
setup('setup database', async () => {
  logger.info('Setting up test database...')

  await setupTestDb()

  // Clear tables
  logger.info('Clearing tables...')
  await testDb.delete(schema.postSchema)
  await testDb.delete(schema.followerSchema)
  await testDb.delete(schema.userSchema)
  logger.info('Tables cleared')

  // Seed test data
  logger.info('Creating test user...')
  const hashedPassword = await bcrypt.hash('password123', 10)
  const createdUser = await createTestUser({
    email: 'test@example.com',
    username: 'testuser',
    emailVerified: 1,
    password: hashedPassword,
  })
  logger.info('Created test user:', createdUser)
})

// Clean up after all tests
// setup('teardown database', async () => {
//   await teardownTestDb()
// })
