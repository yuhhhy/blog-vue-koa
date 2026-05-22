import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteCompression from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const backendTarget = 'http://localhost:3000'
const backendProxy = {
  '/api': {
    target: backendTarget,
    changeOrigin: true
  },
  '/images': {
    target: backendTarget,
    changeOrigin: true
  },
  '/mds': {
    target: backendTarget,
    changeOrigin: true
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // Gzip 压缩插件
    viteCompression({
      verbose: true // 是否在控制台输出压缩结果
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './node_modules')
    }
  },
  build: {
    sourcemap: mode === 'analyze'
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
    // 项目启动端口
    port: 8096,
    // 代理请求，前端以/images开头的请求会被代理到后端的3000端口上 (http://localhost:3000/images)
    // 实际生产环境需要在 Nginx上配置代理
    proxy: backendProxy
  },
  // 本地预览生产构建时，模拟线上反向代理。
  preview: {
    proxy: backendProxy
  }
}))
