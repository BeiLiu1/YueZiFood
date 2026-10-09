import { asc } from 'drizzle-orm'
import { getDatabase } from '../../../database/client'
import { ingredients } from '../../../database/schema'
import { requireAdmin } from '../../../utils/authorization'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { db } = getDatabase()
  return { ingredients: await db.select().from(ingredients).orderBy(asc(ingredients.name)) }
})
