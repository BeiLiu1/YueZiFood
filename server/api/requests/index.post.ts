import { z } from 'zod'
import { getDatabase } from '../../database/client'
import { dishRequests, requestStatusHistory } from '../../database/schema'
import { getAdminUserIds, notifyUsers } from '../../services/notifications'
import { sendPushToUsers } from '../../services/push'
import { requireUser } from '../../utils/authorization'

const schema = z.object({ name: z.string().trim().min(1).max(48), description: z.string().trim().max(500).default('') })

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readValidatedBody(event, value => schema.parse(value))
  const { db } = getDatabase()
  const adminIds = getAdminUserIds(db)
  const id = db.transaction((tx) => {
    const request = tx.insert(dishRequests).values({ userId: user.id, ...body }).returning({ id: dishRequests.id }).get()
    tx.insert(requestStatusHistory).values({ requestId: request.id, fromStatus: null, toStatus: 'SUBMITTED', operatorUserId: user.id, note: '许下新菜心愿' }).run()
    notifyUsers(tx as any, adminIds, { type: 'REQUEST', title: '收到一颗新菜心愿！', content: `${user.displayName} 想吃「${body.name}」`, link: `/admin/requests/${request.id}` })
    return request.id
  })
  await sendPushToUsers(adminIds, { title: '收到一颗新菜心愿！', content: `${user.displayName} 想吃「${body.name}」`, link: `/admin/requests/${id}` }).catch(() => {})
  setResponseStatus(event, 201)
  return { id }
})
