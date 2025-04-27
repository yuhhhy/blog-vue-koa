<template>
    <div class="footer-info">
        <div class="left-footer">
                <p>© 2025 一曝十寒. All rights reserved.</p>
        </div>
        <div class="right-footer">
            <a href="#">关于</a>
            <a href="#">归档</a>
            <a href="#">联系</a>
        </div>
    </div>

</template>

<script setup>

</script>

<style lang="scss" scoped>
.footer-info {
    background-color: #fff;
    width: 100%;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 50px;
    z-index: 999;
    font-size: 0.875rem;

    .right-footer {
        display: flex;
        gap: 50px;
    }

    @media (max-width: 768px) {
        padding: 0 20px;
        .right-footer {
            gap: 20px;
        }
    }
    
}
</style>