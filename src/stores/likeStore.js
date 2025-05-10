import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义一个名为 'liked' 的 Pinia store，用于管理用户点赞信息。
export const useLikeStore = defineStore('liked', () => {

    // 存储用户点赞信息的对象，键为博客 ID，值为 true 或 false，表示是否点赞
    const likedInfo = ref(JSON.parse(localStorage.getItem('likedInfo')) || {})

    // 切换点赞状态
    function like(id) {
        likedInfo.value[id] = true
        localStorage.setItem('likedInfo', JSON.stringify(likedInfo.value)) // 保存到本地存储
    }

    return { likedInfo, like }
})