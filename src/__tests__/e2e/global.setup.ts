import { test as setup } from '@playwright/test'
import bcrypt from 'bcrypt'

import * as schema from '@/lib/db/Schema'
import { logger } from '@/lib/Logger'

import { createTestUser } from '../utils/factories'
import { TEST_USERS } from '../utils/testConstants'
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

  // Create test users
  logger.info('Creating test users...')
  const hashedPassword = await bcrypt.hash(TEST_USERS[0].password, 10)

  // Create all test users
  for (const [index, user] of TEST_USERS.entries()) {
    const createdUser = await createTestUser({
      ...user,
      password: hashedPassword,
    })
    logger.info(`Created test user ${index + 1}:`, createdUser)
  }
})
