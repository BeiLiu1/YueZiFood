import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase } from '../../../database/client'
import { orderRatings, orders } from '../../../database/schema'
import { requireUser } from '../../../utils/authorization'
import { parseId } from '../../../utils/validation'

const schema = z.object({ rating: z.enum(['GOOD', 'NEUTRAL', 'BAD']) })

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = parseId(getRouterParam(event, 'id'), '订单')
  const body = schema.safeParse(await readBody(event))
  if (!body.success) throw createError({ statusCode: 400, statusMessage: '请选择好评、中评或差评' })
  const { db } = getDatabase()
  const order = (await db.select({ userId: orders.userId, status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1))[0]
  if (!order || order.userId !== user.id) throw createError({ statusCode: 404, statusMessage: '订单不存在' })
  if (order.status !== 'COMPLETED') throw createError({ statusCode: 409, statusMessage: '订单完成后才能评价哦' })
  const now = new Date()
  db.insert(orderRatings).values({ orderId: id, userId: user.id, rating: body.data.rating, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: orderRatings.orderId, set: { rating: body.data.rating, updatedAt: now } }).run()
  return { rating: body.data.rating }
})
