<script setup>
import { onMounted, ref } from 'vue'
import { apiGetBlogList } from '@/api/index.js'
import { ElMessage } from 'element-plus'
import Tag from '@/views/Tag/index.vue'

const blogList = ref([])

const tagList = [
    {
        tagImg: new URL('@/assets/HTML5.jpg', import.meta.url).href,
        tagName: 'HTML',
        tagHours: 100,
        tagProcess: 90,
        tagNumber: 19
    },
    {
        tagImg: new URL('@/assets/CSS.jpg', import.meta.url).href,
        tagName: 'CSS',
        tagHours: 99,
        tagProcess: 60,
        tagNumber: 10
    },
    {
        tagImg: new URL('@/assets/js.jpg', import.meta.url).href,
        tagName: 'JavaScript',
        tagHours: 66,
        tagProcess: 40,
        tagNumber: 1
    },
    {
        tagImg: new URL('@/assets/Vue.png', import.meta.url).href,
        tagName: 'Vue',
        tagHours: 65,
        tagProcess: 30,
        tagNumber: 3
    },
      {
        tagImg: new URL('@/assets/webpack.jpg', import.meta.url).href,
        tagName: 'Webpack',
        tagHours: 2,
        tagProcess: 5,
        tagNumber: 2
    },
]

onMounted(() => {
    apiGetBlogList().then((data) => {
        console.log('获取博客列表成功', data)
        blogList.value = data
    }).catch((e) => {
        ElMessage.error('获取博客列表失败')
    })
})

</script>

<template>
    <div class="home-container">
        <!-- banner -->
        <div class="home-banner">
            该博客还不知道放点什么
        </div>
        <div class="home-content">
            <!-- 博客列表 -->
            <div class="home-main">
                <RouterLink v-for="blog in blogList" :to="`/blog/${blog._id}`" class="blog">
                    <div class="blog-img"
                        :style="{ 'background-image': `url(${blog.coverImage || '/images/20171227.jpg'})` }">
                    </div>
                    <div class="blog-intro">
                        <div class="blog-tags">
                            <span class="blog-tag" v-for="tag in blog.tags">{{ tag }}</span>
                        </div>
                        <div class="blog-title">{{ blog.title }}</div>
                        <div class="blog-time">{{ blog.date.substring(0, 10) }}</div>
                    </div>
                </RouterLink>
            </div>
            <div class="home-sidebar">
                <!-- 个人信息 -->
                <div class="author">
                    <div class="avatar">
                        <img src="https://avatars.githubusercontent.com/u/148607309?v=4" alt="my avatar">
                    </div>
                    <span id="name">一曝十寒</span>
                    <span id="motto">你好！我叫一曝十寒，欢迎来到我的博客！！！</span>
                </div>
                <!-- 文章归档 -->
                <div class="archive">
                        <a href="#">
                            <div class="archive-month first">
                                <div class="date">2025 四月</div>
                                <div class="number">1篇</div>
                            </div>
                        </a>
                        <a href="#">
                            <div class="archive-month">
                                <div class="date">2025 五月</div>
                                <div class="number">1篇</div>
                            </div>
                        </a>
                </div>
                <!-- 我的标签 -->
                <div class="tags">
                        <Tag v-for="tag in tagList" :tag="tag"></Tag>
                </div>
            </div>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.home-container {
    display: flex;
    flex-direction: column;
    margin-top: 64px;
    min-height: calc(100vh - 75px);

    .home-banner {
        width: 100%;
        height: 400px;
        background-image: url(../../assets/homeImg.jpg);
        background-size: cover;
        background-position: center;
        color: #FFF;
        font-size: 64px;
        font-weight: 700;
        font-family: "Google Sans", arial, sans-serif;
    }

    .home-content{
        background-color: #F5F5FA;
        padding: 40px 60px;
        display: flex;

        .home-main {
                flex: 1;
                height: 100%;
                margin-right: 40px;
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
        
                .blog {
                    flex: 1;
                    border-radius: 10px;
                    min-height: 300px;
                    min-width: 400px;
                    overflow: hidden;
                    background-color: #fff;
        
                    .blog-img {
                        width: 100%;
                        height: 200px;
                        background-size: cover;
                        background-position: center;
                    }
        
                    .blog-intro {
                        padding: 20px;
        
                        .blog-tags {
                            font-size: 14px;
                            color: #666;
                            margin-bottom: 10px;
        
                            .blog-tag {
                                padding: 5px 10px;
        
                                // margin-right: 10px;
                                &::before {
                                    content: '# ';
                                }
                            }
                        }
        
                        .blog-title {
                            font-size: 20px;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
        
                        .blog-time {
                            font-size: 14px;
                            color: #666;
                        }
        
                    }
        
                }
            }
    
        .home-sidebar {
            display: flex;
            flex-direction: column;
            width: 300px;
            min-width: 280px;
            height: 100%;
    
            .author {
                min-height: 300px;
                margin-bottom: 20px;
                padding: 20px;
                border-radius: 10px;
                background-color: #FFF;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 30px;
    
                .avatar {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
    
                    img {
                        width: 100%;
                        height: 100%;
                    }
                }
    
                #name {
                    font-weight: bold;
                }
    
                #motto {
                    text-align: center;
                    max-width: 100%;
                    word-wrap: break-word; // 长单词断行
                }
            }
    
            .archive {
                margin-bottom: 20px;
                border-radius: 10px;
                background-color: #fdfdfd;
                width: 100%;
                flex: 1;
                padding: 16px 20px;
                overflow: hidden;
                border-radius: 5px;

                .archive-month {
                    cursor: pointer;
                    height: 50px;
                    width: 100%;
                    padding-left: 10px;
                    position: relative;
                    display: flex;
                    align-items: center;
                    border-top: 1px solid #b5b5b5;

                    .number {
                        position: absolute;
                        right: 20px;
                        top: 20px;
                        font-size: 14px;
                        color: #666;
                    }

                    &.first {
                        border-top: none;
                    }

                    &:hover {
                        background-color: #eee;
                    }
                }
            }

            .tags {
                background-color: #FFF;
                margin-bottom: 20px;
                border-radius: 4px;
                overflow: hidden;
                width: 100%;           
            }
        }
    }


}
</style>
