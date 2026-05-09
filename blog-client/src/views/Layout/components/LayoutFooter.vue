<script setup>
import { RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'

// 复制内容到剪贴板
const copyToClipboard = async (text, type) => {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`${type}已复制`)
}

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
                    <span class="iconfont icon-qq"></span>
                    QQ
                </button>
                <button type="button" @click="copyToClipboard('yzczhdyy109', '微信号')">
                    <span class="iconfont icon-weixin"></span>
                    微信
                </button>
                <button type="button" @click="copyToClipboard('yuhhhy109@163.com', '邮箱')">
                    <span class="iconfont icon-youxiang-"></span>
                    邮箱
                </button>
            </div>

            <div class="footer-column">
                <div class="column-title">关注</div>
                <a href="https://github.com/yuhhhy" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://space.bilibili.com/76781252" target="_blank" rel="noopener noreferrer">Bilibili</a>
                <a href="https://juejin.cn/user/3798140261765715/posts" target="_blank" rel="noopener noreferrer">稀土掘金</a>
                <a href="/feed" target="_blank" rel="noopener noreferrer">RSS</a>
            </div>
        </div>

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

        button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 0;
            border: 0;
            background: transparent;
            cursor: pointer;
        }

        .iconfont {
            font-size: 1rem;
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

        .footer-record {
            justify-content: flex-start;
            margin-top: 30px;
        }
    }
    
}
</style>
