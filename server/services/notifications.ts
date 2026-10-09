import { eq } from 'drizzle-orm'
import type { AppDatabase } from '../database/client'
import { notifications, roles, userRoles, users } from '../database/schema'

export function notifyUsers(db: AppDatabase, userIds: number[], notification: Omit<typeof notifications.$inferInsert, 'userId'>) {
  const uniqueIds = [...new Set(userIds)]
  if (uniqueIds.length) db.insert(notifications).values(uniqueIds.map(userId => ({ ...notification, userId }))).run()
}

export function getAdminUserIds(db: AppDatabase) {
  return db.select({ id: users.id }).from(users)
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(eq(roles.code, 'ADMIN')).all().map(row => row.id)
}
