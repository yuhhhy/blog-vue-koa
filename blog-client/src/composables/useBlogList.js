import { ref } from 'vue'
import { apiGetBlogList } from '@/api/blog'

const blogList = ref([])
let isLoaded = false

// 创建一个组合式函数，实现博客列表数据的状态提升和数据共享
export function useBlogList() {
  const fetchBlogList = async () => {
    if (!isLoaded) {
      const response = await apiGetBlogList()
      blogList.value = response
      isLoaded = true
    }
    return blogList.value
  }

  return {
    blogList,
    fetchBlogList
  }
}