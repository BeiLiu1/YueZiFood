import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { getDatabase } from '../database/client'
import { users } from '../database/schema'

export async function requireUser(event: H3Event) {
  const session = await requireUserSession(event)
  const { db } = getDatabase()
  const current = await db.select({ status: users.status, passwordVersion: users.passwordVersion })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!current[0] || current[0].status !== 'ACTIVE' || current[0].passwordVersion !== session.user.passwordVersion) {
    await clearUserSession(event)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return session.user
}

export async function requireAdmin(event: H3Event) {
  const user = await requireUser(event)
  if (!user.roles.includes('ADMIN')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return user
}
