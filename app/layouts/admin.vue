<script setup lang="ts">
const route = useRoute()
const { user, clear } = useUserSession()

const items = [
  { to: '/admin', label: '工作台', icon: '⌂' },
  { to: '/admin/categories', label: '分类管理', icon: '⌗' },
  { to: '/admin/ingredients', label: '食材管理', icon: '♨' },
  { to: '/admin/dishes', label: '菜品管理', icon: '✿' },
  { to: '/admin/orders', label: '点单管理', icon: '✉' },
  { to: '/admin/requests', label: '新菜心愿', icon: '★' },
  { to: '/admin/users', label: '用户管理', icon: '♙' },
  { to: '/admin/appearance', label: '外观设置', icon: '◐' }
]

async function logout() {
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
    <aside class="border-b-2 border-ink bg-ink p-4 text-white lg:min-h-screen lg:border-r-2 lg:border-b-0">
      <div class="flex items-center justify-between lg:block">
        <NuxtLink to="/admin" class="inline-flex items-center gap-2 text-xl font-black">
          <span class="rounded-xl border-2 border-white bg-mint px-2 py-1 text-ink">悦</span>
          大厨控制台
        </NuxtLink>
        <button class="text-sm font-bold underline lg:hidden" @click="logout">退出</button>
      </div>

      <nav class="mt-4 grid grid-cols-4 gap-2 lg:mt-8 lg:flex lg:flex-col" aria-label="管理导航">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="shrink-0 rounded-xl border-2 px-1 py-2 text-center text-xs font-bold transition lg:px-3 lg:text-left lg:text-base"
          :class="route.path === item.to || (item.to !== '/admin' && route.path.startsWith(`${item.to}/`)) ? 'border-ink bg-lemon text-ink' : 'border-white/35 hover:bg-white/10'"
        >
          <span class="lg:mr-1" aria-hidden="true">{{ item.icon }}</span>
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="mt-8 hidden border-t border-white/30 pt-4 text-sm lg:block">
        <p class="mb-3 text-white/70">{{ user?.displayName }}</p>
        <button class="font-bold underline" @click="logout">退出登录</button>
      </div>
    </aside>

    <main class="min-w-0 overflow-x-hidden p-3 sm:p-4 md:p-8">
      <slot />
    </main>
  </div>
</template>
