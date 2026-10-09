import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase } from '../../database/client'
import { users } from '../../database/schema'
import { getUserWithRolesByUsername } from '../../services/users'

const loginSchema = z.object({
  username: z.string().trim().min(3).max(32),
  password: z.string().min(8).max(128)
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, value => loginSchema.parse(value))
  const user = await getUserWithRolesByUsername(body.username)

  if (!user || user.status !== 'ACTIVE' || !(await verifyPassword(user.passwordHash, body.password))) {
    throw createError({ statusCode: 401, statusMessage: '用户名或密码不正确' })
  }

  const now = new Date()
  const { db } = getDatabase()
  await db.update(users).set({ lastLoginAt: now, updatedAt: now }).where(eq(users.id, user.id))

  const sessionUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    roles: user.roles,
    passwordVersion: user.passwordVersion
  }
  await setUserSession(event, { user: sessionUser, loggedInAt: now })

  return { user: sessionUser }
})
