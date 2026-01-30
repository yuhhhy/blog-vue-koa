import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteCompression from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import viteImagemin from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Gzip 压缩插件
    viteCompression({
      verbose: true, // 是否在控制台输出压缩结果
    }),
    // 图片压缩插件
    viteImagemin({
      // 添加过滤器排除banner.jpg
      filter: /^(?!.*banner).*\.(jpe?g|png|gif|webp|svg)$/i,

      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 20,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: "removeViewBox",
          },
          {
            name: "removeEmptyAttrs",
            active: false,
          },
        ],
      },
    }),
    // 按需自动导入 Element Plus 组件和相关 API
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // 只是开发环境 Vite启动的开发服务器的配置
  // 注意：这不是生产环境的服务器配置
  server: {
    port: 8080,
    // 代理请求，前端以/images开头的请求会被代理到后端的3000端口上 (http://localhost:3000/images)
    // 实际生产环境需要在 Nginx上配置代理
    proxy: {
      "/images": {
        target: "http://localhost:3000", // 后端接口地址
        changeOrigin: true,
      },
      "/feed": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/feed/, "/feed.xml"),
      },
    },
  },
})