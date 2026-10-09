import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { afterEach, describe, expect, it } from 'vitest'
import { createDatabase } from '../../server/database/client'
import { roles, users } from '../../server/database/schema'
import { ensureBootstrapData } from '../../server/services/bootstrap'

const tempDirs: string[] = []

afterEach(() => {
  for (const path of tempDirs.splice(0)) rmSync(path, { recursive: true, force: true })
})

describe('database bootstrap', () => {
  it('creates two roles and one administrator without duplicates', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'yuezi-menu-'))
    tempDirs.push(dir)
    const { db, sqlite } = createDatabase(join(dir, 'test.db'))
    migrate(db, { migrationsFolder: join(process.cwd(), 'server/database/migrations') })

    const hash = async (value: string) => `hashed:${value}`
    const options = {
      adminUsername: 'chef',
      adminPassword: 'test-password',
      adminDisplayName: '本大厨',
      hashPassword: hash
    }

    expect((await ensureBootstrapData(db, options)).created).toBe(true)
    expect((await ensureBootstrapData(db, options)).created).toBe(false)
    expect(await db.select().from(roles)).toHaveLength(2)
    const adminUsers = await db.select().from(users)
    expect(adminUsers).toHaveLength(1)
    expect(adminUsers[0]?.passwordHash).toBe('hashed:test-password')

    sqlite.close()
  })

  it('requires an initial password before creating the administrator', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'yuezi-menu-'))
    tempDirs.push(dir)
    const { db, sqlite } = createDatabase(join(dir, 'test.db'))
    migrate(db, { migrationsFolder: join(process.cwd(), 'server/database/migrations') })

    await expect(ensureBootstrapData(db, {
      adminUsername: 'chef',
      adminPassword: '',
      adminDisplayName: '本大厨',
      hashPassword: async value => value
    })).rejects.toThrow('BOOTSTRAP_ADMIN_PASSWORD')

    sqlite.close()
  })
})
