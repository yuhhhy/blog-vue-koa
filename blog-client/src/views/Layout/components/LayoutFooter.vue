<script setup>
import { RouterLink } from 'vue-router';
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
            <el-popover
                popper-class="popover"
                content="qq 281423846"
                placement="top"
            >
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
    padding: 0 50px;
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