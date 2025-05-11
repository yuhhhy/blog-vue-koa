## 技术栈
### 前端
- Vue3
- VueRouter
- Axios
- Pinia
- Sass
- Element-Plus
- Vite
- Vitest
### 后端
- Koa
- MongoDB
- mongoose
- nodemon

## 实现功能
### 整体
- 文章列表
- 文章详情
- 写文章
- 文章评论功能
- 通用Sidebar组件
- Tag组件动画效果

### 后端
- 博客API
- 博客内容API
- 网站数据API
- 评论API

## 项目结构
```
blog-vue-koa/
├─ node_modules/        // 依赖包
├─ client/              // Vue3 + Vite 前端项目
│   ├─ src/                 // 项目源码
│   │   ├─ api/                 // 前端api接口
│   │   ├─ assets/              // 前端静态资源
│   │   ├─ components/          // Vue组件
│   │   ├─ router/              // 前端路由
│   │   ├─ stores/              // Pinia
│   │   ├─ utils/               // 工具函数
│   │   ├─ views/               // Vue页面组件
│   │   ├─ App.vue              // 根组件
│   │   └─ main.js              // 初始化Vue实例的入口文件
│   ├─ index.html           // 项目入口文件
│   ├─ package-lock.json
│   └─ package.json         // 项目依赖
├─ public/              // 静态资源
│   ├─ images               // 图片资源
│   └─ posts                // 文章资源
├─ scripts/             // 脚本
│   └─ generate-posts.js    // 生成文章数据的脚本
├─ server/              // Koa 后端项目
│   │   ├─ config/          // 配置文件
│   │   ├─ controllers/     // 控制器
│   │   ├─ middlewares/     // 中间件
│   │   ├─ models/          // 数据模型
│   │   ├─ routes/          // 路由定义
│   │   ├─ app.js           // 应用主入口文件
│   │   ├─ package-lock.json
│   |   └─ package.json         // 项目依赖
├─ .gitignore            // 忽略文件
├─ package-lock.json     // 锁定版本
├─ package.json          // 统一管理脚本
└─  README.md
```


## 开发指南
1. 安装依赖
```bash
blog-vue-koa> npm install
blog-vue-koa>server npm install
blog-vue-koa>client npm install
```
2. 启动项目
```bash
blog-vue-koa>server npm nodemon app.js
blog-vue-koa>client npm run dev
```
3. 访问项目
```bash
http://localhost:8080/
```