import { describe, expect, it } from 'vitest'
import { dishPayloadSchema } from '../../server/services/dish-editor'

describe('dish payload', () => {
  it('allows saving a draft without categories', () => {
    const result = dishPayloadSchema.parse({ name: '香辣梭子蟹' })
    expect(result.categoryIds).toEqual([])
  })
})
