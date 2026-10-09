export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/login')
  }

  if (!user.value?.roles.includes('ADMIN')) {
    return navigateTo('/')
  }
})
