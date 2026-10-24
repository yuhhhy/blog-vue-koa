<script setup>
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiAccountCircleOutline } from '@mdi/js'
import avatarUrl from '@/assets/avatar.jpg'
import MaterialIcon from '@/components/MaterialIcon.vue'
import { useNotificationStore } from '@/stores/notificationStore.js'
import { useUserStore } from '@/stores/userStore.js'

const userStore = useUserStore()
const notificationStore = useNotificationStore()
const route = useRoute()
const router = useRouter()
const isAdmin = computed(() => userStore.userData.role === 'admin')
let notificationTimer = null

const userRoleText = computed(() => ({
  admin: '管理员',
  user: '用户'
})[userStore.userData.role] || userStore.userData.role)

watch(() => route.path, path => {
  if (path.includes('/comment/pending')) notificationStore.resetCommentsCount()
  if (path.includes('/links')) notificationStore.resetLinksCount()
}, { immediate: true })

watch(() => userStore.isAuthenticated, authenticated => {
  if (authenticated && isAdmin.value) fetchNotifications()
})

onMounted(() => {
  if (!isAdmin.value) return

  fetchNotifications()
  notificationTimer = window.setInterval(fetchNotifications, 60000)
})

onBeforeUnmount(() => {
  window.clearInterval(notificationTimer)
})

async function fetchNotifications() {
  if (isAdmin.value) await notificationStore.refreshAllNotifications()
}

function handleLogout() {
  userStore.clearUserData()
}

function handleLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="sidenav-user-menu">
    <el-popover
      v-if="userStore.isAuthenticated"
      width="280"
      placement="right-end"
      popper-class="admin-user-popover-panel"
      :show-arrow="false"
    >
      <template #reference>
        <button class="user-trigger" type="button">
          <span class="avatar-wrap">
            <img class="trigger-avatar" :src="avatarUrl" alt="">
            <span v-if="notificationStore.totalNotifications" class="notification-dot"></span>
          </span>
          <strong class="trigger-username">{{ userStore.userData.username }}</strong>
        </button>
      </template>

      <div class="user-popover">
        <div class="user-meta">
          <img class="popover-avatar" :src="avatarUrl" alt="">
          <div class="user-meta-main">
            <div class="popover-username">{{ userStore.userData.username }}</div>
            <div class="popover-email">{{ userStore.userData.email }}</div>
          </div>
          <el-tag :type="isAdmin ? 'success' : 'primary'" effect="light">
            {{ userRoleText }}
          </el-tag>
        </div>
        <RouterLink v-if="isAdmin" to="/comment/pending" class="popover-link">
          <span>待审评论</span>
          <span v-if="notificationStore.pendingCommentsCount" class="notice-count">
            {{ notificationStore.pendingCommentsCount }}
          </span>
        </RouterLink>
        <RouterLink v-if="isAdmin" to="/links" class="popover-link">
          <span>友链申请</span>
          <span v-if="notificationStore.pendingLinksCount" class="notice-count">
            {{ notificationStore.pendingLinksCount }}
          </span>
        </RouterLink>
        <RouterLink to="/" class="popover-link">
          <span>系统通知</span>
          <span v-if="notificationStore.unreadSystemCount" class="notice-count">
            {{ notificationStore.unreadSystemCount }}
          </span>
        </RouterLink>
        <button class="popover-link logout-link" type="button" @click="handleLogout">
          退出登录
        </button>
      </div>
    </el-popover>

    <button v-else class="user-trigger" type="button" @click="handleLogin">
      <span class="login-icon"><MaterialIcon :path="mdiAccountCircleOutline" /></span>
      <strong class="trigger-username">登录</strong>
    </button>
  </div>
</template>

<style scoped>
.sidenav-user-menu {
  display: flex;
  align-items: center;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 48px;
  gap: 8px;
  padding: 8px 14px;
  border: 0;
  border-radius: 999px;
  color: var(--admin-text);
  background: var(--admin-surface-muted);
  cursor: pointer;
  transition: background-color 180ms ease;
}

.user-trigger:hover {
  background: var(--admin-surface-high);
}

.avatar-wrap {
  position: relative;
  flex: 0 0 auto;
}

.trigger-avatar,
.login-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.trigger-avatar {
  display: block;
  object-fit: cover;
}

.login-icon {
  display: grid;
  place-items: center;
  color: var(--admin-text-muted);
  font-size: 22px;
  background: var(--admin-surface-high);
}

.notification-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 9px;
  height: 9px;
  border: 2px solid var(--admin-bg-soft);
  border-radius: 50%;
  background: var(--admin-danger);
}

.trigger-username {
  min-width: 0;
  max-width: 112px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}

.user-popover {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-meta {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 10px 10px 14px;
  border-bottom: 1px solid var(--admin-line);
}

.popover-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.user-meta-main {
  min-width: 0;
}

.popover-username,
.popover-email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popover-username {
  color: var(--admin-text);
  font-size: 14px;
  font-weight: 700;
}

.popover-email {
  margin-top: 3px;
  color: var(--admin-text-muted);
  font-size: 12px;
}

.popover-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--admin-radius-sm);
  color: var(--admin-text);
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  cursor: pointer;
}

.popover-link:hover {
  background: var(--admin-primary-soft);
}

.notice-count {
  display: inline-grid;
  min-width: 22px;
  min-height: 22px;
  place-items: center;
  padding: 0 6px;
  border-radius: 999px;
  color: #410002;
  font-size: 12px;
  background: var(--admin-danger-soft);
}

.logout-link {
  text-align: left;
}

:global(.admin-user-popover-panel.el-popper) {
  padding: 8px;
  border: 1px solid var(--admin-line);
  border-radius: var(--admin-radius);
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
}
</style>
