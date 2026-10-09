import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase } from '../../../database/client'
import { roles, userRoles, users } from '../../../database/schema'
import { requireAdmin } from '../../../utils/authorization'

const createUserSchema = z.object({
  username: z.string().trim().regex(/^[a-zA-Z0-9_-]{3,32}$/),
  displayName: z.string().trim().min(1).max(32),
  password: z.string().min(8).max(128),
  roleCode: z.enum(['ADMIN', 'USER'])
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readValidatedBody(event, value => createUserSchema.parse(value))
  const { db } = getDatabase()

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, body.username)).limit(1)
  if (existing.length) {
    throw createError({ statusCode: 409, statusMessage: '用户名已存在' })
  }

  const role = await db.select({ id: roles.id }).from(roles).where(eq(roles.code, body.roleCode)).limit(1)
  if (!role[0]) {
    throw createError({ statusCode: 400, statusMessage: '角色不存在' })
  }

  const passwordHash = await hashPassword(body.password)
  const result = db.transaction((tx) => {
    const created = tx.insert(users).values({
      username: body.username,
      displayName: body.displayName,
      passwordHash
    }).returning({ id: users.id }).get()
    const userId = created.id
    tx.insert(userRoles).values({ userId, roleId: role[0]!.id }).run()
    return userId
  })

  setResponseStatus(event, 201)
  return { id: result }
})
