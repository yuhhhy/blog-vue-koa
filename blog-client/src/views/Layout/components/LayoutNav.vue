<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore.js'
import { apiUpdateWebsiteVisit } from '@/api/websiteData.js'
import { runAfterPageIdle } from '@/utils/runAfterPageIdle.js'

const themeStore = useThemeStore()

// 设置主题
const toggleTheme = () => {
    document.documentElement.classList.remove(themeStore.theme)
    themeStore.toggleTheme();
    document.documentElement.classList.add(themeStore.theme)
}

onMounted(() => {
    // document.documentElement 指向根元素 <html>
    document.documentElement.classList.add(themeStore.theme)

    runAfterPageIdle(() => {
        apiUpdateWebsiteVisit().catch(() => {})
    })
})
</script>

<template>
    <div class="nav">
        <div class="nav-links">
            <RouterLink to="/home">主页</RouterLink>
            <RouterLink to="/about">关于</RouterLink>
            <RouterLink to="/links">友链</RouterLink>
        </div>
        <button @click="toggleTheme" aria-label="theme-toggle-button" class="theme-toggle">
            <span class="iconfont icon-sun themeIcon" v-if="themeStore.theme === 'light'"></span>
            <span class="iconfont icon-moon themeIcon" v-else style="color: #fff;"></span>
        </button>
        <div class="el-drop-down">
            <el-dropdown placement="top-start">
                <span class="iconfont drop-down-icon">&#xe61b;</span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>
                            <RouterLink to="/home">主页</RouterLink>
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <RouterLink to="/about">关于</RouterLink>
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <RouterLink to="/links">友链</RouterLink>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.nav {
    background-color: var(--white);
    width: 100%;
    height: 64px;

    .nav-links {
        display: none;

        @media (min-width: 768px) {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            gap: 80px;
        }
    }

    a {
        color: var(--dark);

        &:hover {
            color: var(--blue);
        }

        &.active {
            color: var(--blue);
        }
    }

    .el-drop-down {
        display: none;

        @media (max-width: 768px) {
            display: block;
            position: absolute;
            top: 22px;
            left: 30px;
        }

        .iconfont {
            color: var(--black);
            font-size: 15px;
        }
    }

    .themeIcon {
        font-size: 1.2rem;
        position: absolute;
        top: 22px;
        right: 30px;
    }
}

.theme-toggle {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 10px;
}
</style>
