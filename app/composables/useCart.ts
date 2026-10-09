export type CartItem = { dishId: number, name: string, imageUrl: string | null, quantity: number }

export function useCart() {
  const items = useCookie<CartItem[]>('yuezi-cart', { default: () => [], sameSite: 'lax' })
  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  function add(dish: Omit<CartItem, 'quantity'>) {
    const existing = items.value.find(item => item.dishId === dish.dishId)
    if (existing) existing.quantity = Math.min(10, existing.quantity + 1)
    else items.value = [...items.value, { ...dish, quantity: 1 }]
  }
  function remove(dishId: number) { items.value = items.value.filter(item => item.dishId !== dishId) }
  function clear() { items.value = [] }
  return { items, count, add, remove, clear }
}
