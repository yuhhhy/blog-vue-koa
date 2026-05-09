<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import { apiGetWebsiteData } from '@/api/websiteData.js'
import { runAfterPageIdle } from '@/utils/runAfterPageIdle.js'

const runTime = ref(0)
const totalPosts = ref(0)
const websiteVisits = ref(0)
const websiteViews = ref(0)
const updateTime = ref('')
const totalWordCount = ref(0)

function getRunTime(startTime) {
    const startDate = new Date(startTime)
    const currentDate = new Date()
    const diff = currentDate.getTime() - startDate.getTime()
    return Math.round(diff / (24 * 60 * 60 * 1000))
}

const formatCount = (count) => {
    if (!count) return '0 k'
    return count >= 1000
        ? (count / 1000).toFixed(1) + ' k'
        : count + ''
}

async function getWebsiteData() {
    const websiteData = await apiGetWebsiteData()
    websiteVisits.value = websiteData.visit.total
    websiteViews.value = websiteData.view.total
    totalPosts.value = websiteData.article.total
    updateTime.value = websiteData.updateTime
    totalWordCount.value = websiteData.totalWordCount
}

// 复制内容到剪贴板
const copyToClipboard = async (text, type) => {
    await navigator.clipboard.writeText(text)
    ElMessage.info(`${type}已复制`)
}

onMounted(() => {
    runTime.value = getRunTime('2025-06-16')
    runAfterPageIdle(() => {
        getWebsiteData().catch(() => {})
    }, 2500)
})

</script>

