# 项目计划

## 文章目录（TOC）

### 使用的库

使用 `markdown-it-anchor` 为 Markdown 标题生成稳定、唯一的 `id`。暂不使用维护较少的 `markdown-it-toc-and-anchor`。

### 如何使用

当前文章正文是 `blogData.content` 中的 Markdown 字符串，并通过 `markdown-it` 渲染为 HTML。

接入 `markdown-it-anchor` 后，在同一次解析中：

1. 为 `h2`–`h4` 标题生成锚点 `id`。
2. 从 Markdown tokens 中提取标题文字、层级和锚点。
3. 将提取结果传给独立的 `ArticleToc` 组件。

### 用途

在文章详情页展示目录，支持章节跳转、URL hash 定位和当前阅读章节高亮。
