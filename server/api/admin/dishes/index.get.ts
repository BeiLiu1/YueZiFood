import { desc } from 'drizzle-orm'
import { getDatabase } from '../../../database/client'
import { dishes } from '../../../database/schema'
import { getCategoryMap } from '../../../services/dishes'
import { requireAdmin } from '../../../utils/authorization'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { db } = getDatabase()
  const rows = await db.select().from(dishes).orderBy(desc(dishes.updatedAt))
  const categoryMap = await getCategoryMap(db, rows.map(row => row.id))
  return { dishes: rows.map(row => ({ ...row, categories: categoryMap.get(row.id) || [] })) }
})
