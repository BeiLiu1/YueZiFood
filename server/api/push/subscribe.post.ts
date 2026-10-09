import { z } from 'zod'
import { getDatabase } from '../../database/client'
import { pushSubscriptions } from '../../database/schema'
import { requireUser } from '../../utils/authorization'

const schema = z.object({ endpoint: z.string().url().max(2000), keys: z.object({ p256dh: z.string().min(1).max(500), auth: z.string().min(1).max(500) }) })

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readValidatedBody(event, value => schema.parse(value))
  await getDatabase().db.insert(pushSubscriptions).values({ userId: user.id, endpoint: body.endpoint, p256dh: body.keys.p256dh, auth: body.keys.auth }).onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { userId: user.id, p256dh: body.keys.p256dh, auth: body.keys.auth, updatedAt: new Date() } })
  return { success: true }
})
