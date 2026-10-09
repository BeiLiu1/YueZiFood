import { z } from 'zod'
import { getDatabase } from '../../../database/client'
import { categories } from '../../../database/schema'
import { assertValidCategoryParent } from '../../../services/categories'
import { requireAdmin } from '../../../utils/authorization'

const schema = z.object({
  name: z.string().trim().min(1).max(24),
  parentId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).default(0)
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readValidatedBody(event, value => schema.parse(value))
  const { db } = getDatabase()
  try {
    await assertValidCategoryParent(db, body.parentId)
    const created = await db.insert(categories).values(body).returning()
    return { category: created[0] }
  } catch (error: any) {
    throw createError({ statusCode: 400, statusMessage: error.message || '分类创建失败' })
  }
})
