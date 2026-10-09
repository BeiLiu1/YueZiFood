<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { items, remove, clear } = useCart()
const today = new Date().toLocaleDateString('sv-SE')
const form = reactive({ scheduledDate: today, mealSlot: 'DINNER' as 'LUNCH' | 'DINNER', note: '' })
const submitting = ref(false); const errorMessage = ref('')
async function submitOrder() {
  if (!items.value.length) return
  submitting.value = true; errorMessage.value = ''
  try { const result = await $fetch<{ id: number }>('/api/orders', { method: 'POST', body: { ...form, items: items.value.map(item => ({ dishId: item.dishId, quantity: item.quantity })) } }); clear(); await navigateTo(`/orders/${result.id}`) }
  catch (error: any) { errorMessage.value = error?.data?.message || '点单没有送达，再试一下吧' }
  finally { submitting.value = false }
}
</script>

<template>
  <main class="mx-auto min-h-screen max-w-lg p-5 pb-28"><header class="py-3"><p class="text-xs font-black tracking-[0.2em] text-ink/55">ORDER BASKET</p><h1 class="text-3xl font-black">今天想吃这些！</h1></header><section v-if="items.length" class="mt-5 space-y-4"><article v-for="item in items" :key="item.dishId" class="sticker-card flex items-center gap-4 p-3"><div class="size-20 overflow-hidden rounded-xl border-2 border-ink bg-mint-soft"><img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="h-full w-full object-cover"><div v-else class="grid h-full place-items-center text-3xl">🍲</div></div><div class="min-w-0 flex-1"><h2 class="font-black">{{ item.name }}</h2><div class="mt-2 flex items-center gap-2"><button class="size-8 rounded-full border-2 border-ink font-black" @click="item.quantity = Math.max(1, item.quantity - 1)">−</button><strong>{{ item.quantity }} 份</strong><button class="size-8 rounded-full border-2 border-ink bg-mint font-black" @click="item.quantity = Math.min(10, item.quantity + 1)">＋</button></div></div><button class="font-black text-danger" @click="remove(item.dishId)">移除</button></article></section><section v-else class="sticker-card mt-8 bg-lemon p-8 text-center"><div class="text-6xl">🧺</div><h2 class="mt-3 text-xl font-black">篮子还是空的</h2><NuxtLink to="/" class="mt-3 inline-block font-black underline">去菜单挑几道 →</NuxtLink></section><form v-if="items.length" class="sticker-card mt-6 bg-lemon p-5" @submit.prevent="submitOrder"><h2 class="text-xl font-black">什么时候开饭？</h2><div class="mt-4 grid grid-cols-2 gap-3"><label class="font-bold">日期<input v-model="form.scheduledDate" class="form-field mt-1" type="date" :min="today" required></label><label class="font-bold">餐次<select v-model="form.mealSlot" class="form-field mt-1"><option value="LUNCH">午餐</option><option value="DINNER">晚餐</option></select></label></div><label class="mt-4 block font-bold">给大厨捎句话<textarea v-model="form.note" class="form-field mt-1 min-h-20" maxlength="300" placeholder="比如：今天想吃辣一点～" /></label><p v-if="errorMessage" class="mt-3 font-bold text-danger">{{ errorMessage }}</p><button class="sticker-button mt-5 w-full bg-peach py-3 text-lg" :disabled="submitting">{{ submitting ? '正在飞向大厨…' : '确认点单 💌' }}</button></form></main>
</template>
