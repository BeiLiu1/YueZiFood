import { getDatabase } from '../../database/client'
import { getOrderDetail } from '../../services/order-detail'
import { requireUser } from '../../utils/authorization'
import { parseId } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const order = await getOrderDetail(getDatabase().db, parseId(getRouterParam(event, 'id'), '订单'))
  if (!order || (order.userId !== user.id && !user.roles.includes('ADMIN'))) throw createError({ statusCode: 404, statusMessage: '订单不存在' })
  return { order }
})
