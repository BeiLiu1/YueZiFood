import { asc, eq } from 'drizzle-orm'
import { getDatabase } from '../../../database/client'
import { dishRequests, requestStatusHistory, users } from '../../../database/schema'
import { requireAdmin } from '../../../utils/authorization'
import { parseId } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'), '心愿')
  const { db } = getDatabase()
  const request = (await db.select({ id: dishRequests.id, userId: dishRequests.userId, userName: users.displayName, name: dishRequests.name, description: dishRequests.description, status: dishRequests.status, adminNote: dishRequests.adminNote, linkedDishId: dishRequests.linkedDishId, createdAt: dishRequests.createdAt }).from(dishRequests).innerJoin(users, eq(users.id, dishRequests.userId)).where(eq(dishRequests.id, id)).limit(1))[0]
  if (!request) throw createError({ statusCode: 404, statusMessage: '心愿不存在' })
  return { request: { ...request, history: await db.select().from(requestStatusHistory).where(eq(requestStatusHistory.requestId, id)).orderBy(asc(requestStatusHistory.createdAt)) } }
})
