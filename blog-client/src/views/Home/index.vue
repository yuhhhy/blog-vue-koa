<script setup>
import Sidebar from '@/components/Sidebar/index.vue'
import { ref, onMounted } from 'vue'
import { apiGetBlogList } from '@/api/blog.js'

const blogList = ref([])

async function getBlogList() {
    const response = await apiGetBlogList()
    blogList.value = response
}

// 创建图片懒加载指令，支持非懒加载选项
const vLazy = {
  mounted(el, binding) {
    const shouldLoadImmediately = binding.modifiers.immediate;
    
    // 如果需要立即加载，直接设置背景图片并返回
    if (shouldLoadImmediately) {
      el.style.backgroundImage = `url(${binding.value})`;
      return;
    }
    
    // 否则使用懒加载
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { // 当元素进入视口
          el.style.backgroundImage = `url(${binding.value})`;
          // 解除观察
          observer.unobserve(el);
        }
      });
    }, { 
      threshold: 0.01,
      rootMargin: '200px' // 提前200px开始加载图片，提升用户体验
    });
    
    // 开始观察元素
    observer.observe(el);
  }
}

onMounted(() => {
    // 获取后台数据
    getBlogList();
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
                    <div 
                      class="blog-img" 
                      v-lazy="blog.coverImage"
                    ></div>
                    <div class="blog-intro">
                        <div class="blog-title">{{ blog.title }}</div>
                        <div class="blog-time-tags">
                            <span class="blog-time">{{ blog.createTime.substring(0, 10) }}</span>
                            <span class="blog-tag" v-for="tag in blog.tags" :key="tag">{{ tag }}</span>
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
    padding-top: 64px;
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

                // 添加初始状态，确保有平滑过渡
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

                &:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                }

                @media (max-width: 768px) {
                    min-width: 100%;
                }

                .blog-img {
                    width: 100%;
                    height: 200px;
                    background-size: cover;
                    background-position: center;
                    position: relative;
                    transition: filter 0.3s ease;
                    
                    // 加载占位效果
                    &:not([style*="url("]) {
                      background-color: #f0f0f0;
                      animation: pulse 2.5s infinite;
                    }
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

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
