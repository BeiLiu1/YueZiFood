<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { data, refresh } = await useFetch<any>('/api/notifications')
const config = useRuntimeConfig(); const pushState = ref<'idle' | 'working' | 'done' | 'unsupported'>('idle')
async function readAll() { await $fetch('/api/notifications/read-all', { method: 'POST' }); await refresh() }
function toBytes(value: string) { const padded = `${value}${'='.repeat((4 - value.length % 4) % 4)}`.replace(/-/g, '+').replace(/_/g, '/'); return Uint8Array.from(atob(padded), char => char.charCodeAt(0)) }
async function enablePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !config.public.vapidPublicKey) { pushState.value = 'unsupported'; return }
  pushState.value = 'working'
  try { const registration = await navigator.serviceWorker.ready; const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(config.public.vapidPublicKey) }); await $fetch('/api/push/subscribe', { method: 'POST', body: subscription.toJSON() }); pushState.value = 'done' } catch { pushState.value = 'unsupported' }
}
</script>

<template><main class="mx-auto min-h-screen max-w-lg p-5 pb-28"><header class="flex items-end justify-between py-3"><div><p class="text-xs font-black tracking-[0.2em] text-ink/55">MESSAGES</p><h1 class="text-3xl font-black">小喇叭广播</h1></div><button v-if="data?.unreadCount" class="font-black underline" @click="readAll">全部已读</button></header><section class="sticker-card mt-5 bg-peach p-4"><div class="flex items-center justify-between gap-3"><div><strong>手机消息提醒</strong><p class="text-sm font-semibold text-ink/60">添加到主屏幕后可开启推送</p></div><button class="sticker-button shrink-0 bg-lemon px-4" :disabled="pushState === 'working' || pushState === 'done'" @click="enablePush">{{ pushState === 'done' ? '已开启' : pushState === 'working' ? '开启中…' : '开启' }}</button></div><p v-if="pushState === 'unsupported'" class="mt-2 text-sm font-bold text-danger">请先配置域名 HTTPS 和 VAPID 密钥，并从主屏幕打开应用。</p></section><section class="mt-6 space-y-4"><NuxtLink v-for="item in data?.notifications" :key="item.id" :to="item.link || '/notifications'" class="sticker-card block p-5" :class="item.readAt ? 'bg-white' : 'bg-lemon'"><div class="flex items-center justify-between"><h2 class="font-black">{{ item.title }}</h2><span v-if="!item.readAt" class="size-3 rounded-full border border-ink bg-peach"></span></div><p class="mt-2 text-sm font-semibold text-ink/65">{{ item.content }}</p></NuxtLink><div v-if="!data?.notifications.length" class="sticker-card bg-mint p-8 text-center"><div class="text-6xl">🔕</div><p class="mt-3 text-xl font-black">暂时没有新消息</p></div></section></main></template>
