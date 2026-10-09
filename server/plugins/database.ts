import { resolve } from 'node:path'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { getDatabase } from '../database/client'
import { ensureBootstrapData } from '../services/bootstrap'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  const { db } = getDatabase(config.databasePath)

  migrate(db, { migrationsFolder: resolve(config.migrationsPath) })
  await ensureBootstrapData(db, {
    adminUsername: config.bootstrapAdminUsername,
    adminPassword: config.bootstrapAdminPassword,
    adminDisplayName: config.bootstrapAdminDisplayName,
    hashPassword
  })
})
