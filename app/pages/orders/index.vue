<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { data, refresh } = await useFetch<any>('/api/orders')
const statusText: Record<string, string> = { PENDING: '等大厨接单', ACCEPTED: '大厨已接单', PREPARING: '热锅进行中', COMPLETED: '已经开饭', REJECTED: '本次未接单', CANCELLED: '已取消' }
async function cancel(id: number) { if (!confirm('真的要取消这次点单吗？')) return; await $fetch(`/api/orders/${id}/cancel`, { method: 'POST' }); await refresh() }
</script>

<template><main class="mx-auto min-h-screen max-w-lg p-5 pb-28"><header class="py-3"><p class="text-xs font-black tracking-[0.2em] text-ink/55">MY ORDERS</p><h1 class="text-3xl font-black">开饭记录簿</h1></header><section class="mt-6 space-y-5"><article v-for="order in data?.orders" :key="order.id" class="sticker-card overflow-hidden"><NuxtLink :to="`/orders/${order.id}`" class="block p-5"><div class="flex items-center justify-between"><strong>#{{ order.id }} · {{ order.scheduledDate }} {{ order.mealSlot === 'LUNCH' ? '午餐' : '晚餐' }}</strong><span class="rounded-full border-2 border-ink bg-mint px-2 py-1 text-xs font-black">{{ statusText[order.status] }}</span></div><p class="mt-3 font-semibold">{{ order.items.map((item: any) => `${item.dishName}×${item.quantity}`).join('、') }}</p></NuxtLink><button v-if="order.status === 'PENDING'" class="w-full border-t-2 border-ink bg-peach py-2 font-black" @click="cancel(order.id)">取消点单</button></article><div v-if="!data?.orders.length" class="sticker-card bg-lemon p-8 text-center"><div class="text-6xl">🧾</div><p class="mt-3 text-xl font-black">还没有开饭记录</p></div></section></main></template>
