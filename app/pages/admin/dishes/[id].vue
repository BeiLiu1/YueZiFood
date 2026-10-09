<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
type Category = { id: number, name: string, parentId: number | null, children: Category[] }
type IngredientOption = { id: number, name: string, defaultUnit: string }
type DishDetail = { name: string, description: string, imageUrl: string | null, status: 'IDEA' | 'TRIED' | 'NEEDS_POLISH' | 'PUBLISHED' | 'OFF_SHELF', cookingMinutes: number | null, difficulty: 'EASY' | 'MEDIUM' | 'HARD', categories: { id: number }[], ingredients: { id: number, amount: number, unit: string, note: string }[], steps: { content: string }[] }
const route = useRoute()
const isNew = route.params.id === 'new'
const [{ data: categoryData }, { data: ingredientData }] = await Promise.all([
  useFetch<{ categories: Category[] }>('/api/admin/categories'),
  useFetch<{ ingredients: IngredientOption[] }>('/api/admin/ingredients')
])
const form = reactive({ name: '', description: '', imageUrl: null as string | null, status: 'IDEA' as DishDetail['status'], cookingMinutes: null as number | null, difficulty: 'EASY' as DishDetail['difficulty'], categoryIds: [] as number[], ingredients: [] as { ingredientId: number | null, amount: number, unit: string, note: string }[], steps: [] as string[] })
if (!isNew) {
  const { data } = await useFetch<{ dish: DishDetail }>(`/api/admin/dishes/${route.params.id}`)
  if (data.value?.dish) Object.assign(form, { ...data.value.dish, categoryIds: data.value.dish.categories.map(item => item.id), ingredients: data.value.dish.ingredients.map(item => ({ ingredientId: item.id, amount: item.amount, unit: item.unit, note: item.note })), steps: data.value.dish.steps.map(item => item.content) })
}
const allCategories = computed(() => categoryData.value?.categories.flatMap(item => [item, ...item.children]) || [])
const saving = ref(false)
const errorMessage = ref('')
const uploading = ref(false)
const imagePreviewUrl = ref<string | null>(null)
const quickIngredientOpen = ref(false)
const quickIngredientSaving = ref(false)
const quickIngredientError = ref('')
const quickIngredient = reactive({ name: '', defaultUnit: '克' })
const quickIngredientTarget = ref<typeof form.ingredients[number] | null>(null)
function addIngredient() { form.ingredients.push({ ingredientId: null, amount: 1, unit: '克', note: '' }) }
function addIngredientWithQuickCreate() { const row = { ingredientId: null, amount: 1, unit: '克', note: '' }; form.ingredients.push(row); quickIngredientTarget.value = row; quickIngredientOpen.value = true; quickIngredientError.value = '' }
function selectIngredient(row: typeof form.ingredients[number]) { const option = ingredientData.value?.ingredients.find(item => item.id === row.ingredientId); if (option) row.unit = option.defaultUnit }
async function createQuickIngredient() {
  quickIngredientSaving.value = true; quickIngredientError.value = ''
  try {
    const result = await $fetch<{ ingredient: IngredientOption }>('/api/admin/ingredients', { method: 'POST', body: quickIngredient })
    ingredientData.value?.ingredients.push(result.ingredient)
    if (quickIngredientTarget.value) { quickIngredientTarget.value.ingredientId = result.ingredient.id; quickIngredientTarget.value.unit = result.ingredient.defaultUnit }
    Object.assign(quickIngredient, { name: '', defaultUnit: '克' }); quickIngredientOpen.value = false
  } catch (error: any) { quickIngredientError.value = error?.data?.statusMessage || error?.data?.message || '快捷添加失败' }
  finally { quickIngredientSaving.value = false }
}
async function uploadImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return
  uploading.value = true
  const localPreviewUrl = URL.createObjectURL(file)
  imagePreviewUrl.value = localPreviewUrl
  try {
    const body = new FormData(); body.append('file', file)
    const result = await $fetch<{ url: string }>('/api/admin/uploads/image', { method: 'POST', body })
    form.imageUrl = result.url
    imagePreviewUrl.value = result.url
  } catch (error: any) {
    imagePreviewUrl.value = null
    errorMessage.value = error?.data?.statusMessage || error?.data?.message || '图片上传失败'
  } finally {
    URL.revokeObjectURL(localPreviewUrl)
    uploading.value = false
  }
}
async function save() {
  saving.value = true; errorMessage.value = ''
  try {
    const body = { ...form, ingredients: form.ingredients.filter(item => item.ingredientId).map(item => ({ ...item, ingredientId: item.ingredientId as number })), steps: form.steps.filter(Boolean) }
    if (isNew) { const result = await $fetch<{ id: number }>('/api/admin/dishes', { method: 'POST', body }); await navigateTo(`/admin/dishes/${result.id}`) }
    else { await $fetch(`/api/admin/dishes/${route.params.id}`, { method: 'PATCH', body }); await navigateTo('/admin/dishes') }
  } catch (error: any) { errorMessage.value = error?.data?.statusMessage || error?.data?.message || '菜品保存失败' }
  finally { saving.value = false }
}
async function removeDish() {
  if (form.status === 'PUBLISHED') { errorMessage.value = '请先将菜品状态改为“暂时收起”并保存，再删除。'; return }
  if (!window.confirm(`确定要删除「${form.name}」吗？删除后菜品资料将无法恢复，但历史订单仍会保留。`)) return
  saving.value = true; errorMessage.value = ''
  try { await $fetch(`/api/admin/dishes/${route.params.id}`, { method: 'DELETE' }); await navigateTo('/admin/dishes') }
  catch (error: any) { errorMessage.value = error?.data?.statusMessage || error?.data?.message || '菜品删除失败' }
  finally { saving.value = false }
}
</script>

