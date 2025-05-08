import { defineStore } from 'pinia'
export const useThemeStore = defineStore('theme', {
    state: () => ({ 
        theme: localStorage.getItem('theme') || 'light' 
    }),
    getters: {
        getTheme: (state) => state.theme,
    },
    actions: {
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light'
            localStorage.setItem('theme', this.theme)
        }
    }
})