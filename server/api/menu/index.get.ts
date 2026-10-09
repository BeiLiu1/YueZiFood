import { and, asc, eq, inArray, like, or } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase } from '../../database/client'
import { categories, dishCategories, dishes } from '../../database/schema'
import { getCategoryMap } from '../../services/dishes'
import { requireUser } from '../../utils/authorization'

const querySchema = z.object({ categoryId: z.coerce.number().int().positive().optional(), q: z.string().trim().max(48).optional() })

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = querySchema.parse(getQuery(event))
  const { db } = getDatabase()
  let allowedDishIds: number[] | undefined
  if (query.categoryId) {
    const selected = await db.select({ id: categories.id, parentId: categories.parentId }).from(categories).where(eq(categories.id, query.categoryId)).limit(1)
    if (!selected[0]) throw createError({ statusCode: 400, statusMessage: '分类不存在' })
    let categoryIds = [query.categoryId]
    if (!selected[0].parentId) {
      const children = await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, query.categoryId))
      categoryIds = [...categoryIds, ...children.map(item => item.id)]
    }
    allowedDishIds = (await db.select({ id: dishCategories.dishId }).from(dishCategories).where(inArray(dishCategories.categoryId, categoryIds))).map(item => item.id)
    if (!allowedDishIds.length) return { categories: await db.select().from(categories).where(eq(categories.status, 'ACTIVE')).orderBy(asc(categories.sortOrder)), dishes: [] }
  }
  const filters = [eq(dishes.status, 'PUBLISHED')]
  if (query.q) filters.push(or(like(dishes.name, `%${query.q}%`), like(dishes.description, `%${query.q}%`))!)
  if (allowedDishIds) filters.push(inArray(dishes.id, allowedDishIds))
  const dishRows = await db.select().from(dishes).where(and(...filters)).orderBy(asc(dishes.name))
  const categoryMap = await getCategoryMap(db, dishRows.map(row => row.id))
  return {
    categories: await db.select().from(categories).where(eq(categories.status, 'ACTIVE')).orderBy(asc(categories.sortOrder), asc(categories.id)),
    dishes: dishRows.map(row => ({ ...row, categories: categoryMap.get(row.id) || [] }))
  }
})
