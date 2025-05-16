import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {

    // 持久化存储
    const userData = ref(JSON.parse(localStorage.getItem('userData')) || {});
    
    function setUserData(data) {
        userData.value = data
        localStorage.setItem('userData', JSON.stringify(data))
    }

    return {
        userData,
        setUserData
    }
})