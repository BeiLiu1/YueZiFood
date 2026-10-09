import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase } from '../../../database/client'
import { roles, userRoles, users } from '../../../database/schema'
import { requireAdmin } from '../../../utils/authorization'

const updateUserSchema = z.object({
  displayName: z.string().trim().min(1).max(32).optional(),
  password: z.string().min(8).max(128).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  roleCode: z.enum(['ADMIN', 'USER']).optional()
}).refine(value => Object.keys(value).length > 0)

export default defineEventHandler(async (event) => {
  const currentUser = await requireAdmin(event)
  const userId = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(userId) || userId < 1) {
    throw createError({ statusCode: 400, statusMessage: '无效用户' })
  }

  const body = await readValidatedBody(event, value => updateUserSchema.parse(value))
  if (userId === currentUser.id && body.status === 'DISABLED') {
    throw createError({ statusCode: 400, statusMessage: '不能停用当前登录用户' })
  }

  const { db } = getDatabase()
  const existing = await db.select({
    id: users.id,
    passwordVersion: users.passwordVersion
  }).from(users).where(eq(users.id, userId)).limit(1)
  if (!existing[0]) {
    throw createError({ statusCode: 404, statusMessage: '用户不存在' })
  }

  const update: Partial<typeof users.$inferInsert> = { updatedAt: new Date() }
  if (body.displayName) update.displayName = body.displayName
  if (body.status) update.status = body.status
  if (body.password) {
    update.passwordHash = await hashPassword(body.password)
    update.passwordVersion = existing[0].passwordVersion + 1
  }

  const role = body.roleCode
    ? (await db.select({ id: roles.id }).from(roles).where(eq(roles.code, body.roleCode)).limit(1))[0]
    : undefined
  if (body.roleCode && !role) throw createError({ statusCode: 400, statusMessage: '角色不存在' })

  db.transaction((tx) => {
    tx.update(users).set(update).where(eq(users.id, userId)).run()
    if (role) {
      tx.delete(userRoles).where(eq(userRoles.userId, userId)).run()
      tx.insert(userRoles).values({ userId, roleId: role.id }).run()
    }
  })

  return { success: true }
})
