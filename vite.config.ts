import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 部署路径（仓库名），本地开发用 /
  base: process.env.BASE_URL || '/',

  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 自动从 SVG 源图生成所有尺寸的图标
      pwaAssets: {
        image: 'public/pwa-icon.svg',
      },

      // PWA Manifest
      manifest: {
        name: '🧋 奶茶记录仪',
        short_name: '奶茶记录仪',
        description: '每一杯都是值得收藏的记忆 — 拍照、抠图、生成小票、日历回顾',
        theme_color: '#fbf5ed',
        background_color: '#fbf5ed',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'zh-CN',
      },

      // Service Worker (Workbox)
      workbox: {
        // 预缓存静态资源
        globPatterns: ['**/*.{js,css,html,svg,png,wasm,woff2}'],
        // 运行时缓存：Google Fonts
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // AI 抠图模型文件缓存
          {
            urlPattern: /\.(wasm|data|bin)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ai-models-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },

      // 开发模式也注册 SW（方便调试）
      devOptions: {
        enabled: false, // 开发时不启用 SW，避免缓存干扰热更新
      },
    }),
  ],
  server: {
    host: true,    // 手机局域网测试
    port: 5173,
  },
})
