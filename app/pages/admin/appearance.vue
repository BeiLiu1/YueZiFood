<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })

type UiTheme = 'peach-kitchen' | 'mint-bento'
const { theme, setTheme } = useGlobalTheme()
const saving = ref<UiTheme | null>(null)
const errorMessage = ref('')

const themes: Array<{ code: UiTheme, name: string, subtitle: string }> = [
  { code: 'peach-kitchen', name: '蜜桃小厨房', subtitle: '暖橙 · 奶油白 · 圆润温柔' },
  { code: 'mint-bento', name: '薄荷便当社', subtitle: '薄荷绿 · 贴纸感 · 活泼有趣' }
]

async function chooseTheme(value: UiTheme) {
  if (value === theme.value || saving.value) return
  saving.value = value
  errorMessage.value = ''
  try {
    const result = await $fetch<{ theme: UiTheme }>('/api/admin/settings/theme', {
      method: 'PATCH',
      body: { theme: value }
    })
    setTheme(result.theme)
  } catch (error: any) {
    errorMessage.value = error?.data?.message || '风格切换失败，请再试一次'
  } finally {
    saving.value = null
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <header>
      <p class="font-black tracking-widest text-ink/60">APPEARANCE</p>
      <h1 class="text-3xl font-black">今天穿哪套衣服？</h1>
      <p class="mt-2 font-semibold text-ink/65">这里切换的是全局风格，所有设备刷新后都会统一更新。</p>
    </header>

    <p v-if="errorMessage" class="mt-6 rounded-2xl border border-danger bg-peach/40 p-4 font-bold text-danger" role="alert">{{ errorMessage }}</p>

    <section class="mt-8 grid gap-7 lg:grid-cols-2">
      <article
        v-for="item in themes"
        :key="item.code"
        class="theme-choice relative overflow-hidden"
        :class="[`theme-choice--${item.code === 'peach-kitchen' ? 'peach' : 'mint'}`, theme === item.code ? 'ring-4 ring-current ring-offset-4' : '']"
      >
        <span v-if="theme === item.code" class="theme-current-badge absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-black">当前使用</span>

        <div v-if="item.code === 'peach-kitchen'" class="mt-10 rounded-[1.4rem] bg-[#fffaf5] p-5 shadow-[0_10px_28px_rgb(136_73_59_/_14%)]">
          <div class="flex items-center justify-between"><strong class="text-xl">悦子，今天馋什么？</strong><span class="grid size-10 place-items-center rounded-full bg-[#ff8066] text-white">♥</span></div>
          <p class="mt-1 text-sm text-[#a06a60]">本大厨已上线，等你翻牌</p>
          <div class="mt-5 rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgb(233_184_170_/_35%)]"><div class="text-center text-5xl">🍅🍳</div><strong class="mt-2 block">番茄炒蛋</strong><p class="text-sm text-[#a06a60]">酸酸甜甜，和你一样可爱</p><span class="mt-3 inline-block rounded-full bg-[#ff8066] px-4 py-2 text-sm font-black text-white">就吃它！</span></div>
        </div>

        <div v-else class="mt-10">
          <div class="rounded-xl border-2 border-[#173f35] bg-white p-3 shadow-[4px_4px_0_#173f35]"><strong>YUEZI'S MENU!</strong><span class="float-right">★</span></div>
          <p class="my-3 font-black">任务：选出今晚的快乐来源</p>
          <div class="grid grid-cols-2 gap-3"><div class="rounded-xl border-2 border-[#173f35] bg-[#ffe56b] p-4 shadow-[3px_3px_0_#173f35]"><span class="text-4xl">🍜</span><strong class="mt-2 block">主食基地</strong></div><div class="rounded-xl border-2 border-[#173f35] bg-[#ff9db0] p-4 shadow-[3px_3px_0_#173f35]"><span class="text-4xl">🍰</span><strong class="mt-2 block">甜品星球</strong></div></div>
        </div>

        <div class="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div><h2 class="text-2xl font-black">{{ item.name }}</h2><p class="mt-1 font-semibold opacity-70">{{ item.subtitle }}</p></div>
          <button class="min-h-11 rounded-full px-5 py-2 font-black" :class="item.code === 'peach-kitchen' ? 'bg-[#ff8066] text-white' : 'border-2 border-[#173f35] bg-[#ffe56b]'" :disabled="theme === item.code || saving !== null" @click="chooseTheme(item.code)">{{ theme === item.code ? '正在使用' : saving === item.code ? '切换中…' : '切换到此风格' }}</button>
        </div>
      </article>
    </section>
  </div>
</template>
