<script setup lang="ts">
const { theme, setTheme } = useGlobalTheme()
const { data } = await useFetch<{ theme: 'peach-kitchen' | 'mint-bento' }>('/api/settings/theme', {
  key: 'global-ui-theme-fetch'
})
setTheme(data.value?.theme || 'mint-bento')

useHead(() => ({
  htmlAttrs: { 'data-theme': theme.value },
  meta: [{ name: 'theme-color', content: theme.value === 'peach-kitchen' ? '#ff8066' : '#8de1c3' }]
}))
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
