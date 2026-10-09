<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
type Category = { id: number, name: string, parentId: number | null, sortOrder: number, status: 'ACTIVE' | 'DISABLED', children: Category[] }
const { data, refresh } = await useFetch<{ categories: Category[] }>('/api/admin/categories')
const form = reactive({ name: '', parentId: null as number | null, sortOrder: 0 })
const errorMessage = ref('')

async function createCategory() {
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/categories', { method: 'POST', body: form })
    Object.assign(form, { name: '', parentId: null, sortOrder: 0 })
    await refresh()
  } catch (error: any) { errorMessage.value = error?.data?.message || '分类保存失败' }
}
async function removeCategory(id: number) {
  if (!confirm('确认删除这个分类吗？')) return
  try { await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }); await refresh() }
  catch (error: any) { alert(error?.data?.message || '暂时不能删除') }
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <header><p class="font-black tracking-widest text-ink/60">CATEGORIES</p><h1 class="text-3xl font-black">分类小宇宙</h1><p class="mt-2 font-semibold text-ink/65">最多两层，一道菜可以住进多个分类。</p></header>
    <div class="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section class="sticker-card overflow-hidden">
        <h2 class="border-b-2 border-ink bg-mint px-5 py-4 text-xl font-black">分类树</h2>
        <div v-if="!data?.categories.length" class="p-8 text-center font-bold text-ink/55">还没有分类，先种下一颗吧 🌱</div>
        <div v-for="root in data?.categories" :key="root.id" class="border-b border-ink/15 p-5 last:border-0">
          <div class="flex items-center justify-between"><strong class="text-lg">{{ root.name }}</strong><button class="font-bold text-danger underline" @click="removeCategory(root.id)">删除</button></div>
          <div class="mt-3 flex flex-wrap gap-2">
            <span v-for="child in root.children" :key="child.id" class="rounded-full border-2 border-ink bg-lemon px-3 py-1 font-bold">{{ child.name }} <button class="ml-1 text-danger" @click="removeCategory(child.id)">×</button></span>
            <span v-if="!root.children.length" class="text-sm font-semibold text-ink/45">暂无二级分类</span>
          </div>
        </div>
      </section>
      <form class="sticker-card h-fit bg-lemon p-5" @submit.prevent="createCategory">
        <h2 class="text-xl font-black">新增分类 ＋</h2>
        <label class="mt-4 block font-bold">分类名<input v-model="form.name" class="form-field mt-1" required maxlength="24"></label>
        <label class="mt-4 block font-bold">上级分类<select v-model="form.parentId" class="form-field mt-1"><option :value="null">一级分类</option><option v-for="item in data?.categories" :key="item.id" :value="item.id">{{ item.name }}</option></select></label>
        <label class="mt-4 block font-bold">排序<input v-model.number="form.sortOrder" class="form-field mt-1" type="number" min="0"></label>
        <p v-if="errorMessage" class="mt-3 font-bold text-danger">{{ errorMessage }}</p>
        <button class="sticker-button mt-5 w-full bg-mint">保存分类</button>
      </form>
    </div>
  </div>
</template>
