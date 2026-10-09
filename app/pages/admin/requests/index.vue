<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
const { data } = await useFetch<any>('/api/admin/requests')
const statusText: Record<string, string> = { SUBMITTED: '新心愿', RESEARCHING: '研究中', REJECTED: '已拒绝', CONVERTED: '已进入试做', PUBLISHED: '已上架' }
</script>

<template><div class="mx-auto max-w-6xl"><header><p class="font-black tracking-widest text-ink/60">WISH LIST</p><h1 class="text-3xl font-black">新菜心愿池</h1><p class="mt-2 font-semibold text-ink/65">每颗心愿都值得一场厨房实验。</p></header><section class="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"><NuxtLink v-for="item in data?.requests" :key="item.id" :to="`/admin/requests/${item.id}`" class="sticker-card p-5"><div class="flex items-start justify-between"><span class="rounded-full bg-lemon px-2 py-1 text-xs font-black">{{ statusText[item.status] }}</span><span class="text-sm font-bold text-ink/55">{{ item.userName }}</span></div><h2 class="mt-4 text-xl font-black">{{ item.name }}</h2><p class="mt-2 line-clamp-3 text-sm font-semibold text-ink/60">{{ item.description || '没有额外描述，留给大厨自由发挥。' }}</p></NuxtLink><div v-if="!data?.requests.length" class="sticker-card bg-mint p-8 text-center sm:col-span-2 xl:col-span-3"><div class="text-6xl">🌠</div><p class="mt-3 text-xl font-black">还没有新心愿飘过来</p></div></section></div></template>
