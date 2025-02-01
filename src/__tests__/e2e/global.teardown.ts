import { test as teardown } from '@playwright/test'

import { teardownTestDb } from '../utils/testDb'

// Clean up after all tests
teardown('delete database', async () => {
  await teardownTestDb()
})
