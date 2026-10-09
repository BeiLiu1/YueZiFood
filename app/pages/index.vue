<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
type Category = { id: number, name: string, parentId: number | null }
type Dish = { id: number, name: string, description: string, imageUrl: string | null, cookingMinutes: number | null, difficulty: 'EASY' | 'MEDIUM' | 'HARD', categories: { id: number, name: string }[] }
const { user, clear } = useUserSession()
const { add } = useCart()
const selectedCategory = ref<number | undefined>()
const search = ref('')
const query = computed(() => ({ categoryId: selectedCategory.value, q: search.value || undefined }))
const { data, status } = await useFetch<{ categories: Category[], dishes: Dish[] }>('/api/menu', { query, watch: [query] })
const roots = computed(() => data.value?.categories.filter(item => !item.parentId) || [])
const children = computed(() => selectedCategory.value ? data.value?.categories.filter(item => item.parentId === selectedCategory.value) || [] : [])
async function logout() { await clear(); await navigateTo('/login') }
</script>

<template>
  <main class="mx-auto min-h-screen max-w-lg p-5 pb-28">
    <header class="flex items-center justify-between py-3"><div><p class="text-xs font-black tracking-[0.2em] text-ink/55">YUEZI'S MENU!</p><h1 class="text-2xl font-black">嗨，{{ user?.displayName }} 👋</h1></div><div class="flex gap-3"><NuxtLink v-if="user?.roles.includes('ADMIN')" to="/admin" class="font-black underline">管理</NuxtLink><button class="font-bold underline" @click="logout">退出</button></div></header>
    <section class="sticker-card mt-4 bg-lemon p-5"><p class="text-sm font-black"><span class="theme-copy--mint">今天也要好好吃饭 ★</span><span class="theme-copy--peach">本大厨已上线，等你翻牌 ♥</span></p><h2 class="mt-1 text-3xl font-black"><span class="theme-copy--mint">想吃点什么呀？</span><span class="theme-copy--peach">{{ user?.displayName }}，今天馋什么？</span></h2><div class="relative mt-4"><input v-model="search" class="form-field pr-12" placeholder="搜一搜好吃的…"><span class="absolute right-4 top-3 text-xl" aria-hidden="true">⌕</span></div></section>
    <nav class="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="菜品分类"><button class="shrink-0 rounded-full border-2 border-ink px-4 py-2 font-black" :class="selectedCategory === undefined ? 'bg-ink text-white' : 'bg-white'" @click="selectedCategory = undefined">全部</button><button v-for="item in roots" :key="item.id" class="shrink-0 rounded-full border-2 border-ink px-4 py-2 font-black" :class="selectedCategory === item.id ? 'bg-mint' : 'bg-white'" @click="selectedCategory = item.id">{{ item.name }}</button></nav>
    <nav v-if="children.length" class="mt-1 flex flex-wrap gap-2"><button v-for="item in children" :key="item.id" class="rounded-full bg-lemon px-3 py-1 text-sm font-bold" @click="selectedCategory = item.id">↳ {{ item.name }}</button></nav>
    <section class="mt-6 grid grid-cols-2 gap-4"><article v-for="dish in data?.dishes" :key="dish.id" class="sticker-card overflow-hidden bg-white"><NuxtLink :to="`/dishes/${dish.id}`"><div class="aspect-square border-b-2 border-ink bg-mint-soft"><img v-if="dish.imageUrl" :src="dish.imageUrl" :alt="dish.name" class="h-full w-full object-cover"><div v-else class="grid h-full place-items-center text-5xl">🍲</div></div><div class="p-3 pb-2"><h3 class="font-black leading-tight">{{ dish.name }}</h3><p class="mt-1 line-clamp-2 text-xs font-semibold text-ink/55">{{ dish.description || '神秘但一定好吃' }}</p><p class="mt-2 text-xs font-black">⏱ {{ dish.cookingMinutes || '?' }} 分钟</p></div></NuxtLink><button class="mx-3 mb-3 mt-1 w-[calc(100%_-_1.5rem)] rounded-xl border-2 border-ink bg-lemon py-2 text-sm font-black" @click="add({ dishId: dish.id, name: dish.name, imageUrl: dish.imageUrl })">＋ 点这道</button></article></section>
    <div v-if="status === 'pending'" class="py-16 text-center font-black">正在翻菜单…</div><div v-else-if="!data?.dishes.length" class="sticker-card mt-8 bg-peach p-8 text-center"><div class="text-6xl">🥺</div><h3 class="mt-3 text-xl font-black">这里暂时空空的</h3><p class="mt-2 font-semibold">换个分类看看，或者稍后许个新菜愿望。</p></div>
  </main>
</template>
