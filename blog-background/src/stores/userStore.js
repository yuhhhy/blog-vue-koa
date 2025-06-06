import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useUserStore = defineStore('user', () => {

    // 持久化存储
    const userData = ref(JSON.parse(localStorage.getItem('userData')) || {})

    // 用户登录认证检查
    const isAuthenticated = computed(() => {
        return Reflect.ownKeys(userData.value).length !== 0 && userData.value.token !== undefined
    })

    function setUserData(data) {
        userData.value = data
        localStorage.setItem('userData', JSON.stringify(data))
    }

    function clearUserData() {
        userData.value = {}
        localStorage.removeItem('userData')
    }

    return {
        userData,
        isAuthenticated,
        setUserData,
        clearUserData
    }
})