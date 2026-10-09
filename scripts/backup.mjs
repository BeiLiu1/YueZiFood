import { cp, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import Database from 'better-sqlite3'

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
const destination = resolve(process.argv[2] || './backups', timestamp)
const databasePath = resolve(process.env.NUXT_DATABASE_PATH || process.env.DB_FILE_PATH || './data/yuezi.db')
const uploadsPath = resolve(process.env.NUXT_UPLOADS_PATH || process.env.UPLOADS_PATH || './uploads')

await mkdir(destination, { recursive: true })
const database = new Database(databasePath, { readonly: true })
await database.backup(resolve(destination, 'yuezi.db'))
database.close()
await cp(uploadsPath, resolve(destination, 'uploads'), { recursive: true, force: false }).catch(error => {
  if (error.code !== 'ENOENT') throw error
})
console.log(`Backup created: ${destination}`)
