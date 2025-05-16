import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './node_modules')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 这里是全局引入的scss文件
        additionalData: '@use "@/style/variables.css" as *;'
      }
    }
  },
  server: {
    // 启动端口
    port: 8096,
  }
})
