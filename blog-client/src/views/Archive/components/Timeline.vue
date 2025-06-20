<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useBlogList } from '@/composables/useBlogList'
import { computed } from 'vue'

const route = useRoute()
const { blogList, fetchBlogList } = useBlogList()
const postsByTag = ref([])

// 提取筛选逻辑为单独函数
const filterPostsByTag = () => {
  const tag = route.query.tag
  if (!tag) return
  
  // 参数为日期，匹配精确到月份
  if (tag.match(/^\d{4}-\d{2}$/)) {
    postsByTag.value = blogList.value.filter(post => {
      return post.createTime.startsWith(tag)
    })
  } else { // 参数为Tag，匹配Tag
    postsByTag.value = blogList.value.filter(post => {
      return post.tags.includes(tag)
    })
  }
}

onMounted(async () => {
  await fetchBlogList()
  if (route.query.tag) {
    filterPostsByTag()
  }
})

// 监听 query 参数变化
watch(() => route.query.tag, () => {
  filterPostsByTag()
})

// 按年份分组并排序
const groupedTimeline = computed(() => {
  const result = []
  const yearMap = {}
  
  blogList.value.forEach(post => {
    const year = post.createTime.substring(0, 4)
    if (!yearMap[year]) {
      yearMap[year] = true
      result.push({
        isYear: true,
        year: year
      })
    }
    result.push({
      isYear: false,
      post: post
    })
  })
  
  return result
})
</script>

<template>
  <div class="container">
    <el-timeline style="max-wipx" class="timeline">
      <!-- 有路由参数时显示 -->
      <el-timeline-item 
        v-if="route.query.tag && postsByTag.length" 
        v-for="item in postsByTag" 
        :key="item.id"
        :timestamp="item.createTime.substring(0, 10)" 
        type="primary" 
        class="timeline-item"
      >
        <RouterLink :to="item.link" class="timeline-item__link">    
          <span class="timeline-item__title">{{ item.title }}</span>
        </RouterLink>
      </el-timeline-item>

      <!-- 有路由参数但没有对应文章时显示 -->
      <div v-else-if="route.query.tag && !postsByTag.length" class="noPosts">很抱歉，还没有这类文章……</div>

      <!-- 无路由参数时显示 -->
      <template v-else>
        <template v-for="item in groupedTimeline" :key="item.isYear ? item.year : item.post.id">
          <el-timeline-item 
            v-if="item.isYear"
            :timestamp="item.year + '年'"
            type="primary"
            placement="top"
            class="year-marker"
          />
          <el-timeline-item 
            v-else
            :timestamp="item.post.createTime.substring(0, 10)"
            type="primary"
            class="timeline-item"
          >
            <RouterLink :to="item.post.link" class="timeline-item__link">    
              <span class="timeline-item__title">{{ item.post.title }}</span>
            </RouterLink>
          </el-timeline-item>
        </template>
      </template>
    </el-timeline>
  </div>
</template>

<style lang="scss" scoped>
.container {
    padding-left: 40px;
    padding-top: 50px;

    .timeline {
      .noPosts {
       font-size: 1rem;
       color: var(--black);
     }
    }

    :deep(.timeline-item__title){
      font-size: 1rem;
      color: var(--light-dark);
      &:hover {
        color: var(--blue);
      }
    }
    :deep(.el-timeline-item__node){
      background-color: var(--blue);
      border-color: var(--blue);
    }

    @media screen and (max-width: 768px)  {
      padding-top: 40px;
      padding-left: 20px;
    }
}
.year-marker {
  :deep(.el-timeline-item__timestamp) {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--blue);
    margin-bottom: 10px;
  }
  :deep(.el-timeline-item__node) {
    width: 16px;
    height: 16px;
    left: -4px;
  }
}
</style>