import { eq, or } from 'drizzle-orm'
import { getDatabase } from '../../../database/client'
import { categories, dishCategories } from '../../../database/schema'
import { requireAdmin } from '../../../utils/authorization'
import { parseId } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'), '分类')
  const { db } = getDatabase()
  const used = await db.select({ id: dishCategories.categoryId }).from(dishCategories).where(eq(dishCategories.categoryId, id)).limit(1)
  const child = await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, id)).limit(1)
  if (used[0] || child[0]) throw createError({ statusCode: 409, statusMessage: '分类仍有子分类或菜品，暂时不能删除' })
  await db.delete(categories).where(or(eq(categories.id, id), eq(categories.parentId, id)))
  return { success: true }
})
