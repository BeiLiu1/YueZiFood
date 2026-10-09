import { desc, eq } from 'drizzle-orm'
import { getDatabase } from '../../../database/client'
import { orderItems, orders, users } from '../../../database/schema'
import { requireAdmin } from '../../../utils/authorization'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { db } = getDatabase()
  const rows = await db.select({ id: orders.id, userId: orders.userId, userName: users.displayName, scheduledDate: orders.scheduledDate, mealSlot: orders.mealSlot, note: orders.note, status: orders.status, createdAt: orders.createdAt })
    .from(orders).innerJoin(users, eq(users.id, orders.userId)).orderBy(desc(orders.createdAt))
  return { orders: await Promise.all(rows.map(async order => ({ ...order, items: await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)) }))) }
})
