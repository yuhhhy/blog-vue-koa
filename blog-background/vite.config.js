import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 设置src别名
      '@': path.resolve(__dirname, './src') 
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 这里是全局引入的scss文件
        additionalData: '@use "@/style/variables.scss" as *;'
      }
    }
  },
  server: {
    // 启动端口
    port: 8096,
  }
})
