import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase } from '../../../../database/client'
import { notifications, orders, orderStatusHistory } from '../../../../database/schema'
import { assertOrderTransition } from '../../../../services/orders'
import { sendPushToUsers } from '../../../../services/push'
import { requireAdmin } from '../../../../utils/authorization'
import { parseId } from '../../../../utils/validation'

const schema = z.object({ toStatus: z.enum(['ACCEPTED', 'PREPARING', 'COMPLETED', 'REJECTED']), note: z.string().trim().max(300).default('') })
const messages = { ACCEPTED: '大厨接单啦，开始准备！', PREPARING: '锅已经热起来啦！', COMPLETED: '开饭！你的美味已完成。', REJECTED: '这次暂时做不了，看看大厨留言吧。' }

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'), '订单')
  const body = await readValidatedBody(event, value => schema.parse(value))
  const { db } = getDatabase()
  const order = (await db.select().from(orders).where(eq(orders.id, id)).limit(1))[0]
  if (!order) throw createError({ statusCode: 404, statusMessage: '订单不存在' })
  try { assertOrderTransition(order.status, body.toStatus, 'ADMIN') } catch (error: any) { throw createError({ statusCode: 409, statusMessage: error.message }) }
  db.transaction((tx) => {
    tx.update(orders).set({ status: body.toStatus, updatedAt: new Date() }).where(eq(orders.id, id)).run()
    tx.insert(orderStatusHistory).values({ orderId: id, fromStatus: order.status, toStatus: body.toStatus, operatorUserId: admin.id, note: body.note }).run()
    tx.insert(notifications).values({ userId: order.userId, type: 'ORDER', title: messages[body.toStatus], content: body.note || `订单 #${id} 状态有更新`, link: `/orders/${id}` }).run()
  })
  await sendPushToUsers([order.userId], { title: messages[body.toStatus], content: body.note || `订单 #${id} 状态有更新`, link: `/orders/${id}` }).catch(() => {})
  return { success: true }
})
