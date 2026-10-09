import { describe, expect, it } from 'vitest'
import { assertOrderTransition, mergeIngredients } from '../../server/services/orders'

describe('orders', () => {
  it('allows only valid status transitions', () => {
    expect(() => assertOrderTransition('PENDING', 'ACCEPTED', 'ADMIN')).not.toThrow()
    expect(() => assertOrderTransition('PENDING', 'COMPLETED', 'ADMIN')).toThrow()
    expect(() => assertOrderTransition('PENDING', 'CANCELLED', 'USER')).not.toThrow()
  })
  it('merges ingredients only when unit is equal', () => {
    expect(mergeIngredients([
      { name: '番茄', amount: 2, unit: '个', quantity: 2 },
      { name: '番茄', amount: 1, unit: '个', quantity: 1 },
      { name: '番茄', amount: 200, unit: '克', quantity: 1 }
    ])).toEqual([{ name: '番茄', amount: 5, unit: '个' }, { name: '番茄', amount: 200, unit: '克' }])
  })
})
