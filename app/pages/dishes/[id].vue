<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const route = useRoute()
const { data } = await useFetch<any>(`/api/menu/${route.params.id}`)
const { add } = useCart()
const difficulty = { EASY: '轻松拿捏', MEDIUM: '认真发挥', HARD: '大厨挑战' }
</script>

<template>
  <main class="mx-auto min-h-screen max-w-lg p-5 pb-12">
    <NuxtLink to="/" class="font-black underline">← 返回菜单</NuxtLink>
    <article v-if="data?.dish" class="sticker-card mt-5 overflow-hidden"><div class="aspect-[4/3] bg-mint-soft"><img v-if="data.dish.imageUrl" :src="data.dish.imageUrl" :alt="data.dish.name" class="h-full w-full object-cover"><div v-else class="grid h-full place-items-center text-8xl">🍽️</div></div><div class="p-6"><div class="flex flex-wrap gap-2"><span v-for="item in data.dish.categories" :key="item.id" class="rounded-full bg-lemon px-3 py-1 text-xs font-black">{{ item.name }}</span></div><h1 class="mt-3 text-3xl font-black">{{ data.dish.name }}</h1><p class="mt-3 font-semibold leading-relaxed text-ink/70">{{ data.dish.description }}</p><div class="mt-4 flex gap-3 text-sm font-black"><span>⏱ {{ data.dish.cookingMinutes || '?' }} 分钟</span><span>🔥 {{ difficulty[data.dish.difficulty as keyof typeof difficulty] }}</span></div></div></article>
    <button v-if="data?.dish" class="sticker-button mt-6 w-full bg-peach py-3 text-lg" @click="add({ dishId: data.dish.id, name: data.dish.name, imageUrl: data.dish.imageUrl })">＋ 加入今天的点单</button>
    <section v-if="data?.dish.ingredients.length" class="sticker-card mt-6 bg-lemon p-5"><h2 class="text-xl font-black">会用到这些</h2><ul class="mt-3 grid grid-cols-2 gap-2"><li v-for="item in data.dish.ingredients" :key="item.id" class="rounded-lg bg-white/70 p-2 font-bold">{{ item.name }} {{ item.amount }}{{ item.unit }}</li></ul></section>
    <section v-if="data?.dish.steps.length" class="sticker-card mt-6 p-5"><h2 class="text-xl font-black">大厨食谱</h2><ol class="mt-4 space-y-4"><li v-for="step in data.dish.steps" :key="step.id" class="flex gap-3"><span class="grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-mint font-black">{{ step.stepNo }}</span><p class="pt-1 font-semibold leading-relaxed">{{ step.content }}</p></li></ol></section>
  </main>
</template>
