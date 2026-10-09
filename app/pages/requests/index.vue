<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { data, refresh } = await useFetch<any>('/api/requests')
const requests = computed<any[]>(() => data.value?.requests || [])
const form = reactive({ name: '', description: '' }); const sending = ref(false); const errorMessage = ref('')
async function submit() { sending.value = true; try { await $fetch('/api/requests', { method: 'POST', body: form }); Object.assign(form, { name: '', description: '' }); errorMessage.value = ''; await refresh() } catch (error: any) { errorMessage.value = error?.data?.message || '心愿发送失败' } finally { sending.value = false } }
</script>

<template>
  <main class="mx-auto min-h-screen max-w-lg p-5 pb-28">
    <header class="py-3">
      <p class="text-xs font-black tracking-[0.2em] text-ink/55">WISH A DISH</p>
      <h1 class="text-3xl font-black">想吃菜单外的？</h1>
      <p class="mt-2 font-semibold text-ink/65">大胆许愿，大厨会认真研究。</p>
    </header>
    <form class="sticker-card mt-6 bg-peach p-5" @submit.prevent="submit">
      <label class="font-black">想吃什么<input v-model="form.name" class="form-field mt-1" required maxlength="48" placeholder="比如：芋泥麻薯小蛋糕"></label>
      <label class="mt-4 block font-black">再描述一下<textarea v-model="form.description" class="form-field mt-1 min-h-24" maxlength="500" placeholder="味道、口感、在哪里见过…"></textarea></label>
      <p v-if="errorMessage" class="mt-3 font-bold text-danger">{{ errorMessage }}</p>
      <button class="sticker-button mt-5 w-full bg-lemon py-3" :disabled="sending">{{ sending ? '许愿中…' : '把心愿送给大厨 ✨' }}</button>
    </form>
    <section class="mt-8">
      <h2 class="text-xl font-black">我的心愿进度</h2>
      <div class="mt-4 space-y-4">
        <RequestCard v-for="wish in requests" :key="wish.id" :wish="wish" />
      </div>
    </section>
  </main>
</template>
