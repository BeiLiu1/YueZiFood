import { eq } from 'drizzle-orm'
import type { AppDatabase } from '../database/client'
import { roles, systemSettings, userRoles, users } from '../database/schema'

type BootstrapOptions = {
  adminUsername: string
  adminPassword: string
  adminDisplayName: string
  hashPassword: (password: string) => Promise<string>
}

export async function ensureBootstrapData(db: AppDatabase, options: BootstrapOptions) {
  await db.insert(systemSettings).values({ key: 'ui_theme', value: 'mint-bento' }).onConflictDoNothing()
  await db.insert(roles).values([
    { code: 'ADMIN', name: '管理员', isSystem: true },
    { code: 'USER', name: '普通用户', isSystem: true }
  ]).onConflictDoNothing()

  const existingAdmin = await db.select({ id: users.id })
    .from(users)
    .where(eq(users.username, options.adminUsername))
    .limit(1)

  if (existingAdmin.length > 0) {
    return { created: false, userId: existingAdmin[0]!.id }
  }

  if (!options.adminPassword || options.adminPassword.length < 8) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD must contain at least 8 characters before the first startup')
  }

  const adminRole = await db.select({ id: roles.id }).from(roles).where(eq(roles.code, 'ADMIN')).limit(1)
  const roleId = adminRole[0]?.id
  if (!roleId) {
    throw new Error('ADMIN role initialization failed')
  }

  const passwordHash = await options.hashPassword(options.adminPassword)
  const created = await db.insert(users).values({
    username: options.adminUsername,
    displayName: options.adminDisplayName,
    passwordHash
  }).returning({ id: users.id })

  const userId = created[0]?.id
  if (!userId) {
    throw new Error('Administrator initialization failed')
  }

  await db.insert(userRoles).values({ userId, roleId })
  return { created: true, userId }
}
