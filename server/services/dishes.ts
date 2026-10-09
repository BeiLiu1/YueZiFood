import { asc, eq, inArray } from 'drizzle-orm'
import type { AppDatabase } from '../database/client'
import { categories, dishCategories, dishIngredients, dishes, ingredients, recipeSteps } from '../database/schema'

export async function getDishDetail(db: AppDatabase, dishId: number) {
  const dish = (await db.select().from(dishes).where(eq(dishes.id, dishId)).limit(1))[0]
  if (!dish) return null
  const categoryRows = await db.select({ id: categories.id, name: categories.name })
    .from(dishCategories).innerJoin(categories, eq(categories.id, dishCategories.categoryId))
    .where(eq(dishCategories.dishId, dishId)).orderBy(asc(categories.sortOrder), asc(categories.id))
  const ingredientRows = await db.select({
    id: ingredients.id,
    name: ingredients.name,
    amount: dishIngredients.amount,
    unit: dishIngredients.unit,
    note: dishIngredients.note,
    sortOrder: dishIngredients.sortOrder
  }).from(dishIngredients).innerJoin(ingredients, eq(ingredients.id, dishIngredients.ingredientId))
    .where(eq(dishIngredients.dishId, dishId)).orderBy(asc(dishIngredients.sortOrder), asc(dishIngredients.id))
  const steps = await db.select().from(recipeSteps).where(eq(recipeSteps.dishId, dishId)).orderBy(asc(recipeSteps.stepNo))
  return { ...dish, categories: categoryRows, ingredients: ingredientRows, steps }
}

export async function getCategoryMap(db: AppDatabase, dishIds: number[]) {
  if (!dishIds.length) return new Map<number, { id: number, name: string }[]>()
  const rows = await db.select({ dishId: dishCategories.dishId, id: categories.id, name: categories.name })
    .from(dishCategories).innerJoin(categories, eq(categories.id, dishCategories.categoryId))
    .where(inArray(dishCategories.dishId, dishIds))
  const result = new Map<number, { id: number, name: string }[]>()
  for (const row of rows) result.set(row.dishId, [...(result.get(row.dishId) || []), { id: row.id, name: row.name }])
  return result
}
