import { ref } from 'vue'
import { apiGetBlogList } from '@/api/blog'

const blogList = ref([])
let isLoaded = false
let loadingPromise = null

// 创建一个组合式函数，实现博客列表数据的状态提升和数据共享
export function useBlogList() {
  const fetchBlogList = async () => {
    if (isLoaded) {
      return blogList.value
    }

    if (!loadingPromise) {
      loadingPromise = apiGetBlogList()
        .then((response) => {
          blogList.value = response
          isLoaded = true
          return blogList.value
        })
        .finally(() => {
          loadingPromise = null
        })
    }

    return loadingPromise
  }

  return {
    blogList,
    fetchBlogList
  }
}
