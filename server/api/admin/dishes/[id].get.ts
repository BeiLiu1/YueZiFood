import { getDatabase } from '../../../database/client'
import { getDishDetail } from '../../../services/dishes'
import { requireAdmin } from '../../../utils/authorization'
import { parseId } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'), '菜品')
  const dish = await getDishDetail(getDatabase().db, id)
  if (!dish) throw createError({ statusCode: 404, statusMessage: '菜品不存在' })
  return { dish }
})
