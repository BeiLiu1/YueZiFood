import { asc, eq } from 'drizzle-orm'
import type { AppDatabase } from '../database/client'
import { dishIngredients, ingredients, orderIngredientChecks, orderItems, orderRatings, orders, orderStatusHistory, users } from '../database/schema'
import { mergeIngredients } from './orders'

export async function getOrderDetail(db: AppDatabase, id: number) {
  const order = (await db.select({
    id: orders.id, userId: orders.userId, userName: users.displayName, scheduledDate: orders.scheduledDate,
    mealSlot: orders.mealSlot, note: orders.note, status: orders.status, createdAt: orders.createdAt, updatedAt: orders.updatedAt
  }).from(orders).innerJoin(users, eq(users.id, orders.userId)).where(eq(orders.id, id)).limit(1))[0]
  if (!order) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(asc(orderItems.id))
  const rawIngredients = await db.select({ name: ingredients.name, amount: dishIngredients.amount, unit: dishIngredients.unit, quantity: orderItems.quantity })
    .from(orderItems).innerJoin(dishIngredients, eq(dishIngredients.dishId, orderItems.dishId))
    .innerJoin(ingredients, eq(ingredients.id, dishIngredients.ingredientId)).where(eq(orderItems.orderId, id))
  const history = await db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, id)).orderBy(asc(orderStatusHistory.createdAt))
  const checks = await db.select({ name: orderIngredientChecks.name, unit: orderIngredientChecks.unit, checked: orderIngredientChecks.checked })
    .from(orderIngredientChecks).where(eq(orderIngredientChecks.orderId, id))
  const preparedIngredients = mergeIngredients(rawIngredients).map(item => ({
    ...item,
    checked: checks.some(check => check.name === item.name && check.unit === item.unit && check.checked)
  }))
  const rating = (await db.select({ rating: orderRatings.rating, updatedAt: orderRatings.updatedAt })
    .from(orderRatings).where(eq(orderRatings.orderId, id)).limit(1))[0] || null
  return { ...order, items, ingredients: preparedIngredients, history, rating }
}
