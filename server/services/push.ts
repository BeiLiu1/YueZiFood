import { eq, inArray } from 'drizzle-orm'
import webpush from 'web-push'
import { getDatabase } from '../database/client'
import { pushSubscriptions } from '../database/schema'

export async function sendPushToUsers(userIds: number[], payload: { title: string, content: string, link?: string | null }) {
  const config = useRuntimeConfig()
  if (!config.public.vapidPublicKey || !config.vapidPrivateKey || !userIds.length) return
  webpush.setVapidDetails(config.vapidSubject, config.public.vapidPublicKey, config.vapidPrivateKey)
  const { db } = getDatabase()
  const subscriptions = await db.select().from(pushSubscriptions).where(inArray(pushSubscriptions.userId, [...new Set(userIds)]))
  await Promise.allSettled(subscriptions.map(async subscription => {
    try {
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify(payload))
    } catch (error: any) {
      if (error?.statusCode === 404 || error?.statusCode === 410) await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, subscription.id))
    }
  }))
}