<template>
  <form class="mx-auto max-w-6xl" @submit.prevent="save">
    <header class="flex flex-wrap items-end justify-between gap-4"><div><p class="font-black tracking-widest text-ink/60">DISH LAB</p><h1 class="text-3xl font-black">{{ isNew ? '研究一道新菜' : '编辑菜品档案' }}</h1></div><div class="flex flex-wrap gap-3"><NuxtLink to="/admin/dishes" class="sticker-button inline-flex items-center bg-white px-5">返回</NuxtLink><button v-if="!isNew" type="button" class="sticker-button bg-peach px-5 text-danger" :disabled="saving" @click="removeDish">删除菜品</button><button class="sticker-button bg-lemon px-6" :disabled="saving">{{ saving ? '装盘中…' : '保存菜品' }}</button></div></header>
    <p v-if="errorMessage" class="sticker-card mt-5 bg-peach p-4 font-bold text-danger">{{ errorMessage }}</p>
    <div class="mt-7 grid gap-6 xl:grid-cols-[1fr_22rem]">
      <div class="space-y-6">
        <section class="sticker-card p-5"><h2 class="text-xl font-black">基本资料</h2><div class="mt-4 grid gap-4 sm:grid-cols-2"><label class="font-bold">菜名<input v-model="form.name" class="form-field mt-1" required maxlength="48"></label><label class="font-bold">菜品状态<select v-model="form.status" class="form-field mt-1"><option value="IDEA">待试做 🍳</option><option value="TRIED">已试做 ✨</option><option value="NEEDS_POLISH">待完善 🛠️</option><option value="PUBLISHED">已上架啦</option><option value="OFF_SHELF">暂时收起</option></select><span v-if="!isNew" class="mt-1 block text-sm font-semibold text-ink/60">要删除菜品，请先选择“暂时收起”并保存。</span></label><label class="font-bold sm:col-span-2">一句诱人的介绍<textarea v-model="form.description" class="form-field mt-1 min-h-24" maxlength="500" /></label><label class="font-bold">预计用时（分钟）<input v-model.number="form.cookingMinutes" class="form-field mt-1" type="number" min="1"></label><label class="font-bold">难度<select v-model="form.difficulty" class="form-field mt-1"><option value="EASY">轻松拿捏</option><option value="MEDIUM">认真发挥</option><option value="HARD">大厨挑战</option></select></label></div></section>
        <section class="sticker-card p-5"><div class="flex flex-wrap items-center justify-between gap-3"><h2 class="text-xl font-black">详细食材用量</h2><div class="flex gap-3"><button type="button" class="font-black underline" @click="addIngredient">＋ 加食材</button><button type="button" class="font-black text-mint underline" @click="addIngredientWithQuickCreate">＋ 快捷添加食材</button></div></div><p class="mt-1 text-sm font-semibold text-ink/60">单位由食材储藏室统一维护，菜谱这里只填写每份用量。</p><div v-if="quickIngredientOpen" class="mt-4 rounded-xl border-2 border-ink bg-lemon p-3"><p class="font-black">新食材，马上住进储藏室</p><div class="mt-2 grid gap-2 sm:grid-cols-[1fr_7rem_auto]"><input v-model.trim="quickIngredient.name" class="form-field" placeholder="食材名称" maxlength="32"><input v-model.trim="quickIngredient.defaultUnit" class="form-field" placeholder="默认单位" maxlength="12"><button type="button" class="sticker-button bg-mint px-4" :disabled="quickIngredientSaving || !quickIngredient.name" @click="createQuickIngredient">{{ quickIngredientSaving ? '添加中…' : '添加并选中' }}</button></div><p v-if="quickIngredientError" class="mt-2 font-bold text-danger">{{ quickIngredientError }}</p></div><div v-for="(row, index) in form.ingredients" :key="index" class="mt-4 grid gap-2 rounded-xl border-2 border-ink/25 p-3 sm:grid-cols-[1fr_7rem_6rem_1fr_auto]"><select v-model="row.ingredientId" class="form-field" required @change="selectIngredient(row)"><option :value="null">选择食材</option><option v-for="item in ingredientData?.ingredients" :key="item.id" :value="item.id">{{ item.name }}</option></select><input v-model.number="row.amount" class="form-field" type="number" min="0.01" step="0.01"><input :value="row.unit" class="form-field bg-ink/5" readonly aria-label="食材单位"><input v-model="row.note" class="form-field" placeholder="备注，如切丁"><button type="button" class="px-2 text-xl font-black text-danger" @click="form.ingredients.splice(index, 1)">×</button></div><p v-if="!form.ingredients.length" class="mt-4 text-sm font-semibold text-ink/50">还没填用料，也可以先保存待试做。</p></section>
        <section class="sticker-card p-5"><div class="flex items-center justify-between"><h2 class="text-xl font-black">食谱步骤</h2><button type="button" class="font-black underline" @click="form.steps.push('')">＋ 加一步</button></div><div v-for="(_, index) in form.steps" :key="index" class="mt-3 flex items-start gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-mint font-black">{{ index + 1 }}</span><textarea v-model="form.steps[index]" class="form-field min-h-20" required maxlength="1000" /><button type="button" class="pt-2 text-xl font-black text-danger" @click="form.steps.splice(index, 1)">×</button></div></section>
      </div>
      <aside class="space-y-6">
        <section class="sticker-card overflow-hidden"><div class="aspect-square bg-mint-soft"><img v-if="imagePreviewUrl || form.imageUrl" :src="imagePreviewUrl || form.imageUrl || undefined" alt="菜品预览" class="h-full w-full object-cover"><div v-else class="grid h-full place-items-center text-7xl">📸</div></div><label class="block cursor-pointer border-t-2 border-ink bg-lemon p-4 text-center font-black">{{ uploading ? '上传中…' : '上传菜品照片' }}<input class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" :disabled="uploading" @change="uploadImage"></label></section>
        <section class="sticker-card bg-mint p-5"><h2 class="text-xl font-black">住进哪些分类？</h2><div class="mt-3 space-y-2"><label v-for="item in allCategories" :key="item.id" class="flex cursor-pointer items-center gap-2 rounded-lg bg-white/60 p-2 font-bold"><input v-model="form.categoryIds" type="checkbox" :value="item.id" class="size-5 accent-[var(--color-ink)]"><span>{{ item.parentId ? '↳ ' : '' }}{{ item.name }}</span></label></div><p v-if="!allCategories.length" class="mt-3 font-semibold">先去创建分类吧。</p></section>
      </aside>
    </div>
  </form>
</template>
