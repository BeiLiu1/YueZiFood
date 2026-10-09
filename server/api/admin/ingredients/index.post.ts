import { z } from 'zod'
import { getDatabase } from '../../../database/client'
import { ingredients } from '../../../database/schema'
import { requireAdmin } from '../../../utils/authorization'

const schema = z.object({ name: z.string().trim().min(1).max(32), defaultUnit: z.string().trim().min(1).max(12) })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readValidatedBody(event, value => schema.parse(value))
  const { db } = getDatabase()
  try {
    return { ingredient: (await db.insert(ingredients).values(body).returning())[0] }
  } catch {
    throw createError({ statusCode: 409, statusMessage: '这个食材已经登记过啦' })
  }
})
