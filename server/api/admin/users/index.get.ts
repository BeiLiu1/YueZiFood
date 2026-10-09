import { listUsersWithRoles } from '../../../services/users'
import { requireAdmin } from '../../../utils/authorization'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return listUsersWithRoles()
})
