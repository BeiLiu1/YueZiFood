import { desc, eq } from 'drizzle-orm'
import { getDatabase } from '../../database/client'
import { dishRequests } from '../../database/schema'
import { requireUser } from '../../utils/authorization'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return { requests: await getDatabase().db.select().from(dishRequests).where(eq(dishRequests.userId, user.id)).orderBy(desc(dishRequests.createdAt)) }
})
