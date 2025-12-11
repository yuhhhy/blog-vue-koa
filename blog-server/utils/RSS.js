import builder from "xmlbuilder";
import fs from "fs/promises";
import { Blog } from "../models/BlogSchema.js";
import { BlogContent } from "../models/BlogContentSchema.js";
import { siteMeta } from "../config/siteMeta.js";
import config from "../config/env.js";

const RSS_LIMIT = 6;
const SLICE_LENGTH = 200;

const staticResourceFilePath = config.staticResourceFilePath + "/feed.xml";

export function generateRSS(posts, siteMeta) {
    const rss = builder.create('rss', { encoding: 'UTF-8' })
        .att('version', '2.0')
        .att('xmlns:content', 'http://purl.org/rss/1.0/modules/content/')
        .att('xmlns:atom', 'http://www.w3.org/2005/Atom')
        .att('xmlns:dc', 'http://purl.org/dc/elements/1.1/')
        .att('xmlns:media', 'http://search.yahoo.com/mrss/')
        .ele('channel')
            .ele('title', siteMeta.title).up()
            .ele('link', siteMeta.url).up()
            .ele('atom:link', { href: `${siteMeta.url}/feed`, rel: 'self', type: 'application/rss+xml' }).up()
            .ele('description', siteMeta.description).up()
            .ele('language', 'zh-CN').up()
            .ele('lastBuildDate', new Date().toUTCString()).up();
    
    posts.forEach(post => {
        const item = rss.ele("item");
        item.ele("title", post.title);
        item.ele("link", post.link);
        item.ele("guid", { isPermaLink: "true" }, post.link);
        item.ele("pubDate", new Date(post.publishedAt).toUTCString());
        item.ele("dc:creator").dat(post.author);
        item.ele("description").dat(post.excerpt);
        item.ele("content:encoded").dat(post.content);
        item.ele("media:content", {
          url: post.coverImage,
          medium: "image",
          type: "image/avif",
        });
    });

    return rss.end({ pretty: true });
}

export async function generateLatestPostsRSS() {
    const latestBlogs = await Blog.find({})
      .sort({ createTime: -1 })
      .limit(RSS_LIMIT);

    const posts = [];
    for (const blog of latestBlogs) {
      const blogContent = await BlogContent.findOne({ id: blog.id });

      posts.push({
        title: blog.title,
        link: `${siteMeta.url}/blog/${blog.id}`,
        content: blogContent.content,
        excerpt: blogContent.content.slice(0, SLICE_LENGTH) + "...",
        publishedAt: new Date(blog.createTime),
        author: blogContent.author,
        coverImage: blogContent.coverImage,
      });
  }
  
    const rssXml = generateRSS(posts, siteMeta);

    await fs.writeFile(staticResourceFilePath, rssXml, "utf-8");
}
