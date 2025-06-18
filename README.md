## 技术栈
### 前端
- Vue3
- VueRouter
- Axios
- Pinia
- Sass
- Element-Plus
- Vite
### 后端
- Koa3
- MongoDB
- mongoose
## 后台管理
- Vue3
- Element-Plus
- Tailwind CSS


## 项目预览
在线地址: 
http://yuhhhy.cn
在线地址（后台管理）: 
http://admin.yuhhhy.cn

### 首页
![home](/images/doc_md-1.jpg)
### 归档页（黑暗模式展示）
![archive](/images/doc_md-2.jpg)
### 文章详情页
![blog](/images/doc_md-3.jpg)

## 实现功能
### 整体
- 博客
- 博客列表
- 博客归档
- 发表和显示评论
- 关于页面
- 友链页面
- 适配移动端
- 更多功能开发中……

### 后端
- 博客API
- 博客内容API
- 网站数据API
- 评论API
- 用户API
- 访客API

## 项目结构
```
blog-vue-koa/
├─ blog-background/         // Vue 博客后台管理
│   ├─ src/                     // 项目源码
│   │   ├─ api/                 // 前端api接口
│   │   ├─ assets/              // 前端静态资源
│   │   ├─ components/          // Vue组件
│   │   ├─ config/              // 环境配置
│   │   ├─ Layout/              // 页面基础布局
│   │   ├─ router/              // 路由
│   │   ├─ stores/              // Pinia
│   │   ├─ style/               // 基础样式
│   │   ├─ utils/               // 工具函数
│   │   ├─ views/               // Vue页面
│   │   ├─ App.vue              // 根组件
│   │   └─ main.js              // 初始化Vue实例的入口文件
│   ├─ index.html               // 项目入口文件
│   ├─ package-lock.json
│   ├─ package.json             // 项目依赖
│   ├─ ...                      // 其他配置文件
│   └─ vite.config.js           // vite配置文件
├─ blog-client/             // Vue 博客前端
│   ├─ src/                     // 项目源码
│   │   ├─ api/                 // 前端api接口
│   │   ├─ assets/              // 前端静态资源
│   │   ├─ components/          // Vue组件
│   │   ├─ router/              // 前端路由
│   │   ├─ stores/              // Pinia
│   │   ├─ utils/               // 工具函数
│   │   ├─ views/               // Vue页面
│   │   ├─ App.vue              // 根组件
│   │   └─ main.js              // 初始化Vue实例的入口文件
│   ├─ index.html               // 项目入口文件
│   ├─ package-lock.json
│   ├─ package.json             // 项目依赖
│   └─ vite.config.js           // vite配置文件
├─ blog-server/             // Koa 后端项目
│   │   ├─ config/              // 配置文件
│   │   ├─ controllers/         // 控制器
│   │   ├─ middlewares/         // 中间件
│   │   ├─ models/              // 数据模型
│   │   ├─ routes/              // 路由定义
│   │   ├─ app.js               // 应用主入口文件
│   │   ├─ package-lock.json
│   |   └─ package.json         // 项目依赖
├─ images/                  // 图片资源
├─ .gitignore                   // git忽略文件
├─ LICENSE                      // 开源协议
├─ package-lock.json            // 锁定版本
├─ package.json                 // 统一管理脚本
└─  README.md                   // 项目说明文档
```


## 开发指南
1. 克隆项目
```bash
git clone https://github.com/yuhhhy/blog-vue-koa.git
```

2. 安装依赖
- 下载MongoDB并启动MongoDB服务
https://www.mongodb.com/try/download/community

- 安装项目依赖
```
cd blog-vue-koa
npm run install-all
```

3. 启动项目
```bash
npm run start
```

4. 访问项目
```bash
# 前端
http://localhost:8080/
# 后台
http://localhost:8096/
```