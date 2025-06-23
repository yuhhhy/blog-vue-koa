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
            <div>
                <p>© 2025 一曝十寒.</p>
            </div>
            <div>
                <p>赣ICP备2025063071号</p>
            </div>
            <div class="police">
                <img src="https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png" alt="公安备案">
                <p>赣公网安备36110202000678号</p>
            </div>

        </div>
        <div class="right-footer">
            <RouterLink to="/info" class="info-title">信息</RouterLink>
            <el-popover class="footer-popover" popper-class="popover" placement="top">
                <span class="iconfont icon-qq" style="color:#ccc; font-size: 22px; cursor: pointer;" title="点击复制QQ号"
                    @click="copyToClipboard('281423846', 'QQ号')">
                </span>
                <span class="iconfont icon-weixin" style="color:#ccc; font-size: 24px; cursor: pointer;" title="点击复制微信号"
                    @click="copyToClipboard('yzczhdyy109', '微信号')">
                </span>
                <span class="iconfont icon-youxiang-"
                    style="color:#ccc; font-size: 18px; margin-top: 3px; cursor: pointer;" title="点击复制邮箱"
                    @click="copyToClipboard('yuhhhy109@163.com', '邮箱')">
                </span>
                <template #reference>
                    <div class="info-title contact">
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
        align-items: center;
        justify-content: center;
        gap: 20px;
        
        p {
            margin: 0;
            color: var(--light-dark);
        }

        .police {
            display: flex;
            align-items: center;
            gap: 5px;
            
            img {
                width: 15px;
                height: 15px;
                position: relative;
                top: 2px;
            }
        }
    }

    .right-footer {
        display: flex;
        gap: 25px;

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

            .contact {
                display: none;
            }
        }

    }
    
}
</style>