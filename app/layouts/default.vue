<script setup lang="ts">
const { loggedIn } = useUserSession()
const { count } = useCart()
</script>

<template>
  <div class="min-h-screen">
    <slot />
    <nav v-if="loggedIn" class="app-bottom-nav fixed inset-x-3 bottom-3 z-40 mx-auto grid max-w-lg grid-cols-5 bg-white p-2" aria-label="主导航">
      <NuxtLink to="/" class="rounded-xl py-2 text-center text-xs font-black"><span class="block text-xl">🍜</span>菜单</NuxtLink>
      <NuxtLink to="/cart" class="relative rounded-xl py-2 text-center text-xs font-black"><span class="block text-xl">🧺</span>点单<span v-if="count" class="absolute right-2 top-0 rounded-full bg-peach px-1.5 text-xs">{{ count }}</span></NuxtLink>
      <NuxtLink to="/orders" class="rounded-xl py-2 text-center text-xs font-black"><span class="block text-xl">🧾</span>订单</NuxtLink>
      <NuxtLink to="/requests" class="rounded-xl py-2 text-center text-xs font-black"><span class="block text-xl">✨</span>心愿</NuxtLink>
      <NuxtLink to="/notifications" class="rounded-xl py-2 text-center text-xs font-black"><span class="block text-xl">🔔</span>消息</NuxtLink>
    </nav>
  </div>
</template>
