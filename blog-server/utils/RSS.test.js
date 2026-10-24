import assert from "node:assert/strict";
import test from "node:test";
import { generateRSS, renderRSSContent, RSS_LIMIT } from "./RSS.js";

const metadata = {
  title: "测试博客",
  url: "https://example.com",
  description: "测试订阅源",
};

const createPost = (index, content = `<p>第 ${index} 篇正文</p>`) => ({
  title: `文章 ${index}`,
  link: `https://example.com/blog/${index}`,
  content,
  publishedAt: new Date(`2026-01-${String(index + 1).padStart(2, "0")}T00:00:00Z`),
  author: "作者",
  coverImage: `https://example.com/images/${index}.webp`,
});

test("RSS exposes full article HTML through both common content fields", () => {
  const content = "<h2>完整标题</h2><p>这是不会被截断的完整正文。</p>";
  const xml = generateRSS([createPost(0, content)], metadata);

  assert.match(xml, new RegExp(`<description><!\\[CDATA\\[${content}`));
  assert.match(xml, new RegExp(`<content:encoded><!\\[CDATA\\[${content}`));
  assert.equal((xml.match(/这是不会被截断的完整正文/g) || []).length, 2);
});

test("RSS output is capped at ten posts", () => {
  const xml = generateRSS(
    Array.from({ length: RSS_LIMIT + 2 }, (_, index) => createPost(index)),
    metadata,
  );

  assert.equal((xml.match(/<item>/g) || []).length, RSS_LIMIT);
  assert.doesNotMatch(xml, /文章 10/);
});

test("rendered Markdown uses absolute URLs for feed resources", () => {
  const html = renderRSSContent(
    "[站内文章](/blog/example)\n\n![配图](/images/example.avif)",
    metadata.url,
  );

  assert.match(html, /href="https:\/\/example\.com\/blog\/example"/);
  assert.match(html, /src="https:\/\/example\.com\/images\/example\.avif"/);
});
