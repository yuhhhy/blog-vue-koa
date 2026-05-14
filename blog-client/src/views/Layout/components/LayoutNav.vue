<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore.js'
import { apiUpdateWebsiteVisit } from '@/api/websiteData.js'
import { runAfterPageIdle } from '@/utils/runAfterPageIdle.js'
import NavSearch from './NavSearch.vue'

const themeStore = useThemeStore()
const route = useRoute()

const navItems = [
    {
        label: '主页',
        to: '/home',
        activePaths: ['/home', '/blog']
    },
    {
        label: '关于',
        to: '/about',
        activePaths: ['/about']
    },
    {
        label: '友链',
        to: '/links',
        activePaths: ['/links']
    }
]

const isNavActive = (item) => {
    return item.activePaths.some(path => route.path === path || route.path.startsWith(`${path}/`))
}

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
            <RouterLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                :class="{ 'nav-link--active': isNavActive(item) }"
            >
                {{ item.label }}
            </RouterLink>
        </div>
        <div class="nav-actions">
            <NavSearch />
            <button @click="toggleTheme" aria-label="theme-toggle-button" class="theme-toggle">
                <span class="iconfont icon-sun themeIcon" v-if="themeStore.theme === 'light'"></span>
                <span class="iconfont icon-moon themeIcon" v-else></span>
            </button>
        </div>
        <div class="el-drop-down">
            <el-dropdown placement="top-start">
                <span class="iconfont drop-down-icon">&#xe61b;</span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item
                            v-for="item in navItems"
                            :key="item.to"
                        >
                            <RouterLink
                                :to="item.to"
                                :class="{ 'nav-link--active': isNavActive(item) }"
                            >
                                {{ item.label }}
                            </RouterLink>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.nav {
    position: relative;
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
        position: relative;
        color: var(--dark);
        font-weight: 500;
        transition: color 0.2s ease, font-weight 0.2s ease;

        &:hover {
            color: var(--dark);
        }

        &::after {
            content: '';
            position: absolute;
            left: 50%;
            bottom: -8px;
            width: 18px;
            height: 2px;
            border-radius: 999px;
            background-color: var(--dark);
            transform: translateX(-50%) scaleX(0);
            transform-origin: center;
            transition: transform 0.2s ease;
        }

        &.nav-link--active {
            font-weight: 700;
        }

        &.nav-link--active::after {
            transform: translateX(-50%) scaleX(1);
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

        a::after {
            bottom: -4px;
        }
    }

    .themeIcon {
        font-size: 1.2rem;
    }
}

.nav-actions {
    position: absolute;
    top: 14px;
    right: 24px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.theme-toggle {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    background: none;
    border: none;
    border-radius: 50%;
    color: var(--dark);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
        background-color: var(--icon-background);
        color: var(--dark);
    }
}
</style>
