import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  assetsInclude: ['**/*.md'], // 支持md文件
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8080,
    // 代理请求，前端以 /images 开头的请求会被代理到后端的 3000 端口上
    proxy: {
      '/images': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
