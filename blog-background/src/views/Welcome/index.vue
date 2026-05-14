<script setup>
const quickActions = [
  {
    title: '新建文章',
    desc: '进入编辑器完成正文、封面、标签和发布信息。',
    link: '/article/create',
    accent: 'blue'
  },
  {
    title: '文章列表',
    desc: '维护已发布文章，调整前台展示内容。',
    link: '/article/list',
    accent: 'emerald'
  },
  {
    title: '待审评论',
    desc: '处理新评论与回复，让互动内容保持干净。',
    link: '/comment/pending',
    accent: 'amber'
  },
  {
    title: '数据大屏',
    desc: '进入独立 ECharts 页面查看访问、评论和发布趋势。',
    link: '/dashboard',
    accent: 'violet'
  }
]

const features = [
  {
    title: '内容发布链路',
    text: '从 Markdown 写作、封面上传到文章统计维护，后台把发布流程收束到一个清晰入口。'
  },
  {
    title: '互动与权限管理',
    text: '评论审核、友链维护和用户管理集中在侧边栏中，适合日常巡检和低频管理。'
  },
  {
    title: '资源分区整理',
    text: '图片、Markdown、大文件分开管理，减少素材散落，方便后续复用和清理。'
  }
]

const steps = [
  '写作与素材准备',
  '发布并同步统计',
  '审核评论与友链',
  '进入数据大屏复盘'
]
</script>

<template>
  <main class="welcome-page">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Blog Admin Console</p>
        <h1>一曝十寒博客后台</h1>
        <p class="hero-text">
          轻量首页只保留入口、说明和工作流，不再首屏加载 ECharts。数据大屏已经拆到独立页面，
          需要分析趋势时再进入，平时打开后台会更快、更安静。
        </p>
        <div class="hero-actions">
          <RouterLink to="/article/create" class="primary-action">开始写作</RouterLink>
          <RouterLink to="/dashboard" class="secondary-action">查看数据大屏</RouterLink>
        </div>
      </div>

      <aside class="hero-card">
        <div class="status-line">
          <span></span>
          <strong>首屏轻量化</strong>
        </div>
        <p>图表、热力图和 ECharts 初始化已移出默认路径。</p>
        <div class="metric-row">
          <div>
            <strong>0</strong>
            <span>首屏图表</span>
          </div>
          <div>
            <strong>1</strong>
            <span>独立大屏</span>
          </div>
        </div>
      </aside>
    </section>

    <section class="quick-grid" aria-label="快捷入口">
      <RouterLink
        v-for="item in quickActions"
        :key="item.title"
        :to="item.link"
        class="quick-card"
        :class="`quick-card--${item.accent}`"
      >
        <span>{{ item.title }}</span>
        <p>{{ item.desc }}</p>
      </RouterLink>
    </section>

    <section class="lower-grid">
      <div class="feature-panel">
        <div class="section-title">
          <p>Capabilities</p>
          <h2>后台现在负责什么</h2>
        </div>
        <div class="feature-list">
          <article v-for="feature in features" :key="feature.title">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.text }}</p>
          </article>
        </div>
      </div>

      <div class="workflow-panel">
        <div class="section-title">
          <p>Workflow</p>
          <h2>日常维护路径</h2>
        </div>
        <ol>
          <li v-for="(step, index) in steps" :key="step">
            <span>{{ index + 1 }}</span>
            <p>{{ step }}</p>
          </li>
        </ol>
      </div>
    </section>
  </main>
</template>

<style scoped>
.welcome-page {
  min-height: 100%;
  padding: 32px;
  color: #172033;
  background:
    linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(239, 246, 255, 0.9)),
    url('/src/assets/avatar.jpg') right 36px top 36px / 170px 170px no-repeat;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  padding: 34px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.eyebrow,
.section-title p {
  margin: 0 0 10px;
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0;
  font-size: 2.35rem;
  line-height: 1.2;
}

.hero-text {
  max-width: 740px;
  margin: 18px 0 0;
  color: #475569;
  font-size: 1rem;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 6px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-action {
  color: #fff;
  background: #1d4ed8;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.22);
}

.secondary-action {
  color: #1d4ed8;
  border: 1px solid rgba(37, 99, 235, 0.28);
  background: #fff;
}

.primary-action:hover,
.secondary-action:hover,
.quick-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.12);
}

.hero-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px;
  border-radius: 8px;
  color: #fff;
  background: #0f172a;
}

.status-line {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
}

.status-line span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.16);
}

.hero-card p {
  margin: 22px 0;
  color: #cbd5e1;
  line-height: 1.8;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.metric-row div {
  padding: 14px;
  border: 1px solid rgba(226, 232, 240, 0.16);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
}

.metric-row strong {
  display: block;
  font-size: 1.45rem;
}

.metric-row span {
  display: block;
  margin-top: 4px;
  color: #cbd5e1;
  font-size: 0.86rem;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.quick-card,
.feature-panel,
.workflow-panel {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
}

.quick-card {
  min-height: 136px;
  padding: 20px;
  color: inherit;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quick-card span {
  font-size: 1.08rem;
  font-weight: 800;
}

.quick-card p {
  margin: 14px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.quick-card--blue {
  border-top: 4px solid #2563eb;
}

.quick-card--emerald {
  border-top: 4px solid #10b981;
}

.quick-card--amber {
  border-top: 4px solid #f59e0b;
}

.quick-card--violet {
  border-top: 4px solid #7c3aed;
}

.lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 22px;
  margin-top: 22px;
}

.feature-panel,
.workflow-panel {
  padding: 24px;
}

.section-title h2 {
  margin: 0;
  font-size: 1.42rem;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.feature-list article {
  padding: 18px;
  border-radius: 8px;
  background: #f8fafc;
}

.feature-list h3 {
  margin: 0 0 10px;
  font-size: 1.02rem;
}

.feature-list p,
.workflow-panel li p {
  margin: 0;
  color: #64748b;
  line-height: 1.75;
}

.workflow-panel ol {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.workflow-panel li {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.workflow-panel li span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #1d4ed8;
  font-weight: 800;
  background: #dbeafe;
}

@media (max-width: 1200px) {
  .hero,
  .lower-grid {
    grid-template-columns: 1fr;
  }

  .quick-grid,
  .feature-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .welcome-page {
    padding: 18px;
  }

  .hero {
    padding: 24px;
  }

  .hero h1 {
    font-size: 1.85rem;
  }

  .quick-grid,
  .feature-list {
    grid-template-columns: 1fr;
  }
}
</style>
