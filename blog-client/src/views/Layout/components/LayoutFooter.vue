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
        <div class="left-footer">
            <div><p>© 2025 一曝十寒. All rights reserved. </p></div>
            <div><p>赣ICP备2025063071号</p></div>
        </div>
        <div class="right-footer">
            <RouterLink to="/about" class="info-title">关于</RouterLink>
            <RouterLink to="/archive" class="info-title">归档</RouterLink>
            <RouterLink to="/" class="info-title">友链</RouterLink>
            <el-popover
                class="footer-popover"
                popper-class="popover"
                placement="top"
            >
                <span 
                    class="iconfont" 
                    style="color:#ccc; font-size: 22px;"
                    title="点击复制QQ号"
                    @click="copyToClipboard('281423846', 'QQ号')">
                    &#xe604;
                </span>
                <span 
                    class="iconfont" 
                    style="color:#ccc; font-size: 24px;"
                    title="点击复制微信号"
                    @click="copyToClipboard('yzczhdyy109', '微信号')">
                    &#xe601;
                </span>
                <template #reference>
                    <div class="info-title">
                        联系
                    </div>
                </template>
            </el-popover>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.footer-info {
    background-color: var(--white);
    color: var(--black);
    width: 100%;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    z-index: 999;
    font-size: 0.875rem;

    .left-footer {
        display: flex;
        gap: 20px;
        p {
            margin: 0;
            color: var(--light-dark);
        }
    }

    .right-footer {
        display: flex;
        gap: 50px;

        .info-title {
            transition: color 0.3s ease;
            cursor: pointer;
            &:hover {
                color: var(--skyblue);
            }
        }
    }

    @media (max-width: 768px) {
        padding: 0 20px;
        .right-footer {
            gap: 20px;
        }
    }
    
}
</style>