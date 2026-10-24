import builder from "xmlbuilder";
import fs from "fs/promises";
import path from "path";
import MarkdownIt from "markdown-it";
import { Blog } from "../models/BlogSchema.js";
import { BlogContent } from "../models/BlogContentSchema.js";
import { siteMeta } from "../config/siteMeta.js";
import config from "../config/env.js";

export const RSS_LIMIT = 10;

const RSS_CANDIDATE_LIMIT = RSS_LIMIT * 3;
const staticResourceFilePath = path.join(config.staticResourceFilePath, "feed.xml");
const generationQueue = { current: Promise.resolve() };

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const toAbsoluteUrl = (value, baseUrl) => {
  if (!value) return "";

  try {
    return new URL(value, `${baseUrl.replace(/\/$/, "")}/`).href;
  } catch {
    return value;
  }
};

const getImageMimeType = (url) => {
  const extension = url.split(/[?#]/, 1)[0].split(".").pop()?.toLowerCase();
  const mimeTypes = {
    avif: "image/avif",
    gif: "image/gif",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
    webp: "image/webp",
  };

  return mimeTypes[extension] || "image/*";
};

export const renderRSSContent = (content = "", siteUrl = siteMeta.url) => {
  const html = markdown.render(content);

  return html.replace(/\b(href|src)=(['"])(.*?)\2/gi, (match, attribute, quote, url) => {
    if (!url || url.startsWith("#")) return match;
    return `${attribute}=${quote}${toAbsoluteUrl(url, siteUrl)}${quote}`;
  });
};

export function generateRSS(posts, metadata = siteMeta) {
  const channel = builder.create("rss", { encoding: "UTF-8" })
    .att("version", "2.0")
    .att("xmlns:content", "http://purl.org/rss/1.0/modules/content/")
    .att("xmlns:atom", "http://www.w3.org/2005/Atom")
    .att("xmlns:dc", "http://purl.org/dc/elements/1.1/")
    .att("xmlns:media", "http://search.yahoo.com/mrss/")
    .ele("channel");

  channel.ele("title", metadata.title);
  channel.ele("link", metadata.url);
  channel.ele("atom:link", {
    href: `${metadata.url}/feed`,
    rel: "self",
    type: "application/rss+xml",
  });
  channel.ele("description", metadata.description);
  channel.ele("language", "zh-CN");
  channel.ele("lastBuildDate", new Date().toUTCString());
  channel.ele("generator", "blog-vue-koa");

  posts.slice(0, RSS_LIMIT).forEach((post) => {
    const item = channel.ele("item");
    const content = post.content || "";

    item.ele("title", post.title);
    item.ele("link", post.link);
    item.ele("guid", { isPermaLink: "true" }, post.link);
    item.ele("pubDate", new Date(post.publishedAt).toUTCString());
    item.ele("dc:creator").dat(post.author || metadata.title);

    // Some readers ignore content:encoded and only render description.
    item.ele("description").dat(content);
    item.ele("content:encoded").dat(content);

    if (post.coverImage) {
      item.ele("media:content", {
        url: post.coverImage,
        medium: "image",
        type: getImageMimeType(post.coverImage),
      });
    }
  });

  return channel.end({ pretty: true });
}

const buildLatestPostsRSS = async () => {
  const latestBlogs = await Blog.find({})
    .sort({ createTime: -1 })
    .limit(RSS_CANDIDATE_LIMIT)
    .select("id title coverImage createTime")
    .lean()
    .exec();

  const contents = await BlogContent.find({ id: { $in: latestBlogs.map((blog) => blog.id) } })
    .select("id author content coverImage")
    .lean()
    .exec();
  const contentMap = new Map(contents.map((content) => [content.id, content]));

  const posts = latestBlogs.flatMap((blog) => {
    const blogContent = contentMap.get(blog.id);
    if (!blogContent?.content?.trim()) return [];

    return [{
      title: blog.title,
      link: `${siteMeta.url}/blog/${blog.id}`,
      content: renderRSSContent(blogContent.content, siteMeta.url),
      publishedAt: blog.createTime,
      author: blogContent.author,
      coverImage: toAbsoluteUrl(blog.coverImage || blogContent.coverImage, config.baseUrl),
    }];
  }).slice(0, RSS_LIMIT);

  const rssXml = generateRSS(posts, siteMeta);
  const temporaryFilePath = `${staticResourceFilePath}.${process.pid}.${Date.now()}.tmp`;

  await fs.mkdir(path.dirname(staticResourceFilePath), { recursive: true });

  try {
    await fs.writeFile(temporaryFilePath, rssXml, "utf-8");
    await fs.rename(temporaryFilePath, staticResourceFilePath);
  } finally {
    await fs.rm(temporaryFilePath, { force: true });
  }

  return { count: posts.length, filePath: staticResourceFilePath };
};

export function generateLatestPostsRSS() {
  const task = generationQueue.current
    .catch(() => undefined)
    .then(buildLatestPostsRSS);

  generationQueue.current = task;
  return task;
}
