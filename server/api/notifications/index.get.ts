import { desc, eq } from 'drizzle-orm'
import { getDatabase } from '../../database/client'
import { notifications } from '../../database/schema'
import { requireUser } from '../../utils/authorization'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { db } = getDatabase()
  const items = await db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(50)
  return { notifications: items, unreadCount: items.filter(item => !item.readAt).length }
})
