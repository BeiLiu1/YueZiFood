import { asc } from 'drizzle-orm'
import { getDatabase } from '../../../database/client'
import { categories } from '../../../database/schema'
import { toCategoryTree } from '../../../services/categories'
import { requireAdmin } from '../../../utils/authorization'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { db } = getDatabase()
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.id))
  return { categories: toCategoryTree(rows) }
})
