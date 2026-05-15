<script setup>
const quickActions = [
  {
    title: '进入写作流',
    desc: '从草稿、标签、封面到正文编辑，保留最短发布路径。',
    link: '/article/create',
    code: 'write'
  },
  {
    title: '内容资产库',
    desc: '集中维护文章、Markdown、图片和大文件，降低素材散落成本。',
    link: '/article/list',
    code: 'assets'
  },
  {
    title: '互动审核台',
    desc: '把评论、回复、友链申请纳入可巡检的队列。',
    link: '/comment/pending',
    code: 'review'
  },
  {
    title: '数据观测面',
    desc: '用访问、浏览、评论与发布趋势判断内容状态。',
    link: '/dashboard',
    code: 'signal'
  }
]

const designPrinciples = [
  {
    title: '内容先行',
    text: '后台不是装饰页面，而是把写作、发布、维护这些高频动作压缩到清晰路径里。'
  },
  {
    title: '低噪管理',
    text: '导航、表格、弹窗和提示保持同一套节奏，让日常巡检不被视觉噪声打断。'
  },
  {
    title: '可观测运营',
    text: '数据不是大屏表演，而是辅助判断内容生命力、互动质量和站点变化的信号层。'
  }
]

const systemLayers = [
  '权限与身份',
  '内容发布',
  '素材治理',
  '互动审核',
  '数据反馈'
]

const healthSignals = [
  { label: 'Content', value: 'Structured' },
  { label: 'Review', value: 'Queued' },
  { label: 'Assets', value: 'Indexed' },
  { label: 'Metrics', value: 'Observable' }
]
</script>

<template>
  <main class="welcome-page">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Admin System Philosophy</p>
        <h1>把博客后台设计成一个安静、锋利、可持续的内容控制台。</h1>
        <p class="hero-text">
          这个后台的核心不是堆功能，而是建立一条稳定的内容生产链路：写作有入口，素材有归档，
          互动有审核，数据有反馈。每个模块都应该像开发工具一样直接、克制、可预测。
        </p>
        <div class="hero-actions">
          <RouterLink to="/article/create" class="primary-action">新建文章</RouterLink>
          <RouterLink to="/dashboard" class="secondary-action">查看数据</RouterLink>
        </div>
      </div>

      <aside class="console-card" aria-label="系统状态">
        <div class="console-top">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="console-title">
          <p>system.intent</p>
          <strong>Operate content with clarity.</strong>
        </div>
        <div class="signal-list">
          <div v-for="signal in healthSignals" :key="signal.label">
            <span>{{ signal.label }}</span>
            <strong>{{ signal.value }}</strong>
          </div>
        </div>
      </aside>
    </section>

    <section class="quick-grid" aria-label="核心入口">
      <RouterLink
        v-for="item in quickActions"
        :key="item.title"
        :to="item.link"
        class="quick-card"
      >
        <code>{{ item.code }}</code>
        <span>{{ item.title }}</span>
        <p>{{ item.desc }}</p>
      </RouterLink>
    </section>

    <section class="thinking-grid">
      <div class="principles-panel">
        <div class="section-title">
          <p>Design Rules</p>
          <h2>后台管理的设计思路</h2>
        </div>
        <div class="principle-list">
          <article v-for="principle in designPrinciples" :key="principle.title">
            <h3>{{ principle.title }}</h3>
            <p>{{ principle.text }}</p>
          </article>
        </div>
      </div>

      <div class="layers-panel">
        <div class="section-title">
          <p>System Layers</p>
          <h2>模块边界</h2>
        </div>
        <ol>
          <li v-for="(layer, index) in systemLayers" :key="layer">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <p>{{ layer }}</p>
          </li>
        </ol>
      </div>
    </section>
  </main>
</template>

<style scoped>
.welcome-page {
  min-height: 100%;
  color: var(--admin-text);
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 28px;
  padding: 46px;
  overflow: hidden;
  border: 1px solid var(--admin-line);
  border-radius: var(--admin-radius);
  background:
    linear-gradient(135deg, rgba(248, 250, 252, 0.94), rgba(239, 245, 251, 0.86)),
    linear-gradient(90deg, rgba(36, 84, 255, 0.08) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0, 139, 139, 0.06) 1px, transparent 1px);
  background-size: auto, 38px 38px, 38px 38px;
  box-shadow: var(--admin-shadow);
}

.hero::after {
  position: absolute;
  inset: 0 0 auto auto;
  width: 44%;
  height: 100%;
  content: "";
  background: linear-gradient(135deg, transparent 20%, rgba(36, 84, 255, 0.08), rgba(0, 139, 139, 0.1));
  clip-path: polygon(28% 0, 100% 0, 100% 100%, 0 100%);
}

.hero-copy,
.console-card {
  position: relative;
  z-index: 1;
}

