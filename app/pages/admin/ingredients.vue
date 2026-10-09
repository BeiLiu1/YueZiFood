<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
type Ingredient = { id: number, name: string, defaultUnit: string }
const { data, refresh } = await useFetch<{ ingredients: Ingredient[] }>('/api/admin/ingredients')
const form = reactive({ name: '', defaultUnit: '克' })
const errorMessage = ref('')
const editingId = ref<number | null>(null)
const editForm = reactive({ name: '', defaultUnit: '克' })
async function createIngredient() {
  try { await $fetch('/api/admin/ingredients', { method: 'POST', body: form }); form.name = ''; await refresh(); errorMessage.value = '' }
  catch (error: any) { errorMessage.value = error?.data?.message || '保存失败' }
}
function startEdit(item: Ingredient) { editingId.value = item.id; Object.assign(editForm, { name: item.name, defaultUnit: item.defaultUnit }); errorMessage.value = '' }
function cancelEdit() { editingId.value = null }
async function saveEdit() {
  if (!editingId.value) return
  try { await $fetch(`/api/admin/ingredients/${editingId.value}`, { method: 'PATCH', body: editForm }); editingId.value = null; await refresh(); errorMessage.value = '' }
  catch (error: any) { errorMessage.value = error?.data?.statusMessage || error?.data?.message || '食材修改失败' }
}
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <header><p class="font-black tracking-widest text-ink/60">PANTRY</p><h1 class="text-3xl font-black">食材储藏室</h1><p class="mt-2 font-semibold text-ink/65">把常用食材登记好，点单时自动生成采购清单。</p></header>
    <form class="sticker-card mt-8 grid gap-3 bg-lemon p-5 sm:grid-cols-[1fr_10rem_auto]" @submit.prevent="createIngredient">
      <input v-model="form.name" class="form-field" placeholder="例如：番茄" required maxlength="32">
      <input v-model="form.defaultUnit" class="form-field" placeholder="单位" required maxlength="12">
      <button class="sticker-button bg-mint px-5">收进储藏室</button>
      <p v-if="errorMessage" class="font-bold text-danger sm:col-span-3">{{ errorMessage }}</p>
    </form>
    <section class="sticker-card mt-6 overflow-hidden"><div class="hidden grid-cols-[1fr_10rem_6rem] border-b-2 border-ink bg-mint px-5 py-3 font-black md:grid"><span>食材</span><span>默认单位</span><span>操作</span></div><div v-for="item in data?.ingredients" :key="item.id" class="border-b border-ink/15 p-4 last:border-0 md:grid md:grid-cols-[1fr_10rem_6rem] md:items-center md:px-5 md:py-3"><template v-if="editingId === item.id"><div class="grid gap-2 sm:grid-cols-2 md:col-span-2"><input v-model="editForm.name" class="form-field" maxlength="32"><input v-model="editForm.defaultUnit" class="form-field" maxlength="12"></div><div class="mt-3 flex gap-3 md:mt-0"><button type="button" class="font-bold underline" @click="saveEdit">保存</button><button type="button" class="font-bold text-danger underline" @click="cancelEdit">取消</button></div></template><template v-else><strong>{{ item.name }}</strong><span class="mt-1 block md:mt-0">{{ item.defaultUnit }}</span><button type="button" class="mt-2 font-bold underline md:mt-0" @click="startEdit(item)">修改</button></template></div><p v-if="!data?.ingredients.length" class="p-8 text-center font-bold text-ink/50">储藏室还是空的</p></section>
  </div>
</template>
