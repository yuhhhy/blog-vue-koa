<script setup>
import { onMounted, ref } from 'vue'
import { apiGetBlogList } from '@/api/index.js'
import { ElMessage } from 'element-plus'

const blogList = ref([])

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
                    <div class="blog-time">{{ blog.date.substring(0,10) }}</div>
                </div>
            </RouterLink>
        </div>
        <div class="home-sidebar">
            <div class="author">
                <div class="avatar">
                    <img src="https://avatars.githubusercontent.com/u/148607309?v=4" alt="my avatar">
                </div>
                <span id="name">一曝十寒</span>
                <span id="motto">你好！我叫一曝十寒，欢迎来到我的博客！！！</span>
            </div>
            <div class="archive">
                <div class="archive-tags">
                    <a href="#">
                        <div class="tag">CSS</div>
                    </a>
                    <a href="#">
                        <div class="tag">JavaScript</div>
                    </a>
                    <a href="#">
                        <div class="tag">HTML</div>
                    </a>
                    <a href="#">
                        <div class="tag">Vue</div>
                    </a>
                    <a href="#">
                        <div class="tag">Webpack</div>
                    </a>
                    <a href="#">
                        <div class="tag">工程化</div>
                    </a>
                    <a href="#">
                        <div class="tag">音乐</div>
                    </a>
                    <a href="#">
                        <div class="tag">游戏</div>
                    </a>
                </div>
                <div class="archives-month">
                    <a href="#">
                        <div class="archive-month first">
                            <div class="date">2025 四月</div>
                            <div class="number">1篇</div>
                        </div>
                    </a>
                    <a href="#">
                        <div class="archive-month">
                            <div class="date">2025 四月</div>
                            <div class="number">1篇</div>
                        </div>
                    </a>
                    <a href="#">
                        <div class="archive-month">
                            <div class="date">2025 六月</div>
                            <div class="number">0篇</div>
                        </div>
                    </a>
                    <a href="#">
                        <div class="archive-month">
                            <div class="date">2025 七月</div>
                            <div class="number">0篇</div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.home-container {
    display: flex;
    margin-top: 64px;
    padding: 40px 60px;
    min-height: calc(100vh - 75px);
    background-color: #F5F5FA;

    .home-main {
        flex: 1;
        height: 100%;
        margin-right: 40px;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;

        .blog {
            flex: 1;
            border-radius: 30px;
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
        width: 280px;
        min-width: 240px;
        height: 100%;

        .author {
            min-height: 300px;
            margin-bottom: 40px;
            padding: 20px;
            border-radius: 30px;
            background-color: #D5DEFD;
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
                word-wrap: break-word;              // 长单词断行
            }
        }

        .archive {
            background-color: #fdfdfd;
            flex: 1;
            height: 100%;
            border-radius: 30px;
            padding: 30px;

            .archive-tags {
                padding-bottom: 20px;
                border-bottom: 1px solid #b5b5b5;
                display: flex;
                flex-wrap: wrap;

                .tag {
                    padding: 8px 10px;
                    border-radius: 10px;
                    &:hover {
                        background-color: #eee;
                    }
                }
            }

            .archives-month {
                overflow: hidden;
                border-radius: 10px;

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
                        font-size: 16px;
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
        }
    }
}
</style>
