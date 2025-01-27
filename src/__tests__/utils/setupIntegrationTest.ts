import { afterAll, beforeAll, beforeEach } from 'vitest'

import { db } from '@/lib/db/Drizzle'
import * as schema from '@/lib/db/Schema'

import { setupTestDb, teardownTestDb, testDb } from './testDb'

export function setupIntegrationTest() {
  beforeAll(async () => {
    await setupTestDb()
    // Override the production db with test db
    Object.assign(db, testDb)
  })

  beforeEach(async () => {
    // Clear all tables before each test
    await testDb.delete(schema.postSchema)
    await testDb.delete(schema.followerSchema)
    await testDb.delete(schema.userSchema)
  })

  afterAll(async () => {
    await teardownTestDb()
  })

  return { testDb }
}
