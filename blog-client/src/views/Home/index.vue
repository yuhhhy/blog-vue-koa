<script setup>
import Sidebar from '@/components/Sidebar/index.vue'
import Banner from './components/Banner.vue'
import { ref, onMounted } from 'vue'
import { apiGetBlogList } from '@/api/blog.js'
const blogList = ref([])

async function getBlogList() {
    const response = await apiGetBlogList()
    blogList.value = response
}

onMounted(() => {
    // 获取后台数据
    getBlogList()
})
</script>

<template>
    <div class="home-container">
        <!-- banner -->
        <Banner></Banner>
        <div class="home-content">
            <!-- 博客列表 -->
            <div class="home-main">
                <RouterLink v-for="blog in blogList" :to="`/blog/${blog.id}`" class="blog">
                    <div class="blog-img" :style="{ 'background-image': `url(${blog.coverImage})` }">
                    </div>
                    <div class="blog-intro">

                        <div class="blog-title">{{ blog.title }}</div>
                        <div class="blog-time-tags">
                            <span class="blog-time">{{ blog.createTime.substring(0, 10) }}</span>
                            <span class="blog-tag" v-for="tag in blog.tags">{{ tag }}</span>
                        </div>
                    </div>
                </RouterLink>
            </div>
            <!-- 个人展示 -->
            <Sidebar></Sidebar>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.home-container {
    display: flex;
    flex-direction: column;
    margin-top: 64px;
    min-height: calc(100vh - 75px);

    .home-content {
        background-color: var(--light);
        padding: 40px 60px;
        display: flex;

        @media (max-width: 768px) {
            padding: 20px 20px;
        }

        .home-main {
            flex: 1;
            height: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;

            .blog {
                flex: 1;
                border-radius: 10px;
                overflow: hidden;
                background-color: var(--white);
                min-width: 400px;

                &:hover {
                    box-shadow: 2px 2px 5px var(--dark);
                    transition: 0.4s;
                }

                @media (max-width: 768px) {
                    min-width: 100%;
                }

                .blog-img {
                    width: 100%;
                    height: 200px;
                    background-size: cover;
                    background-position: center;
                }

                .blog-intro {
                    padding: 0 20px;
                    color: var(--black);

                    .blog-time-tags {
                        color: var(--quote-color);
                        font-size: 0.875rem;
                        margin-bottom: 12px;

                        .blog-time {
                            margin-right: 10px;
                        }

                        .blog-tag {
                            padding-right: 10px;

                            &::before {
                                content: '# ';
                            }
                        }
                    }

                    .blog-title {
                        font-size: 1.125rem;
                        font-weight: bold;
                        margin-bottom: 10px;
                        margin-top: 15px;

                        @media (max-width: 768px) {
                            font-size: 1rem;
                        }
                    }
                }
            }
        }
    }
}
</style>
