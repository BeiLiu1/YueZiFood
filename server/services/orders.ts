import type { OrderStatus } from '../database/schema'

const adminTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['PREPARING', 'REJECTED'],
  PREPARING: ['COMPLETED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: []
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus, actor: 'ADMIN' | 'USER') {
  const allowed = actor === 'USER' ? from === 'PENDING' && to === 'CANCELLED' : adminTransitions[from].includes(to)
  if (!allowed) throw new Error(`订单不能从 ${from} 变更为 ${to}`)
}

export function mergeIngredients(rows: { name: string, amount: number, unit: string, quantity: number }[]) {
  const grouped = new Map<string, { name: string, amount: number, unit: string }>()
  for (const row of rows) {
    const key = `${row.name}\u0000${row.unit}`
    const current = grouped.get(key) || { name: row.name, amount: 0, unit: row.unit }
    current.amount += row.amount * row.quantity
    grouped.set(key, current)
  }
  return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
}
