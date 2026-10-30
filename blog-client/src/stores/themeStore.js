import { defineStore } from 'pinia'
import { ref } from 'vue'
import { applyTheme, readStoredTheme } from '@/utils/theme.js'

// 定义一个名为 'theme' 的 Pinia store，用于管理应用的主题设置
export const useThemeStore = defineStore('theme',() => {

    const theme = ref(readStoredTheme())

    // 切换主题
    function toggleTheme() {
        theme.value = applyTheme(theme.value === 'light' ? 'dark' : 'light')
    }

    return { theme, toggleTheme }
})
