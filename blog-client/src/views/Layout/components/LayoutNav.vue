<script setup>
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore.js'
import { apiUpdateWebsiteVisit } from '@/api/websiteData.js'
import { useRoute } from 'vue-router'

// 替换 useWindowScroll
const y = ref(0)
const themeStore = useThemeStore()
const lastScrollTop = ref(0)
const shouldHideNav = ref(false)
const route = useRoute()

// 计算属性，检查当前是否在博客页面
const isInBlogPage = computed(() => {
  return route.path.startsWith('/blog')
})

// 原生的滚动事件处理函数
const handleScroll = () => {
  // 获取当前滚动位置
  const newY = window.scrollY || window.pageYOffset
  y.value = newY

  // 判断滚动方向
  if (newY > lastScrollTop.value) {
    // 向下滚动，隐藏导航栏
    shouldHideNav.value = true
  } else {
    // 向上滚动，显示导航栏
    shouldHideNav.value = false
  }
  // 更新上一次的滚动位置
  lastScrollTop.value = newY > 0 ? newY : 0
}

// 设置主题
const toggleTheme = () => {
    document.documentElement.classList.remove(themeStore.theme)
    themeStore.toggleTheme();
    document.documentElement.classList.add(themeStore.theme)
}

onMounted(() => {
    // 添加滚动事件监听器
    window.addEventListener('scroll', handleScroll)
    
    // document.documentElement 指向根元素 <html>
    document.documentElement.classList.add(themeStore.theme)
    
    // 每次打开网站，即Nav挂载，访问量增加
    apiUpdateWebsiteVisit()
})

// 组件卸载时移除事件监听器
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
    <div class="nav" :class="{ unshow: shouldHideNav && y > 64 }">
        <div class="nav-links">
            
            <RouterLink to="/home"><span class="iconfont icon-home" style="font-size: 15px; margin-right: 7px;"></span>主页</RouterLink>
            <RouterLink to="/archive"><span class="iconfont icon-archive" style="font-size: 15px; margin-right: 8px;"></span>归档</RouterLink>
            <RouterLink to="/about"><span class="iconfont icon-svgabout" style="font-size: 15px; margin-right: 7px;"></span>关于</RouterLink>
            <RouterLink to="/links"><span class="iconfont icon-link" style="font-size: 15px; margin-right: 6px;"></span>友链</RouterLink>
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
                            <RouterLink to="/archive">归档</RouterLink>
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
    <!-- 只在博客页面显示回到顶部按钮 -->
    <el-backtop 
        v-if="isInBlogPage" 
        :right="16" 
        :bottom="100" 
        style="color: var(--white); background-color: rgba(88, 183, 255, 0.8)" 
    />
</template>

<style lang="scss" scoped>
.nav {
    background-color: var(--white);
    width: 100%;
    height: 64px;
    position: fixed;
    top: 0;
    left: 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    transition: all 0.5s;

    .nav-links {
        display: none;

        @media (min-width: 768px) {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            gap: 50px;
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

.unshow {
    transform: translateY(-100%);
    opacity: 0;
    transition: transform 0.3s ease-in-out;
}

.theme-toggle {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 10px;
}
</style>
