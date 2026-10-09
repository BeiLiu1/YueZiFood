import { readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'

const contentTypes: Record<string, string> = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name') || ''
  if (!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(name)) throw createError({ statusCode: 404 })
  try {
    const data = await readFile(resolve(useRuntimeConfig().uploadsPath, name))
    setHeader(event, 'Content-Type', contentTypes[extname(name)] || 'application/octet-stream')
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return data
  } catch {
    throw createError({ statusCode: 404, statusMessage: '图片不存在' })
  }
})
