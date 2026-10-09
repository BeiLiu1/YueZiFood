<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })

const [{ data: users }, { data: dishes }, { data: orders }, { data: requests }] = await Promise.all([
  useFetch<any[]>('/api/admin/users'),
  useFetch<any>('/api/admin/dishes'),
  useFetch<any>('/api/admin/orders'),
  useFetch<any>('/api/admin/requests')
])
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <header>
      <p class="font-black tracking-widest text-ink/60">DASHBOARD</p>
      <h1 class="text-3xl font-black md:text-4xl">大厨控制台</h1>
      <p class="mt-2 font-semibold text-ink/65">今天的菜单、点单和新菜心愿，都在这里等大厨安排。</p>
    </header>

    <section class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="sticker-card bg-mint p-5">
        <p class="font-bold text-ink/65">当前用户</p>
        <p class="mt-2 text-4xl font-black">{{ users?.length ?? 0 }}</p>
      </article>
      <article class="sticker-card bg-lemon p-5">
        <p class="font-bold text-ink/65">已登记菜品</p>
        <p class="mt-2 text-4xl font-black">{{ dishes?.dishes?.length ?? 0 }}</p>
      </article>
      <article class="sticker-card bg-peach p-5">
        <p class="font-bold text-ink/65">待确认点单</p>
        <p class="mt-2 text-4xl font-black">{{ orders?.orders?.filter((item: any) => item.status === 'PENDING').length ?? 0 }}</p>
      </article>
      <article class="sticker-card bg-white p-5">
        <p class="font-bold text-ink/65">待研究心愿</p>
        <p class="mt-2 text-4xl font-black">{{ requests?.requests?.filter((item: any) => ['SUBMITTED', 'RESEARCHING'].includes(item.status)).length ?? 0 }}</p>
      </article>
    </section>

    <div class="mt-8 flex flex-wrap gap-3"><NuxtLink to="/admin/orders" class="sticker-button inline-flex items-center bg-lemon px-5 py-3">处理点单 →</NuxtLink><NuxtLink to="/admin/dishes" class="sticker-button inline-flex items-center bg-mint px-5 py-3">整理菜单 →</NuxtLink><NuxtLink to="/admin/requests" class="sticker-button inline-flex items-center bg-peach px-5 py-3">看看心愿 →</NuxtLink></div>
  </div>
</template>
