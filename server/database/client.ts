import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

type Connection = ReturnType<typeof createDatabase>

let connection: Connection | undefined

export function createDatabase(databasePath: string) {
  const absolutePath = resolve(databasePath)
  mkdirSync(dirname(absolutePath), { recursive: true })
  const sqlite = new Database(absolutePath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  return {
    sqlite,
    db: drizzle(sqlite, { schema })
  }
}

export function getDatabase(databasePath?: string) {
  if (!connection) {
    const path = databasePath || useRuntimeConfig().databasePath
    connection = createDatabase(path)
  }
  return connection
}

export type AppDatabase = ReturnType<typeof createDatabase>['db']
