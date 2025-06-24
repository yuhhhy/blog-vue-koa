<script setup>
import { ref, watch } from 'vue'
import { apiGetPrevArticle, apiGetNextArticle } from '@/api/blog.js'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const prevBlog = ref({})
const nextBlog = ref({})

// 获取推荐文章数据
const getRecommendedBlogs = async () => {
  try {
    // 获取上一篇和下一篇文章
    const [prevRes, nextRes] = await Promise.all([
      apiGetPrevArticle(route.params.id),
      apiGetNextArticle(route.params.id)
    ])
    
    prevBlog.value = prevRes.found ? prevRes.prevBlog : null
    nextBlog.value = nextRes.found ? nextRes.nextBlog : null
  } catch (error) {
  }
}

// 监听 currentId 的变化，更新推荐文章
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await getRecommendedBlogs()
  }
}, { immediate: true })  // 这会在组件挂载时自动执行一次

const handlePrevClick = () => {
  ElMessage.warning('已经是最新一篇博客')
}

const handleNextClick = () => {
  ElMessage.warning('已经是最后一篇博客')
}

</script>

<template>
  <div class="recommend-container">
    <!-- 上一篇 -->
    <template v-if="prevBlog?.link">
      <RouterLink class="article-nav" :to="prevBlog.link">
        <img 
          v-if="prevBlog?.coverImage" 
          class="nav-bg-image" 
          loading="lazy" 
          :src="prevBlog.coverImage" 
          alt="上一篇文章封面"
        />
        <div class="nav-label">上一篇</div>
        <div class="nav-content">
          <div class="title">
            {{ prevBlog.title }}
          </div>
        </div>
      </RouterLink>
    </template>
    <template v-else>
      <div 
        class="article-nav"
        :style="{ backgroundImage: 'none'}"
        @click="handlePrevClick">
        <div class="nav-label">上一篇</div>
        <div class="nav-content">
          <div class="title">
            已经是最新一篇博客
          </div>
        </div>
      </div>
    </template>

    <!-- 下一篇 -->
    <template v-if="nextBlog?.link">
      <RouterLink 
        class="article-nav" :to="nextBlog.link">
        <img 
          v-if="nextBlog?.coverImage" 
          class="nav-bg-image" 
          loading="lazy" 
          :src="nextBlog.coverImage" 
          alt="下一篇文章封面"
        />
        <div class="nav-label">下一篇</div>
        <div class="nav-content">
          <div class="title">
            {{ nextBlog.title }}
          </div>
        </div>
      </RouterLink>
    </template>
    <template v-else>
      <div 
        class="article-nav"
        :style="{ backgroundImage:'none' }"
        @click="handleNextClick">
        <div class="nav-label">下一篇</div>
        <div class="nav-content">
          <div class="title">
            已经是最后一篇博客
          </div>
        </div>
      </div>
    </template>
  </div>

</template>

<style scoped lang="scss">
.recommend-container {
  display: flex;
  height: 100px;
  width: 100%;
  padding: 0 30px;

  .article-nav {
    flex: 1;
    border-radius: 8px;
    transition: all 0.3s ease;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    text-decoration: none;
    color: white;
    text-shadow: 1px 1px 1px black;
    font-weight: bold;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    // 背景图片
    .nav-bg-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      margin: 0;
      border-radius: 8px;
      z-index: 0;
    }
    
    // 内容布局
    .nav-label {
      position: absolute;
      left: 15px;
      top: 20px;
      font-size: 1.1rem;
      z-index: 1;
    }
    .nav-content {
      position: absolute;
      bottom: 15px;
      left: 20px;
      z-index: 1;
      font-style: italic;

      .title {
        line-height: 1.4;
      }
    }

    &:first-child:hover {
      box-shadow: -2px 2px 2px var(--black);
      transform: translateY(-2px);
    }
  
    &:hover {
      box-shadow: 2px 2px 2px var(--black);
      transform: translateY(-2px);
    }
  }
}
</style>