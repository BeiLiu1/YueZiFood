import { eq } from 'drizzle-orm'
import { getDatabase } from '../../../database/client'
import { dishCategories, dishIngredients, dishes, dishRequests, notifications, recipeSteps, requestStatusHistory } from '../../../database/schema'
import { dishPayloadSchema, validateDishReferences } from '../../../services/dish-editor'
import { sendPushToUsers } from '../../../services/push'
import { requireAdmin } from '../../../utils/authorization'
import { parseId } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'), '菜品')
  const parsed = dishPayloadSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || '菜品资料不完整' })
  const body = parsed.data
  const { db } = getDatabase()
  try {
    const normalizedBody = await validateDishReferences(db, body)
    const linkedRequest = normalizedBody.status === 'PUBLISHED'
      ? (await db.select().from(dishRequests).where(eq(dishRequests.linkedDishId, id)).limit(1))[0]
      : undefined
    db.transaction((tx) => {
      const result = tx.update(dishes).set({
        name: normalizedBody.name,
        description: normalizedBody.description,
        imageUrl: normalizedBody.imageUrl || null,
        status: normalizedBody.status,
        cookingMinutes: normalizedBody.cookingMinutes || null,
        difficulty: normalizedBody.difficulty,
        updatedAt: new Date()
      }).where(eq(dishes.id, id)).run()
      if (!result.changes) throw new Error('菜品不存在')
      tx.delete(dishCategories).where(eq(dishCategories.dishId, id)).run()
      tx.delete(dishIngredients).where(eq(dishIngredients.dishId, id)).run()
      tx.delete(recipeSteps).where(eq(recipeSteps.dishId, id)).run()
      if (normalizedBody.categoryIds.length) tx.insert(dishCategories).values([...new Set(normalizedBody.categoryIds)].map(categoryId => ({ dishId: id, categoryId }))).run()
      if (normalizedBody.ingredients.length) tx.insert(dishIngredients).values(normalizedBody.ingredients.map((item, index) => ({ ...item, dishId: id, sortOrder: index }))).run()
      if (normalizedBody.steps.length) tx.insert(recipeSteps).values(normalizedBody.steps.map((content, index) => ({ dishId: id, stepNo: index + 1, content }))).run()
      if (normalizedBody.status === 'PUBLISHED') {
        const request = linkedRequest
        if (request && request.status !== 'PUBLISHED') {
          tx.update(dishRequests).set({ status: 'PUBLISHED', updatedAt: new Date() }).where(eq(dishRequests.id, request.id)).run()
          tx.insert(requestStatusHistory).values({ requestId: request.id, fromStatus: request.status, toStatus: 'PUBLISHED', operatorUserId: admin.id, note: '关联菜品已上架' }).run()
          tx.insert(notifications).values({ userId: request.userId, type: 'REQUEST', title: '你想吃的菜上架啦！', content: `「${body.name}」现在可以点单了`, link: `/dishes/${id}` }).run()
        }
      }
    })
    if (linkedRequest && linkedRequest.status !== 'PUBLISHED' && normalizedBody.status === 'PUBLISHED') {
      await sendPushToUsers([linkedRequest.userId], { title: '你想吃的菜上架啦！', content: `「${normalizedBody.name}」现在可以点单了`, link: `/dishes/${id}` }).catch(() => {})
    }
    return { success: true }
  } catch (error: any) {
    throw createError({ statusCode: 400, statusMessage: error.message || '菜品保存失败' })
  }
})
