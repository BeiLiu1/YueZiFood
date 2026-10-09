import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase } from '../../../database/client'
import { ingredients } from '../../../database/schema'
import { requireAdmin } from '../../../utils/authorization'
import { parseId } from '../../../utils/validation'

const schema = z.object({ name: z.string().trim().min(1).max(32), defaultUnit: z.string().trim().min(1).max(12) })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'), '食材')
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || '食材资料不完整' })
  const { db } = getDatabase()
  try {
    const updated = (await db.update(ingredients).set({ ...parsed.data, updatedAt: new Date() }).where(eq(ingredients.id, id)).returning())[0]
    if (!updated) throw createError({ statusCode: 404, statusMessage: '食材不存在' })
    return { ingredient: updated }
  } catch (error: any) {
    if (error?.statusCode) throw error
    throw createError({ statusCode: 409, statusMessage: '这个食材名称已经登记过啦' })
  }
})
