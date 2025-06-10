// 保存通知相关的状态和方法
// 可以被所有组件共享
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiGetPendingComments } from '@/api/comment'

export const useNotificationStore = defineStore('notification', () => {
    // 通知相关的状态
    const pendingCommentsCount = ref(0)  // 待审核评论数量
    const pendingLinksCount = ref(0)     // 待审核友链数量
    const unreadSystemCount = ref(0)     // 未读系统消息数量
    const totalNotifications = ref(0)    // 总通知数量
    
    // 获取待审核评论数量
    async function fetchPendingCommentsCount() {
        try {
            const response = await apiGetPendingComments()
            pendingCommentsCount.value = Array.isArray(response) ? response.length : 0
            updateTotalCount()
        } catch (error) {
            console.error('获取待审核评论数量失败:', error)
        }
    }
    
    // 获取待审核友链数量
    async function fetchPendingLinksCount() {
        try {
            // 如果你有相应的API，可以在这里调用
            // const response = await apiGetPendingLinks()
            // pendingLinksCount.value = Array.isArray(response) ? response.length : 0
            updateTotalCount()
        } catch (error) {
            console.error('获取待审核友链数量失败:', error)
        }
    }
    
    // 获取系统未读消息数量
    async function fetchUnreadSystemCount() {
        try {
            // 如果你有相应的API，可以在这里调用
            // const response = await apiGetUnreadSystemMessages()
            // unreadSystemCount.value = Array.isArray(response) ? response.length : 0
            updateTotalCount()
        } catch (error) {
            console.error('获取系统未读消息数量失败:', error)
        }
    }
    
    // 更新总通知数量
    function updateTotalCount() {
        totalNotifications.value = 
            pendingCommentsCount.value + 
            pendingLinksCount.value + 
            unreadSystemCount.value
    }
    
    // 重置评论通知
    function resetCommentsCount() {
        pendingCommentsCount.value = 0
        updateTotalCount()
    }
    
    // 重置友链通知
    function resetLinksCount() {
        pendingLinksCount.value = 0
        updateTotalCount()
    }
    
    // 重置系统通知
    function resetSystemCount() {
        unreadSystemCount.value = 0
        updateTotalCount()
    }
    
    // 刷新所有通知
    async function refreshAllNotifications() {
        await Promise.all([
            fetchPendingCommentsCount(),
            fetchPendingLinksCount(),
            fetchUnreadSystemCount()
        ])
    }
    
    return {
        pendingCommentsCount,
        pendingLinksCount,
        unreadSystemCount,
        totalNotifications,
        fetchPendingCommentsCount,
        fetchPendingLinksCount,
        fetchUnreadSystemCount,
        resetCommentsCount,
        resetLinksCount,
        resetSystemCount,
        refreshAllNotifications
    }
})