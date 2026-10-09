import { getDatabase } from '../../database/client'
import { getDishDetail } from '../../services/dishes'
import { requireUser } from '../../utils/authorization'
import { parseId } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = parseId(getRouterParam(event, 'id'), '菜品')
  const dish = await getDishDetail(getDatabase().db, id)
  if (!dish || dish.status !== 'PUBLISHED') throw createError({ statusCode: 404, statusMessage: '这道菜暂时不在菜单上' })
  return { dish }
})
