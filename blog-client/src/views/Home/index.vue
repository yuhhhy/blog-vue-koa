<script setup>
import { onMounted } from 'vue'
import { useBlogList } from '@/composables/useBlogList.js'

const { blogList, fetchBlogList } = useBlogList()

onMounted(() => {
    // 获取后台数据
    fetchBlogList();
})
</script>

<template>
    <div class="home-container">
        <!-- banner -->
        <div class="home-content">
            <!-- 博客列表 -->
            <div class="home-main">
                <RouterLink v-for="(blog, index) in blogList" :key="blog.id" :to="`/blog/${blog.id}`" class="blog">
                    <!-- 图片使用懒加载 -->
                    <img
                      class="blog-img"
                      :src="blog.coverImage"
                      :alt="blog.title"
                      :loading="index === 0 ? 'eager' : 'lazy'"
                      :fetchpriority="index === 0 ? 'high' : 'auto'"
                      decoding="async"
                      width="240"
                      height="150"
                    >
                    <div class="blog-intro">
                        <div class="blog-title">{{ blog.title }}</div>
                        <div class="blog-time-tags">
                            <span class="blog-time">{{ blog.createTime.substring(0, 10) }}</span>
                            <span class="blog-tag" v-for="tag in blog.tags" :key="tag">{{ tag }}</span>
                        </div>
                    </div>
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.home-container {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 75px);

    .home-content {
        background-color: var(--white);
        width: min(960px, calc(100% - 48px));
        margin: 0 auto;
        padding: 40px 0;

        @media (max-width: 768px) {
            width: calc(100% - 30px);
            padding: 20px 0;
        }

        .home-main {
            flex: 1;
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 20px;

            .blog {
                display: flex;
                border-radius: 10px;
                overflow: hidden;
                background-color: var(--white);
                width: 100%;
                min-height: 150px;

                // 添加初始状态，确保有平滑过渡
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

                &:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                }

                @media (max-width: 768px) {
                    min-height: 120px;
                }

                .blog-img {
                    flex: 0 0 240px;
                    width: 240px;
                    height: 150px;
                    min-height: 150px;
                    display: block;
                    object-fit: cover;
                    background-color: #f0f0f0;
                    transition: filter 0.3s ease;

                    @media (max-width: 768px) {
                        flex-basis: 38%;
                        width: 38%;
                        height: 120px;
                        min-height: 120px;
                    }
                }

                .blog-intro {
                    flex: 1;
                    min-width: 0;
                    padding: 18px 22px;
                    color: var(--black);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;

                    .blog-time-tags {
                        color: var(--quote-color);
                        font-size: 0.875rem;
                        line-height: 1.8;

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
                        line-height: 1.5;
                        margin-bottom: 16px;

                        @media (max-width: 768px) {
                            font-size: 1rem;
                            margin-bottom: 10px;
                        }
                    }

                    @media (max-width: 768px) {
                        padding: 12px;
                    }
                }
            }
        }
    }
}

</style>
