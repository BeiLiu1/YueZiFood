import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase } from '../../../../database/client'
import { dishes, dishRequests, notifications, requestStatusHistory } from '../../../../database/schema'
import { requireAdmin } from '../../../../utils/authorization'
import { sendPushToUsers } from '../../../../services/push'
import { parseId } from '../../../../utils/validation'

const schema = z.object({ toStatus: z.enum(['RESEARCHING', 'REJECTED', 'CONVERTED']), note: z.string().trim().max(500).default('') })
const allowed: Record<string, string[]> = { SUBMITTED: ['RESEARCHING', 'REJECTED', 'CONVERTED'], RESEARCHING: ['REJECTED', 'CONVERTED'] }

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'), '心愿')
  const body = await readValidatedBody(event, value => schema.parse(value))
  const { db } = getDatabase()
  const request = (await db.select().from(dishRequests).where(eq(dishRequests.id, id)).limit(1))[0]
  if (!request) throw createError({ statusCode: 404, statusMessage: '心愿不存在' })
  if (!allowed[request.status]?.includes(body.toStatus)) throw createError({ statusCode: 409, statusMessage: '这个心愿不能这样流转' })
  let linkedDishId = request.linkedDishId
  db.transaction((tx) => {
    if (body.toStatus === 'CONVERTED') linkedDishId = tx.insert(dishes).values({ name: request.name, description: request.description, status: 'IDEA', createdBy: admin.id }).returning({ id: dishes.id }).get().id
    tx.update(dishRequests).set({ status: body.toStatus, adminNote: body.note, linkedDishId, updatedAt: new Date() }).where(eq(dishRequests.id, id)).run()
    tx.insert(requestStatusHistory).values({ requestId: id, fromStatus: request.status, toStatus: body.toStatus, operatorUserId: admin.id, note: body.note }).run()
    const title = body.toStatus === 'RESEARCHING' ? '大厨开始研究这道菜啦！' : body.toStatus === 'REJECTED' ? '大厨回复了你的心愿' : '你的心愿进入待试做清单啦！'
    tx.insert(notifications).values({ userId: request.userId, type: 'REQUEST', title, content: body.note || request.name, link: '/requests' }).run()
  })
    const pushTitle = body.toStatus === 'RESEARCHING' ? '大厨开始研究这道菜啦！' : body.toStatus === 'REJECTED' ? '大厨回复了你的心愿' : '你的心愿进入待试做清单啦！'
  await sendPushToUsers([request.userId], { title: pushTitle, content: body.note || request.name, link: '/requests' }).catch(() => {})
  return { success: true, linkedDishId }
})
