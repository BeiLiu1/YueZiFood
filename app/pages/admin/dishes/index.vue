<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
type Dish = { id: number, name: string, description: string, imageUrl: string | null, status: 'IDEA' | 'TRIED' | 'NEEDS_POLISH' | 'PUBLISHED' | 'OFF_SHELF', categories: { id: number, name: string }[], cookingMinutes: number | null }
const { data } = await useFetch<{ dishes: Dish[] }>('/api/admin/dishes')
const statusText = { IDEA: '待试做 🍳', TRIED: '已试做 ✨', NEEDS_POLISH: '待完善 🛠️', PUBLISHED: '已上架啦', OFF_SHELF: '暂时收起' }
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <header class="flex flex-wrap items-end justify-between gap-4"><div><p class="font-black tracking-widest text-ink/60">DISHES</p><h1 class="text-3xl font-black">今日好菜研究所</h1><p class="mt-2 font-semibold text-ink/65">菜品可归属多个分类，食谱和用料也在这里维护。</p></div><NuxtLink to="/admin/dishes/new" class="sticker-button inline-flex items-center bg-lemon px-5">＋ 研究一道新菜</NuxtLink></header>
    <section class="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <NuxtLink v-for="dish in data?.dishes" :key="dish.id" :to="`/admin/dishes/${dish.id}`" class="sticker-card overflow-hidden transition hover:-translate-y-1">
        <div class="aspect-[16/9] border-b-2 border-ink bg-mint-soft">
          <img v-if="dish.imageUrl" :src="dish.imageUrl" :alt="dish.name" class="h-full w-full object-cover">
          <div v-else class="grid h-full place-items-center text-6xl">🍳</div>
        </div>
        <div class="p-5"><div class="flex items-start justify-between gap-3"><h2 class="text-xl font-black">{{ dish.name }}</h2><span class="shrink-0 rounded-full border-2 border-ink px-2 py-1 text-xs font-black" :class="dish.status === 'PUBLISHED' ? 'bg-mint' : dish.status === 'OFF_SHELF' ? 'bg-peach' : 'bg-lemon'">{{ statusText[dish.status] }}</span></div><p class="mt-2 line-clamp-2 text-sm font-semibold text-ink/60">{{ dish.description || '这道菜还没有写介绍。' }}</p><div class="mt-4 flex flex-wrap gap-1"><span v-for="category in dish.categories" :key="category.id" class="rounded-full bg-ink px-2 py-1 text-xs font-bold text-white">{{ category.name }}</span></div></div>
      </NuxtLink>
      <div v-if="!data?.dishes.length" class="sticker-card bg-lemon p-8 text-center sm:col-span-2 xl:col-span-3"><div class="text-6xl">🧑‍🍳</div><p class="mt-3 text-xl font-black">菜单还是空的，开火研究第一道吧！</p></div>
    </section>
  </div>
</template>
