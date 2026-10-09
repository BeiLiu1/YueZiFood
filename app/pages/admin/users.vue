<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })

type RoleCode = 'ADMIN' | 'USER'
type UserItem = {
  id: number
  username: string
  displayName: string
  status: 'ACTIVE' | 'DISABLED'
  roles: RoleCode[]
  createdAt: string
}

const { data: users, refresh } = await useFetch<UserItem[]>('/api/admin/users')
const creating = ref(false)
const errorMessage = ref('')
const form = reactive({ username: '', displayName: '', password: '', roleCode: 'USER' as RoleCode })

async function createUser() {
  creating.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/users', { method: 'POST', body: form })
    Object.assign(form, { username: '', displayName: '', password: '', roleCode: 'USER' })
    await refresh()
  }
  catch (error: any) {
    errorMessage.value = error?.data?.message || '用户创建失败'
  }
  finally {
    creating.value = false
  }
}

async function toggleStatus(user: UserItem) {
  await $fetch(`/api/admin/users/${user.id}`, {
    method: 'PATCH',
    body: { status: user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' }
  })
  await refresh()
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <header>
      <p class="font-black tracking-widest text-ink/60">USERS</p>
      <h1 class="text-3xl font-black">用户管理</h1>
      <p class="mt-2 font-semibold text-ink/65">两种系统角色，少一点配置，多一点开饭。</p>
    </header>

    <div class="mt-8 grid gap-6 xl:grid-cols-[1fr_22rem]">
      <section class="sticker-card overflow-hidden" aria-labelledby="user-list-title">
        <h2 id="user-list-title" class="border-b-2 border-ink bg-mint px-5 py-4 text-xl font-black">现有用户</h2>
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[40rem] text-left">
            <thead class="bg-ink/5 text-sm">
              <tr>
                <th class="px-5 py-3">用户名</th>
                <th class="px-5 py-3">显示名</th>
                <th class="px-5 py-3">角色</th>
                <th class="px-5 py-3">状态</th>
                <th class="px-5 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in users" :key="item.id" class="border-t border-ink/15">
                <td class="px-5 py-4 font-bold">{{ item.username }}</td>
                <td class="px-5 py-4">{{ item.displayName }}</td>
                <td class="px-5 py-4">{{ item.roles.join('、') }}</td>
                <td class="px-5 py-4">
                  <span class="rounded-full border border-ink px-2 py-1 text-xs font-black" :class="item.status === 'ACTIVE' ? 'bg-mint' : 'bg-peach'">
                    {{ item.status === 'ACTIVE' ? '启用' : '停用' }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <button class="font-bold underline" @click="toggleStatus(item)">
                    {{ item.status === 'ACTIVE' ? '停用' : '启用' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="divide-y divide-ink/15 md:hidden">
          <article v-for="item in users" :key="item.id" class="space-y-3 p-4">
            <div class="flex items-start justify-between gap-3"><div><strong class="block">{{ item.displayName }}</strong><span class="text-sm font-semibold text-ink/60">@{{ item.username }}</span></div><span class="rounded-full border border-ink px-2 py-1 text-xs font-black" :class="item.status === 'ACTIVE' ? 'bg-mint' : 'bg-peach'">{{ item.status === 'ACTIVE' ? '启用' : '停用' }}</span></div>
            <div class="flex items-center justify-between text-sm"><span class="font-semibold">角色：{{ item.roles.join('、') }}</span><button class="font-bold underline" @click="toggleStatus(item)">{{ item.status === 'ACTIVE' ? '停用' : '启用' }}</button></div>
          </article>
        </div>
      </section>

      <section class="sticker-card h-fit bg-lemon p-5" aria-labelledby="create-user-title">
        <h2 id="create-user-title" class="text-xl font-black">新增一副碗筷</h2>
        <form class="mt-5 space-y-4" @submit.prevent="createUser">
          <label class="block font-bold">用户名<input v-model.trim="form.username" class="form-field mt-1" required minlength="3" maxlength="32"></label>
          <label class="block font-bold">显示名<input v-model.trim="form.displayName" class="form-field mt-1" required maxlength="32"></label>
          <label class="block font-bold">初始密码<input v-model="form.password" class="form-field mt-1" type="password" required minlength="8" maxlength="128"></label>
          <label class="block font-bold">角色
            <select v-model="form.roleCode" class="form-field mt-1">
              <option value="USER">普通用户</option>
              <option value="ADMIN">管理员</option>
            </select>
          </label>
          <p v-if="errorMessage" class="font-bold text-danger" role="alert">{{ errorMessage }}</p>
          <button class="sticker-button w-full bg-mint px-4 py-3" :disabled="creating">
            {{ creating ? '正在添置…' : '创建用户' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>
