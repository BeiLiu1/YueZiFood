import { and, eq, isNull } from 'drizzle-orm'
import { getDatabase } from '../../database/client'
import { notifications } from '../../database/schema'
import { requireUser } from '../../utils/authorization'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await getDatabase().db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)))
  return { success: true }
})
