import { eq } from 'drizzle-orm'
import { getDatabase } from '../database/client'
import { roles, userRoles, users } from '../database/schema'

export async function getUserWithRolesByUsername(username: string) {
  const { db } = getDatabase()
  const user = await db.select().from(users).where(eq(users.username, username)).limit(1)
  if (!user[0]) return null

  const assignedRoles = await db.select({ code: roles.code })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, user[0].id))

  return { ...user[0], roles: assignedRoles.map(item => item.code) }
}

export async function listUsersWithRoles() {
  const { db } = getDatabase()
  const rows = await db.select({
    id: users.id,
    username: users.username,
    displayName: users.displayName,
    status: users.status,
    createdAt: users.createdAt,
    roleCode: roles.code
  })
    .from(users)
    .leftJoin(userRoles, eq(users.id, userRoles.userId))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))

  const grouped = new Map<number, {
    id: number
    username: string
    displayName: string
    status: 'ACTIVE' | 'DISABLED'
    createdAt: Date
    roles: Array<'ADMIN' | 'USER'>
  }>()

  for (const row of rows) {
    const item = grouped.get(row.id) || {
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      status: row.status,
      createdAt: row.createdAt,
      roles: []
    }
    if (row.roleCode) item.roles.push(row.roleCode)
    grouped.set(row.id, item)
  }

  return [...grouped.values()]
}
