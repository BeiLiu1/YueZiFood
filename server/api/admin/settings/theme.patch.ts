import { z } from 'zod'
import { getDatabase } from '../../../database/client'
import { setUiTheme } from '../../../services/theme'
import { requireAdmin } from '../../../utils/authorization'

const schema = z.object({ theme: z.enum(['peach-kitchen', 'mint-bento']) })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readValidatedBody(event, value => schema.parse(value))
  await setUiTheme(getDatabase().db, body.theme)
  return { theme: body.theme }
})
