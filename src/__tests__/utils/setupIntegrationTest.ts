import { afterAll, beforeAll, beforeEach } from 'vitest'

import * as schema from '@/lib/db/Schema'

import { setupTestDb, teardownTestDb, testDb } from './testDb'

export function setupIntegrationTest() {
  beforeAll(async () => {
    await setupTestDb()
  })

  beforeEach(async () => {
    // Clear all tables before each test in correct order to respect foreign key constraints
    await testDb.delete(schema.notificationSchema)
    await testDb.delete(schema.reportedPostSchema)
    await testDb.delete(schema.likeSchema)
    await testDb.delete(schema.repostSchema)
    await testDb.delete(schema.postSchema)
    await testDb.delete(schema.followerSchema)
    await testDb.delete(schema.userSchema)
  })

  afterAll(async () => {
    await teardownTestDb()
  })

  return { testDb }
}
