import { z } from 'zod'

export const idSchema = z.coerce.number().int().positive()

export function parseId(value: string | undefined, label = '记录') {
  const result = idSchema.safeParse(value)
  if (!result.success) throw createError({ statusCode: 400, statusMessage: `${label}编号无效` })
  return result.data
}
