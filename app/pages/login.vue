<script setup lang="ts">
const { loggedIn, user, fetch: refreshSession } = useUserSession()

if (loggedIn.value) {
  await navigateTo(user.value?.roles.includes('ADMIN') ? '/admin' : '/')
}

const form = reactive({ username: '', password: '' })
const pending = ref(false)
const errorMessage = ref('')

async function submit() {
  pending.value = true
  errorMessage.value = ''

  try {
    const result = await $fetch<{ user: { roles: string[] } }>('/api/auth/login', {
      method: 'POST',
      body: form
    })
    await refreshSession()
    await navigateTo(result.user.roles.includes('ADMIN') ? '/admin' : '/')
  }
  catch {
    errorMessage.value = '暗号不对哦，再想想？'
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="mx-auto grid min-h-screen max-w-6xl items-center gap-8 p-5 md:grid-cols-2 md:p-10">
    <section class="hidden md:block" aria-labelledby="brand-title">
      <div class="theme-brand-badge mb-5 inline-flex rotate-[-2deg] items-center gap-2 bg-lemon px-4 py-2 font-black">
        <span class="theme-copy--mint">YUEZI'S MENU!</span>
        <span class="theme-copy--peach">YUEZI'S KITCHEN</span>
        <span aria-hidden="true">★</span>
      </div>
      <h1 id="brand-title" class="max-w-xl text-5xl leading-tight font-black lg:text-6xl">
        <span class="theme-copy--mint">今天的快乐，<br>从认真吃饭开始。</span>
        <span class="theme-copy--peach">悦子，今天<br>想吃什么呀？</span>
      </h1>
      <p class="mt-5 max-w-lg text-lg font-semibold text-ink/75">
        <span class="theme-copy--mint">本大厨已上线。登录之后，挑一道最想吃的，把晚餐变成今天的小彩蛋。</span>
        <span class="theme-copy--peach">本大厨已上线，等你翻牌。挑一道最馋的，把今天过得甜一点。</span>
      </p>
      <div class="mt-8 grid max-w-lg grid-cols-3 gap-3" aria-hidden="true">
        <div class="sticker-card rotate-[-2deg] bg-mint p-4 text-center text-4xl">🍜</div>
        <div class="sticker-card rotate-[2deg] bg-peach p-4 text-center text-4xl">🍰</div>
        <div class="sticker-card rotate-[-1deg] bg-lemon p-4 text-center text-4xl">🥤</div>
      </div>
    </section>

    <section class="sticker-card mx-auto w-full max-w-md p-6 md:p-8" aria-labelledby="login-title">
      <div class="mb-6 text-center md:text-left">
        <span class="text-4xl" aria-hidden="true">🍱</span>
        <h1 id="login-title" class="mt-2 text-3xl font-black">开饭前先对暗号</h1>
        <p class="mt-2 font-semibold text-ink/65">登录一次，之后就安心待在主屏幕里。</p>
      </div>

      <form class="space-y-5" @submit.prevent="submit">
        <label class="block font-bold">
          用户名
          <input
            v-model.trim="form.username"
            class="form-field mt-2"
            autocomplete="username"
            maxlength="32"
            required
            placeholder="你的专属称呼"
          >
        </label>

        <label class="block font-bold">
          密码
          <input
            v-model="form.password"
            class="form-field mt-2"
            type="password"
            autocomplete="current-password"
            minlength="8"
            maxlength="128"
            required
            placeholder="至少 8 位"
          >
        </label>

        <p v-if="errorMessage" class="rounded-xl border-2 border-danger bg-peach/35 px-3 py-2 font-bold text-danger" role="alert">
          {{ errorMessage }}
        </p>

        <button class="sticker-button w-full bg-mint px-4 py-3" type="submit" :disabled="pending">
          {{ pending ? '正在核对暗号…' : '进入快乐食堂' }}
        </button>
      </form>
    </section>
  </main>
</template>
