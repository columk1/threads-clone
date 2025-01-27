import { existsSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

import * as schema from '@/lib/db/Schema'
import { logger } from '@/lib/Logger'

const client = createClient({
  url: 'file:test.db',
})

export const testDb = drizzle(client, { schema })

export async function setupTestDb() {
  try {
    const migrationsPath = join(process.cwd(), 'migrations')
    logger.info(`Running migrations from: ${migrationsPath}`)

    await migrate(testDb, {
      migrationsFolder: migrationsPath,
    })
  } catch (error) {
    logger.error('Failed to setup test database:', error)
    throw error
  }
}

export async function teardownTestDb() {
  await client.close()
  if (existsSync('test.db')) {
    await unlink('test.db')
  }
}
