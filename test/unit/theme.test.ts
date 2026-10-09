import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { afterEach, describe, expect, it } from 'vitest'
import { createDatabase } from '../../server/database/client'
import { getUiTheme, setUiTheme } from '../../server/services/theme'

const tempDirs: string[] = []
afterEach(() => { for (const path of tempDirs.splice(0)) rmSync(path, { recursive: true, force: true }) })

describe('global UI theme', () => {
  it('falls back to mint and persists a global selection', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'yuezi-theme-'))
    tempDirs.push(dir)
    const { db, sqlite } = createDatabase(join(dir, 'test.db'))
    migrate(db, { migrationsFolder: join(process.cwd(), 'server/database/migrations') })
    expect(await getUiTheme(db)).toBe('mint-bento')
    await setUiTheme(db, 'peach-kitchen')
    expect(await getUiTheme(db)).toBe('peach-kitchen')
    sqlite.close()
  })
})
