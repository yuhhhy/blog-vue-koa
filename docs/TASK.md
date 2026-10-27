# Tasks

## CI/CD 待办

> 记录日期：2026-10-24
> 当前先不处理，后续按优先级逐项完成。

- [ ] **P0：轮换已公开的 JWT 签名密钥**
  - `blog-server/config/key.js` 存在硬编码密钥，公开仓库可直接读取。
  - 改为从服务器环境变量读取，轮换后重新部署，使现有 Token 失效。

- [x] **P1：排查 GitHub Actions 到服务器的 SCP 传输失败**
  - 最近两次部署均失败在 `Copy package to server` 步骤。
  - 2026-07-28 运行中，约 11 MB 压缩包传输卡住约 16 分钟，最终收到退出信号 143。
  - 本机已于 2026-10-24 通过 `tencent-cloud` SSH 配置成功连接 `root@42.192.41.225:22`。
  - 后续检查服务器磁盘、`/tmp` 权限、SSH/SCP 限制、防火墙和网络质量。
  - 2026-10-24：已改为可重试的 `rsync` 传输，完整 15 MB 发布目录实测传输成功。

- [x] **P1：改为可回滚的原子部署**
  - 不再先删除 `/var/www/frontend`、`admin` 和 `server`。
  - 先部署到独立的 `releases/<commit>` 目录，安装依赖并验证后，再原子切换 `current` 软链接。
  - 保留上一版本，健康检查失败时自动回滚。

- [x] **P1：避免并发部署竞态**
  - 为 GitHub Actions 增加生产环境 `concurrency` 锁。
  - 使用包含提交 SHA 的唯一压缩包名，不再共用 `/tmp/deploy.tar.gz`。

- [x] **P1：增加部署后验证**
  - 切换前先在 Caddy 容器中验证 Caddyfile。
  - 重启后检查 PM2 进程状态和 HTTP 健康接口。
  - 验证失败时标记部署失败并回滚。

- [x] **P2：将生产环境密钥移出部署包**
  - 不再把含 `EMAIL_PASS` 的 `.env` 打入 `deploy.tar.gz`。
  - 在服务器上以独立、受限权限的环境文件或密钥管理方式注入。
  - 部署后删除服务器临时压缩包。

- [ ] **P2：完善 CI 和仓库保护**
  - 拆分 CI 与生产部署，为 PR 增加前端构建、lint、测试和后端启动检查。
  - 保护 `main` 分支，禁止未经检查的直接部署。
  - 在部署 Job 上使用已创建的 GitHub `Production` Environment。

- [x] **P2：锁定 GitHub Actions 依赖**
  - 将 `appleboy/scp-action@master` 和其他 Action 锁定到已核验的完整 commit SHA。
  - 显式设置最小 `permissions`，例如 `contents: read`。
