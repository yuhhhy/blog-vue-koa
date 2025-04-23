## 个人博客说明
+ 项目结构
my-blog/
├─ .vscode
├─ node_modules
├─ public         // 静态资源
├─ server/        // Express 后端项目
│   ├─ src/
│   │   ├─ config/       // 配置文件
│   │   ├─ controllers/  // 控制器，设置响应数据、状态码
│   │   ├─ models/       // MongoDB 模型
│   │   ├─ routes/       // 路由文件，配置Api
│   │   ├─ middlewares/  // 自定义中间件
│   │   └─ app.js        // 主入口文件
│   ├─ .env              // 环境变量
│   └─ package.json
├─ src/          // Vue3 前端项目
│   ├─ api/              // api接口
│   ├─ assets/           // 静态资源
│   ├─ components/       // 组件
│   ├─ router/           // 前端路由
│   ├─ stores/           // Pinia
|   ├─ views/            // 页面组件
|   ├─ App.vue           // 根组件
|   └─ main.js           // 
├─ .gitignore
├─ index.html            // 入口文件
├─ package-lock.json     // 锁定版本
├─ package.json          // 统一管理脚本
├─ README.md
└─ vite.config.js

+ 技术栈
    + 创建项目
            `npm create vite@latest my-blog`
    + 前端
        - Vue3：组件化开发
        - Vite：构建打包工具
        - Pinia：状态管理工具
        - VueRouter：管理路由
        - Element-Plus：UI 库 
        - Vitest：测试
        + 安装依赖
        ```
            npm install vue-router@4 pinia element-plus axios
            npm install -D sass
        ```
    + 后端
        - Nodejs/Koa：后端api
        + 安装依赖
        ```
            npm install koa @koa/router koa-static koa-bodyparser mongoose
        ```
        + nodemon
            npm install nodemon --save-dev
            "server": "nodemon server/app.js"
            这样当修改服务器代码时，服务器会自动重启
    + 数据库
        - MongoDB
        - 启动数据库
            在命令行中输入 services.msc，找到 MongoDB 并启动服务
        - 关闭数据库连接

        + 使用数据库
            cmd --> 输入 mongosh
            show databases
            use blog（数据库名）
            blog> show collections（模型名） --> blogs
            db.blogs.find().pretty()

        + 数据
        ```js
            const newBlog = {
                title: String,
                author: String,
                date: Date,
                wordCount: Number,
                content: String,
                coverImage: String,
                tags: Array 
            }
        ```

    + 前后端通信
        - 后端路由定义
            - server/routes/api.js



    - monorepo

+ 博客路由
    - home
    - archive
    - about
    - (Github)

+ 后期添加
    SSR

## 效果实现
+ span 内的文字左右居中     text-align: center
+ 图片保持原大小和比例       object-fit: cover
+ 写成的markdown转html      markdown-it 插件，v-html + CSS module