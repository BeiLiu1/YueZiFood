import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase } from '../../../../database/client'
import { orderIngredientChecks } from '../../../../database/schema'
import { getOrderDetail } from '../../../../services/order-detail'
import { requireAdmin } from '../../../../utils/authorization'
import { parseId } from '../../../../utils/validation'

const schema = z.object({ name: z.string().trim().min(1).max(80), unit: z.string().trim().min(1).max(12), checked: z.boolean() })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'), '订单')
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: '食材勾选信息不完整' })
  const detail = await getOrderDetail(getDatabase().db, id)
  if (!detail) throw createError({ statusCode: 404, statusMessage: '订单不存在' })
  if (!detail.ingredients.some(item => item.name === parsed.data.name && item.unit === parsed.data.unit)) throw createError({ statusCode: 400, statusMessage: '这项食材不在当前订单里' })
  const { db } = getDatabase()
  const now = new Date()
  db.insert(orderIngredientChecks).values({ orderId: id, ...parsed.data, updatedAt: now })
    .onConflictDoUpdate({ target: [orderIngredientChecks.orderId, orderIngredientChecks.name, orderIngredientChecks.unit], set: { checked: parsed.data.checked, updatedAt: now } }).run()
  return { ok: true }
})
