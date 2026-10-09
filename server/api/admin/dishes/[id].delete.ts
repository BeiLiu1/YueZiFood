import { eq } from 'drizzle-orm'
import { getDatabase } from '../../../database/client'
import { dishes } from '../../../database/schema'
import { requireAdmin } from '../../../utils/authorization'
import { parseId } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'), '菜品')
  const { db } = getDatabase()
  const dish = (await db.select({ id: dishes.id, status: dishes.status }).from(dishes).where(eq(dishes.id, id)).limit(1))[0]
  if (!dish) throw createError({ statusCode: 404, statusMessage: '菜品不存在' })
  if (dish.status === 'PUBLISHED') throw createError({ statusCode: 409, statusMessage: '请先将菜品下架并保存，再进行删除' })
  await db.delete(dishes).where(eq(dishes.id, id))
  return { success: true }
})
