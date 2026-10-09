import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['nuxt-auth-utils'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  runtimeConfig: {
    databasePath: process.env.DB_FILE_PATH || './data/yuezi.db',
    migrationsPath: process.env.DB_MIGRATIONS_PATH || './server/database/migrations',
    uploadsPath: process.env.UPLOADS_PATH || './uploads',
    bootstrapAdminUsername: process.env.BOOTSTRAP_ADMIN_USERNAME || 'admin',
    bootstrapAdminPassword: process.env.BOOTSTRAP_ADMIN_PASSWORD || '',
    bootstrapAdminDisplayName: process.env.BOOTSTRAP_ADMIN_DISPLAY_NAME || '本大厨',
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
    vapidSubject: process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    public: {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || ''
    },
    session: {
      maxAge: 60 * 60 * 24 * 30,
      cookie: {
        secure: process.env.SESSION_COOKIE_SECURE !== 'false'
      }
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '悦子吃什么',
      meta: [
        { name: 'description', content: '选出今天的快乐来源。' },
        { name: 'theme-color', content: '#8de1c3' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: '悦子吃什么' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  },
  nitro: {
    externals: {
      external: ['better-sqlite3']
    }
  }
})
