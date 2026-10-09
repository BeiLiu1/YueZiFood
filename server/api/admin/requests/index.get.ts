import { desc, eq } from 'drizzle-orm'
import { getDatabase } from '../../../database/client'
import { dishRequests, users } from '../../../database/schema'
import { requireAdmin } from '../../../utils/authorization'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return { requests: await getDatabase().db.select({ id: dishRequests.id, userId: dishRequests.userId, userName: users.displayName, name: dishRequests.name, description: dishRequests.description, status: dishRequests.status, adminNote: dishRequests.adminNote, linkedDishId: dishRequests.linkedDishId, createdAt: dishRequests.createdAt }).from(dishRequests).innerJoin(users, eq(users.id, dishRequests.userId)).orderBy(desc(dishRequests.createdAt)) }
})
