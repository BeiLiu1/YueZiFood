import { inArray } from 'drizzle-orm'
import { z } from 'zod'
import type { AppDatabase } from '../database/client'
import { categories, dishCategories, dishIngredients, dishes, ingredients, recipeSteps } from '../database/schema'

export const dishPayloadSchema = z.object({
  name: z.string().trim().min(1).max(48),
  description: z.string().trim().max(500).default(''),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  status: z.enum(['IDEA', 'TRIED', 'NEEDS_POLISH', 'PUBLISHED', 'OFF_SHELF']).default('IDEA'),
  cookingMinutes: z.number().int().min(1).max(1440).nullable().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
  categoryIds: z.array(z.number().int().positive()).default([]),
  ingredients: z.array(z.object({
    ingredientId: z.number().int().positive(),
    amount: z.number().positive().max(999999),
    unit: z.string().trim().min(1).max(12),
    note: z.string().trim().max(80).default('')
  })).default([]),
  steps: z.array(z.string().trim().min(1).max(1000)).default([])
})

export type DishPayload = z.infer<typeof dishPayloadSchema>

export async function validateDishReferences(db: AppDatabase, payload: DishPayload): Promise<DishPayload> {
  const categoryIds = [...new Set(payload.categoryIds)]
  const foundCategories = await db.select({ id: categories.id }).from(categories).where(inArray(categories.id, categoryIds))
  if (foundCategories.length !== categoryIds.length) throw new Error('包含不存在的分类')
  const ingredientIds = [...new Set(payload.ingredients.map(item => item.ingredientId))]
  const foundIngredients = ingredientIds.length
    ? await db.select({ id: ingredients.id, defaultUnit: ingredients.defaultUnit }).from(ingredients).where(inArray(ingredients.id, ingredientIds))
    : []
  if (ingredientIds.length) {
    if (foundIngredients.length !== ingredientIds.length) throw new Error('包含不存在的食材')
  }
  if (ingredientIds.length !== payload.ingredients.length) throw new Error('同一道菜不能重复添加同一种食材')
  const unitByIngredientId = new Map(foundIngredients.map(item => [item.id, item.defaultUnit]))
  return { ...payload, ingredients: payload.ingredients.map(item => ({ ...item, unit: unitByIngredientId.get(item.ingredientId) || item.unit })) }
}
