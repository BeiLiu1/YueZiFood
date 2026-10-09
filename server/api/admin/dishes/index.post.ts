import { getDatabase } from '../../../database/client'
import { dishCategories, dishIngredients, dishes, recipeSteps } from '../../../database/schema'
import { dishPayloadSchema, validateDishReferences } from '../../../services/dish-editor'
import { requireAdmin } from '../../../utils/authorization'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const parsed = dishPayloadSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || '菜品资料不完整' })
  const body = parsed.data
  const { db } = getDatabase()
  try {
    const normalizedBody = await validateDishReferences(db, body)
    const dishId = db.transaction((tx) => {
      const created = tx.insert(dishes).values({
        name: normalizedBody.name,
        description: normalizedBody.description,
        imageUrl: normalizedBody.imageUrl || null,
        status: normalizedBody.status,
        cookingMinutes: normalizedBody.cookingMinutes || null,
        difficulty: normalizedBody.difficulty,
        createdBy: admin.id
      }).returning({ id: dishes.id }).get()
      if (normalizedBody.categoryIds.length) tx.insert(dishCategories).values([...new Set(normalizedBody.categoryIds)].map(categoryId => ({ dishId: created.id, categoryId }))).run()
      if (normalizedBody.ingredients.length) tx.insert(dishIngredients).values(normalizedBody.ingredients.map((item, index) => ({ ...item, dishId: created.id, sortOrder: index }))).run()
      if (normalizedBody.steps.length) tx.insert(recipeSteps).values(normalizedBody.steps.map((content, index) => ({ dishId: created.id, stepNo: index + 1, content }))).run()
      return created.id
    })
    return { id: dishId }
  } catch (error: any) {
    throw createError({ statusCode: 400, statusMessage: error.message || '菜品保存失败' })
  }
})
