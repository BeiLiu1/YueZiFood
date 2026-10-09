import { eq } from 'drizzle-orm'
import { getDatabase } from '../../../database/client'
import { orders, orderStatusHistory } from '../../../database/schema'
import { getAdminUserIds, notifyUsers } from '../../../services/notifications'
import { assertOrderTransition } from '../../../services/orders'
import { requireUser } from '../../../utils/authorization'
import { parseId } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = parseId(getRouterParam(event, 'id'), '订单')
  const { db } = getDatabase()
  const order = (await db.select().from(orders).where(eq(orders.id, id)).limit(1))[0]
  if (!order || order.userId !== user.id) throw createError({ statusCode: 404, statusMessage: '订单不存在' })
  try { assertOrderTransition(order.status, 'CANCELLED', 'USER') } catch (error: any) { throw createError({ statusCode: 409, statusMessage: error.message }) }
  db.transaction((tx) => {
    tx.update(orders).set({ status: 'CANCELLED', updatedAt: new Date() }).where(eq(orders.id, id)).run()
    tx.insert(orderStatusHistory).values({ orderId: id, fromStatus: order.status, toStatus: 'CANCELLED', operatorUserId: user.id, note: '用户取消' }).run()
    notifyUsers(tx as any, getAdminUserIds(tx as any), { type: 'ORDER', title: '点单取消啦', content: `${user.displayName} 取消了订单 #${id}`, link: `/admin/orders/${id}` })
  })
  return { success: true }
})
