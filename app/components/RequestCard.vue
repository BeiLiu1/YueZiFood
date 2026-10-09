<script setup lang="ts">
defineProps<{ wish: { id: number, name: string, description: string, adminNote: string, status: string, linkedDishId: number | null } }>()
const statusText: Record<string, string> = { SUBMITTED: '已送达大厨', RESEARCHING: '研究中', REJECTED: '这次暂时不行', CONVERTED: '已进入试做清单', PUBLISHED: '已经上架啦' }
</script>

<template>
  <article class="sticker-card p-5">
    <div class="flex items-start justify-between gap-3">
      <h3 class="text-lg font-black">{{ wish.name }}</h3>
      <span class="rounded-full border-2 border-ink bg-mint px-2 py-1 text-xs font-black">{{ statusText[wish.status] }}</span>
    </div>
    <p v-if="wish.description" class="mt-2 text-sm font-semibold text-ink/60">{{ wish.description }}</p>
    <p v-if="wish.adminNote" class="mt-3 rounded-xl bg-lemon/70 p-3 text-sm font-bold">大厨说：{{ wish.adminNote }}</p>
    <NuxtLink v-if="wish.status === 'PUBLISHED' && wish.linkedDishId" :to="`/dishes/${wish.linkedDishId}`" class="mt-3 inline-block font-black underline">去点这道菜 →</NuxtLink>
  </article>
</template>
