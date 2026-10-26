<template>
    <div class="footer-info">
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
    padding: 0 30px 22px;
    z-index: 999;
    font-size: 0.875rem;

    .footer-record {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px 18px;
        width: min(1080px, 100%);
        margin: 0 auto;
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

    @media (max-width: 900px) {
        margin-top: 72px;
        padding: 0 20px 20px;

        .footer-record {
            justify-content: flex-start;
        }
    }
    
}
</style>