.eyebrow,
.section-title p {
  margin: 0 0 12px;
  color: var(--admin-primary);
  font-family: "JetBrains Mono", "SFMono-Regular", monospace;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0;
  text-transform: uppercase;
}

.hero h1 {
  max-width: 820px;
  margin: 0;
  color: var(--admin-ink);
  font-size: clamp(2.2rem, 4vw, 4rem);
  font-weight: 920;
  line-height: 1.08;
}

.hero-text {
  max-width: 760px;
  margin: 20px 0 0;
  color: var(--admin-text-muted);
  font-size: 1rem;
  line-height: 1.95;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: var(--admin-radius-sm);
  font-weight: 850;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-action {
  color: #fff;
  background: var(--admin-primary);
  box-shadow: 0 12px 26px rgba(36, 84, 255, 0.24);
}

.secondary-action {
  color: var(--admin-primary);
  border: 1px solid rgba(36, 84, 255, 0.26);
  background: rgba(248, 250, 252, 0.82);
}

.primary-action:hover,
.secondary-action:hover,
.quick-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--admin-shadow);
}

.console-card {
  align-self: stretch;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--admin-radius);
  color: #fff;
  background:
    linear-gradient(145deg, rgba(15, 23, 36, 0.98), rgba(22, 31, 46, 0.96)),
    radial-gradient(circle at 100% 0, rgba(110, 231, 249, 0.18), transparent 160px);
  box-shadow: 0 22px 52px rgba(15, 23, 36, 0.24);
}

.console-top {
  display: flex;
  gap: 7px;
  margin-bottom: 28px;
}

.console-top span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.28);
}

.console-top span:first-child {
  background: #6ee7f9;
}

.console-title p {
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.42);
  font-family: "JetBrains Mono", "SFMono-Regular", monospace;
  font-size: 12px;
}

.console-title strong {
  display: block;
  max-width: 240px;
  font-size: 1.5rem;
  line-height: 1.3;
}

.signal-list {
  display: grid;
  gap: 10px;
  margin-top: 34px;
}

.signal-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--admin-radius-sm);
  background: rgba(255, 255, 255, 0.055);
}

.signal-list span {
  color: rgba(255, 255, 255, 0.5);
  font-family: "JetBrains Mono", "SFMono-Regular", monospace;
  font-size: 12px;
}

.signal-list strong {
  font-size: 13px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.quick-card,
.principles-panel,
.layers-panel {
  border: 1px solid var(--admin-line);
  border-radius: var(--admin-radius);
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-soft);
}

.quick-card {
  min-height: 154px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quick-card code {
  display: inline-flex;
  margin-bottom: 22px;
  padding: 4px 8px;
  border-radius: 999px;
  color: var(--admin-primary);
  background: var(--admin-primary-soft);
  font-family: "JetBrains Mono", "SFMono-Regular", monospace;
  font-size: 12px;
}

.quick-card span {
  display: block;
  color: var(--admin-ink);
  font-size: 1.08rem;
  font-weight: 850;
}

.quick-card p {
  margin: 12px 0 0;
  color: var(--admin-text-muted);
  line-height: 1.75;
}

.thinking-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 22px;
  margin-top: 22px;
}

.principles-panel,
.layers-panel {
  padding: 24px;
}

.section-title h2 {
  margin: 0;
  color: var(--admin-ink);
  font-size: 1.42rem;
  font-weight: 880;
}

.principle-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.principle-list article {
  min-height: 150px;
  padding: 18px;
  border: 1px solid rgba(21, 30, 43, 0.08);
  border-radius: var(--admin-radius-sm);
  background: var(--admin-surface-muted);
}

.principle-list h3 {
  margin: 0 0 10px;
  color: var(--admin-ink);
  font-size: 1.03rem;
  font-weight: 850;
}

.principle-list p,
.layers-panel li p {
  margin: 0;
  color: var(--admin-text-muted);
  line-height: 1.78;
}

.layers-panel ol {
  display: grid;
  gap: 12px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.layers-panel li {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 46px;
  padding: 0 12px;
  border: 1px solid rgba(21, 30, 43, 0.08);
  border-radius: var(--admin-radius-sm);
  background: rgba(238, 243, 248, 0.76);
}

.layers-panel li span {
  color: var(--admin-primary);
  font-family: "JetBrains Mono", "SFMono-Regular", monospace;
  font-size: 12px;
  font-weight: 850;
}

.layers-panel li p {
  color: var(--admin-text);
  font-weight: 750;
}

@media (max-width: 1200px) {
  .hero,
  .thinking-grid {
    grid-template-columns: 1fr;
  }

  .quick-grid,
  .principle-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 28px;
  }

  .quick-grid,
  .principle-list {
    grid-template-columns: 1fr;
  }
}
</style>
