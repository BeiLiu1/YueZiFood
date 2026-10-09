import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { describe, expect, it } from 'vitest'
import * as schema from '../../server/database/schema'
import { assertValidCategoryParent, toCategoryTree } from '../../server/services/categories'

describe('categories', () => {
  it('builds a two-level tree', () => {
    expect(toCategoryTree([
      { id: 1, parentId: null, name: '正餐' },
      { id: 2, parentId: 1, name: '下饭菜' }
    ])[0]?.children).toHaveLength(1)
  })

  it('rejects a third level', async () => {
    const sqlite = new Database(':memory:')
    sqlite.exec('CREATE TABLE categories (id INTEGER PRIMARY KEY, parent_id INTEGER)')
    sqlite.exec('INSERT INTO categories VALUES (1, NULL), (2, 1)')
    const db = drizzle(sqlite, { schema })
    await expect(assertValidCategoryParent(db, 2)).rejects.toThrow('最多只允许两级分类')
    sqlite.close()
  })
})
