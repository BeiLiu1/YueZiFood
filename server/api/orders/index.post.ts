import { inArray } from 'drizzle-orm'
import { z } from 'zod'
import { getDatabase } from '../../database/client'
import { dishes, orderItems, orders, orderStatusHistory } from '../../database/schema'
import { getAdminUserIds, notifyUsers } from '../../services/notifications'
import { sendPushToUsers } from '../../services/push'
import { requireUser } from '../../utils/authorization'

const schema = z.object({
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealSlot: z.enum(['LUNCH', 'DINNER']),
  note: z.string().trim().max(300).default(''),
  items: z.array(z.object({ dishId: z.number().int().positive(), quantity: z.number().int().min(1).max(10) })).min(1).max(20)
}).refine(value => new Set(value.items.map(item => item.dishId)).size === value.items.length, { message: '菜品不能重复' })

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readValidatedBody(event, value => schema.parse(value))
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' })
  if (body.scheduledDate < today) throw createError({ statusCode: 400, statusMessage: '不能预约过去的日期' })
  const { db } = getDatabase()
  const adminIds = getAdminUserIds(db)
  const dishRows = await db.select({ id: dishes.id, name: dishes.name, imageUrl: dishes.imageUrl, status: dishes.status }).from(dishes).where(inArray(dishes.id, body.items.map(item => item.dishId)))
  if (dishRows.length !== body.items.length || dishRows.some(dish => dish.status !== 'PUBLISHED')) throw createError({ statusCode: 400, statusMessage: '有菜品已经不在菜单上了，请刷新后重试' })
  const orderId = db.transaction((tx) => {
    const order = tx.insert(orders).values({ userId: user.id, scheduledDate: body.scheduledDate, mealSlot: body.mealSlot, note: body.note }).returning({ id: orders.id }).get()
    tx.insert(orderItems).values(body.items.map(item => { const dish = dishRows.find(row => row.id === item.dishId)!; return { orderId: order.id, dishId: dish.id, dishName: dish.name, dishImageUrl: dish.imageUrl, quantity: item.quantity } })).run()
    tx.insert(orderStatusHistory).values({ orderId: order.id, fromStatus: null, toStatus: 'PENDING', operatorUserId: user.id, note: '发起点单' }).run()
    notifyUsers(tx as any, adminIds, { type: 'ORDER', title: '叮！有新的点单', content: `${user.displayName} 点了 ${body.items.length} 道菜`, link: `/admin/orders/${order.id}` })
    return order.id
  })
  await sendPushToUsers(adminIds, { title: '叮！有新的点单', content: `${user.displayName} 点了 ${body.items.length} 道菜`, link: `/admin/orders/${orderId}` }).catch(() => {})
  setResponseStatus(event, 201)
  return { id: orderId }
})
