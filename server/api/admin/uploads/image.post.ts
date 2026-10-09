import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { requireAdmin } from '../../../utils/authorization'

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'file' && part.data)
  if (!file?.type || !extensions[file.type]) throw createError({ statusCode: 400, statusMessage: '只支持 JPG、PNG 或 WebP 图片' })
  if (file.data.length > 5 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: '图片不能超过 5MB' })
  const uploadDir = resolve(useRuntimeConfig().uploadsPath)
  await mkdir(uploadDir, { recursive: true })
  const name = `${randomUUID()}.${extensions[file.type]}`
  await writeFile(resolve(uploadDir, name), file.data, { flag: 'wx' })
  return { url: `/api/files/${name}` }
})
