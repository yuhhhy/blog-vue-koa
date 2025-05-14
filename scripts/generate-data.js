import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { fileURLToPath } from 'url'
import { apiCreateBlog, apiGetBlogByTitle, apiUpdateBlog } from '../client/src/api/blog.js'
import { apiCreateBlogContent, apiUpdateBlogContent } from '../client/src/api/blogContent.js'
import { apiUpdateWebsiteLastUpdate } from '../client/src/api/websiteData.js'

// 获取当前模块路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置路径
const POSTS_DIR = path.join(__dirname, '../public/blogs')

// 读取所有Markdown文件
const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'))



const blogs = files.map(file => {
  const filePath = path.join(POSTS_DIR, file)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)

  // 确保有必需的字段
  if (!data.id) data.id = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 4)}`;
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
blogs.sort((a, b) => new Date(b.date) - new Date(a.date))

// 在发送新文章前，先清空所有文章
async function updateAllBlogs(blogs) {
  try {
    console.log('开始更新文章...')

    for (const blog of blogs) {
      try {
        // 1. 检查文章是否已存在（通过标题）
        const existingBlog = await apiGetBlogByTitle(blog.title)
        if (existingBlog) { 
          // 2. 更新文章信息
          await apiUpdateBlog(
            existingBlog.id, 
          {
            coverImage: blog.coverImage,
            date: blog.date,
            tags: blog.tags,
          })

          await apiUpdateBlogContent(
            existingBlog.id,  
          {
            author: blog.author,
            coverImage: blog.coverImage,
            date: blog.date,
            tags: blog.tags,
            content: blog.content,
            wordCount: blog.wordCount,
          })

          console.log(`更新文章成功:《${blog.title}》`)
        } else {
          // 3. 创建新文章
          await apiCreateBlog({
            id: blog.id,
            title: blog.title,
            coverImage: blog.coverImage,
            date: blog.date,
            tags: blog.tags,
            link: blog.link,
          });
          
          await apiCreateBlogContent({
            id: blog.id,
            title: blog.title,
            author: blog.author,
            coverImage: blog.coverImage,
            date: blog.date,
            tags: blog.tags,
            content: blog.content,
            wordCount: blog.wordCount,
            viewCount: 0,
            likeCount: 0
          });
          
          console.log(`创建文章成功:《${blog.title}》`);
        }
      }
      catch (error) {
        console.error(`更新文章失败:《${blog.title}》`, error.message)
      }
    }
    console.log(`全部文章更新完成，共更新 ${blogs.length} 篇文章`)
  } catch (error) {
    console.error('更新文章失败:', error.message)
  }
}

// 更新网站最后更新时间
apiUpdateWebsiteLastUpdate()
// 调用更新函数
updateAllBlogs(blogs)