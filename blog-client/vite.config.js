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
  // 只是开发环境 Vite启动的开发服务器的配置
  // 注意：这不是生产环境的服务器配置
  server: {
    port: 8080,
    // 代理请求，前端以/images开头的请求会被代理到后端的3000端口上 (http://localhost:3000/images)
    // 实际生产环境需要在 Nginx上配置代理
    proxy: {
      '/images': {
        target: 'http://localhost:3000', // 后端接口地址
        changeOrigin: true
      }
    }
  }
})