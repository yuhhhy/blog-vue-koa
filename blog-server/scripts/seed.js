import mongoose from 'mongoose'
import { Blog } from '../models/BlogSchema.js'
import { BlogContent } from '../models/BlogContentSchema.js'
import { Comment } from '../models/CommentSchema.js'
import { Links } from '../models/LinksSchema.js'
import { Essay } from '../models/EssaySchema.js'
import { WebsiteData } from '../models/WebsiteDataSchema.js'
import { User } from '../models/UserSchema.js'
import {
    createMockWebsiteData,
    mockComments,
    mockLinks,
    mockPosts,
    mockEssays,
} from '../mock/data.js'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blog'

const countWords = (content = '') => Array.from(content.replace(/\s+/g, '')).length

const createBlog = (post) => ({
    id: post.id,
    title: post.title,
    coverImage: post.coverImage,
    createTime: post.createTime,
    updateTime: post.updateTime,
    tags: post.tags,
    link: `/blog/${post.id}`,
})

const createBlogContent = (post) => ({
    ...post,
    wordCount: post.wordCount || countWords(post.content),
})

const seed = async () => {
    await mongoose.connect(MONGO_URI)
    console.log('MongoDB connected:', MONGO_URI)

    await Promise.all([
        Blog.deleteMany({}),
        BlogContent.deleteMany({}),
        Comment.deleteMany({}),
        Links.deleteMany({}),
        Essay.deleteMany({}),
        WebsiteData.deleteMany({}),
    ])

    const blogs = mockPosts.map(createBlog)
    const contents = mockPosts.map(createBlogContent)
    const website = createMockWebsiteData()

    await Promise.all([
        Blog.insertMany(blogs),
        BlogContent.insertMany(contents),
        Comment.insertMany(mockComments),
        Links.insertMany(mockLinks),
        Essay.insertMany(mockEssays),
        WebsiteData.create(website),
    ])

    const adminExists = await User.findOne({ role: 'admin' })
    if (!adminExists) {
        await User.create({
            userId: 'admin-001',
            username: 'admin',
            password: 'admin123',
            email: 'admin@example.com',
            role: 'admin',
        })
        console.log('Created admin user (admin / admin123)')
    }

    console.log(`Inserted ${blogs.length} blogs, ${mockEssays.length} essays, ${mockComments.length} comments, ${mockLinks.length} links`)
    await mongoose.disconnect()
    console.log('Done')
}

seed().catch(async (error) => {
    console.error('Seed failed:', error)
    await mongoose.disconnect()
    process.exit(1)
})
