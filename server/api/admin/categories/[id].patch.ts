import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase } from '../../../database/client'
import { categories } from '../../../database/schema'
import { assertValidCategoryParent } from '../../../services/categories'
import { requireAdmin } from '../../../utils/authorization'
import { parseId } from '../../../utils/validation'

const schema = z.object({
  name: z.string().trim().min(1).max(24).optional(),
  parentId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional()
}).refine(value => Object.keys(value).length > 0)

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'), '分类')
  const body = await readValidatedBody(event, value => schema.parse(value))
  const { db } = getDatabase()
  try {
    if (body.parentId !== undefined) await assertValidCategoryParent(db, body.parentId, id)
    await db.update(categories).set({ ...body, updatedAt: new Date() }).where(eq(categories.id, id))
    return { success: true }
  } catch (error: any) {
    throw createError({ statusCode: 400, statusMessage: error.message || '分类更新失败' })
  }
})
