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

## 项目预览

### 首页
![home](/public/images/docs1.jpg)
### 归档页
![archive](/public/images/docs2.jpg)
### 文章详情页
![blog](/public/images/docs3.jpg)

## 实现功能
### 整体
- 博客
- 博客列表
- 博客归档
- 发表和显示评论
- 通用Sidebar组件
- 适配移动端

### 后端
- 博客API
- 博客内容API
- 网站数据API
- 评论API

## 项目结构
```
blog-vue-koa/
├─ client/              // Vue3 + Vite 前端项目
│   ├─ src/                 // 项目源码
│   │   ├─ api/                 // 前端api接口
│   │   ├─ assets/              // 前端静态资源
│   │   ├─ components/          // Vue组件
│   │   ├─ router/              // 前端路由
│   │   ├─ stores/              // Pinia
│   │   ├─ utils/               // 工具函数
│   │   ├─ views/               // Vue页面
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
http://localhost:8080/
```