<template>
    <div class="footer-info">
        <div class="footer-main">
            <div class="footer-brand">
                <div class="footer-title">一曝十寒</div>
                <p>纵使不安彷徨，即便茫然无措，也依然迈步前行。</p>
            </div>

            <div class="footer-column">
                <div class="column-title">站点</div>
                <RouterLink to="/home">主页</RouterLink>
                <RouterLink to="/about">关于</RouterLink>
                <RouterLink to="/links">友链</RouterLink>
                <RouterLink to="/info">信息</RouterLink>
            </div>

            <div class="footer-column">
                <div class="column-title">联系</div>
                <button type="button" @click="copyToClipboard('281423846', 'QQ号')">
                    QQ
                </button>
                <button type="button" @click="copyToClipboard('yzczhdyy109', '微信号')">
                    微信
                </button>
                <button type="button" @click="copyToClipboard('yuhhhy109@163.com', '邮箱')">
                    邮箱
                </button>
            </div>

            <div class="footer-column">
                <div class="column-title">关注</div>
                <a href="https://github.com/yuhhhy" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                        <title>GitHub</title>
                        <path
                            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12">
                        </path>
                    </svg>
                    GitHub
                </a>
                <a href="https://space.bilibili.com/76781252" target="_blank" rel="noopener noreferrer">
                    <svg class="footer-svg" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                        <title>Bilibili</title>
                        <path
                            d="M306.005333 117.632L444.330667 256h135.296l138.368-138.325333a42.666667 42.666667 0 0 1 60.373333 60.373333L700.330667 256H789.333333A149.333333 149.333333 0 0 1 938.666667 405.333333v341.333334a149.333333 149.333333 0 0 1-149.333334 149.333333h-554.666666A149.333333 149.333333 0 0 1 85.333333 746.666667v-341.333334A149.333333 149.333333 0 0 1 234.666667 256h88.96L245.632 177.962667a42.666667 42.666667 0 0 1 60.373333-60.373334zM789.333333 341.333333h-554.666666a64 64 0 0 0-63.701334 57.856L170.666667 405.333333v341.333334a64 64 0 0 0 57.856 63.701333L234.666667 810.666667h554.666666a64 64 0 0 0 63.701334-57.856L853.333333 746.666667v-341.333334A64 64 0 0 0 789.333333 341.333333zM341.333333 469.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666666-42.666667z m341.333334 0a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667z"></path>
                    </svg>
                    Bilibili
                </a>
                <a href="https://juejin.cn/user/3798140261765715/posts" target="_blank" rel="noopener noreferrer">
                    <svg class="footer-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 22">
                        <title>稀土掘金</title>
                        <path
                            d="m12 14.316l7.454-5.88l-2.022-1.625L12 11.1l-.004.003l-5.432-4.288l-2.02 1.624l7.452 5.88Zm0-7.247l2.89-2.298L12 2.453l-.004-.005l-2.884 2.318l2.884 2.3Zm0 11.266l-.005.002l-9.975-7.87L0 12.088l.194.156l11.803 9.308l7.463-5.885L24 12.085l-2.023-1.624Z">
                        </path>
                    </svg>
                    稀土掘金
                </a>
                <a class="rss-link" href="/feed" target="_blank" rel="noopener noreferrer">
                    <svg class="footer-svg rss-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                        <title>RSS</title>
                        <path
                            d="M277.48 862.169c0 53.59-43.44 97.03-97.03 97.03s-97.04-43.44-97.04-97.03 43.44-97.03 97.03-97.03 97.04 43.44 97.04 97.03z m-78.26-797.41c-29.33-3.57-58.8 5.53-80.99 25.04a101.35 101.35 0 0 0-34.43 75.9c0.65 51.8 39.7 95.05 91.17 100.95 286.8 36.39 528.22 295.41 561.08 602.55 5.25 51.46 48.83 90.46 100.56 89.99 29.77 0.45 58.29-11.96 78.25-34.05a98.961 98.961 0 0 0 25.04-78.25c-44.21-396.75-361.93-733.63-740.68-780.98v-1.15z m6.65 334.15c-29.07-6.84-59.66 0.1-82.95 18.78a102.547 102.547 0 0 0-39.13 81c-0.22 47.06 32.34 87.92 78.25 98.21 117.38 28.17 219.11 143.2 244.94 278.97 9.39 46.99 50.3 81.05 98.21 81.78 30.24-0.07 58.9-13.54 78.25-36.78a98.616 98.616 0 0 0 21.52-81.78c-39.91-211.67-204.24-393.23-399.1-439.4v-0.78z"></path>
                        <path
                            d="M119.01 937.289l135.77-135.77a95.832 95.832 0 0 1 22.69 61.43c0 53.59-43.44 97.03-97.04 97.03a95.88 95.88 0 0 1-61.42-22.69z m449.18-449.18a704.262 704.262 0 0 1 167.46 381.88c5.25 51.46 48.83 90.46 100.56 89.99 29.77 0.47 58.3-11.94 78.25-34.05a99.009 99.009 0 0 0 25.04-78.25 905.773 905.773 0 0 0-226.55-504.35l-144.76 144.78z m-162.77 388.92c9.39 46.99 50.3 81.05 98.21 81.78 30.24-0.06 58.91-13.53 78.25-36.78 19.1-22.64 27-52.67 21.52-81.78a586.957 586.957 0 0 0-125.6-263.72l-143.99 143.99a384.029 384.029 0 0 1 71.61 156.51z"></path>
                    </svg>
                    RSS
                </a>
            </div>
        </div>

        <!-- <div class="footer-stats">
            <span>文章总数：{{ totalPosts }}</span>
            <span>全站字数：{{ formatCount(totalWordCount) }}</span>
            <span>访问量：{{ formatCount(websiteVisits) }}</span>
            <span>浏览量：{{ formatCount(websiteViews) }}</span>
            <span>运行天数：{{ runTime }}</span>
            <span>最后更新：{{ updateTime.slice(0, 10) }}</span>
        </div> -->

        <div class="footer-record">
            <span>© 2025 一曝十寒.</span>
            <span>赣ICP备2025063071号</span>
            <span class="police">
                <img src="@/assets/images/police.ico" alt="公安备案">
                赣公网安备36110202000678号
            </span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.footer-info {
    background-color: var(--white);
    color: var(--black);
    width: 100%;
    margin-top: 120px;
    padding: 46px 30px 22px;
    z-index: 999;
    font-size: 0.875rem;

    .footer-main {
        display: grid;
        grid-template-columns: minmax(220px, 1.5fr) repeat(3, minmax(120px, 1fr));
        gap: 48px;
        width: min(1080px, 100%);
        margin: 0 auto;
    }

    .footer-brand {
        .footer-title {
            color: var(--blue);
            font-family: var(--font-serif);
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 14px;
        }

        p {
            margin: 0;
            color: var(--light-dark);
            line-height: 1.8;
        }
    }

    .footer-stats {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px 18px;
        width: min(1080px, 100%);
        margin: 32px auto 0;
        color: var(--quote-color);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 0.75rem;
        font-weight: 400;
        line-height: 1.6;
    }

    .footer-column {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .column-title {
            color: var(--black);
            font-weight: 700;
            margin-bottom: 4px;
        }

        a,
        button {
            color: var(--light-dark);
            font: inherit;
            line-height: 1.4;
            transition: color 0.3s ease;
        }

        a {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 0;
            border: 0;
            background: transparent;
            cursor: pointer;
        }

        svg {
            flex: 0 0 auto;
            fill: currentColor;
        }

        .rss-link {
            margin-left: 2px;
        }

        a:hover,
        button:hover {
            color: var(--skyblue);
        }
    }

    .footer-record {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px 18px;
        width: min(1080px, 100%);
        margin: 38px auto 0;
        padding-top: 18px;
        border-top: 1px solid rgba(127, 127, 127, 0.14);
        color: var(--light-dark);
        font-size: 0.75rem;

        .police {
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        img {
            width: 14px;
            height: 14px;
        }
    }

    @media (max-width: 768px) {
        margin-top: 72px;
        padding: 34px 20px 20px;

        .footer-main {
            grid-template-columns: 1fr 1fr;
            gap: 32px 28px;
        }

        .footer-brand {
            grid-column: 1 / -1;
        }

        .footer-stats {
            justify-content: flex-start;
            margin-top: 28px;
        }

        .footer-record {
            justify-content: flex-start;
            margin-top: 30px;
        }
    }
    
}
</style>
