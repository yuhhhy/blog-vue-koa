import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义一个名为 'theme' 的 Pinia store，用于管理应用的主题设置
export const useThemeStore = defineStore('theme',() => {

    // 获取本地存储，若没有默认为 'light'
    const theme = ref(localStorage.getItem('theme') || 'light') 

    // 切换主题
    function toggleTheme() {
        theme.value = theme.value === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', theme.value)
    }

    return { theme, toggleTheme }
})