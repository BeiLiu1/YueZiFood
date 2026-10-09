import { getDatabase } from '../../database/client'
import { getUiTheme } from '../../services/theme'

export default defineEventHandler(async () => ({ theme: await getUiTheme(getDatabase().db) }))
