const CACHE = 'yuezi-shell-v1'
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/manifest.webmanifest','/icon-192.png','/icon-512.png','/apple-touch-icon.png']))))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !(url.pathname.startsWith('/_nuxt/') || ['/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'].includes(url.pathname))) return
  event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response }).catch(() => caches.match(event.request)))
})
self.addEventListener('push', event => {
  const data = event.data?.json() || { title: '悦子吃什么', content: '有一条新消息' }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.content, icon: '/icon-192.png', badge: '/icon-192.png', data: { link: data.link || '/notifications' } }))
})
self.addEventListener('notificationclick', event => { event.notification.close(); event.waitUntil(clients.openWindow(event.notification.data?.link || '/notifications')) })
