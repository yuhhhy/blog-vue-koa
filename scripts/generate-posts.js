import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { fileURLToPath } from 'url'
import { apiCreateBlog, apiDeleteAllBlogs } from '../client/src/api/blog.js'
import { apiCreateBlogContent, apiDeleteAllBlogContent } from '../client/src/api/blogContent.js'
import { apiUpdateWebsiteLastUpdate } from '../client/src/api/websiteData.js'

// 获取当前模块路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置路径
const POSTS_DIR = path.join(__dirname, '../public/posts')

// 读取所有Markdown文件
const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'))


let count = 0; // 用于给每个文件生成唯一的ID

const posts = files.map(file => {
  const filePath = path.join(POSTS_DIR, file)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)

  // 确保有必需的字段
  if (!data.id) data.id = count++;
  if (!data.link) data.link = `/blog/${data.id}`
  if (!data.content) data.content = content
  // 字数统计
  if (!data.wordCount) {
    let eTotal = 0 // 字母数
    let sTotal = 0 // 空格数
    let str = content
    for (let i = 0; i < str.length; i++) {
      let c = str.charAt(i)
      if (/[a-zA-Z]/.test(c)) {
        eTotal++
      } else if (/\s+/.test(c)) {
        sTotal++
      }
    }
    let wTotal = 0 // 英文单词数
    const segmenter = new Intl.Segmenter('en', { granularity: 'word' })
    const segments = Array.from(segmenter.segment(str))
    const words = segments.filter(s => s.isWordLike).map(s => s.segment)
    wTotal = words.filter(word => word.match(/^[a-zA-Z]+$/)).length

    data.wordCount = str.length - eTotal + wTotal - sTotal
  }
  return data
})

// 按日期排序
posts.sort((a, b) => new Date(b.date) - new Date(a.date))

// 在发送新文章前，先清空所有文章
async function updateAllPosts(posts) {
  try {
    // 1. 先删除所有文章
    console.log('正在清空旧文章...')
    await apiDeleteAllBlogs()
    await apiDeleteAllBlogContent()
    console.log('旧文章清空完成')

    // 2. 重新创建所有文章
    console.log('开始创建新文章...')
    for (const post of posts) {
      try {
        // 3. 创建文章信息
        await apiCreateBlog({
          id: post.id,
          title: post.title,
          coverImage: post.coverImage,
          date: post.date,
          tags: post.tags,
          link: post.link,
        })
        // 4. 创建文章内容
        await apiCreateBlogContent({
          id: post.id,
          title: post.title,
          author: post.author,
          coverImage: post.coverImage,
          date: post.date,
          tags: post.tags,
          content: post.content,
          wordCount: post.wordCount,
          viewCount: 1,
          likeCount: 1
        })
        console.log(`创建文章成功:《${post.title}》`)
      } catch (error) {
        console.error(`创建文章失败:《${post.title}》- ${error.message}`)
      }
    }
    console.log(`全部文章更新完成，共更新 ${posts.length} 篇文章`)
  } catch (error) {
    console.error('更新文章失败:', error.message)
  }
}

// 更新网站最后更新时间
apiUpdateWebsiteLastUpdate()
// 调用更新函数
updateAllPosts(posts)