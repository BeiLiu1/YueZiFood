import { desc, eq } from 'drizzle-orm'
import { getDatabase } from '../../database/client'
import { orderItems, orders } from '../../database/schema'
import { requireUser } from '../../utils/authorization'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { db } = getDatabase()
  const rows = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt))
  return { orders: await Promise.all(rows.map(async order => ({ ...order, items: await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)) }))) }
})
