<script setup>
const props = defineProps({
    tag: {
        type: Object,
        required: true
    }
})
</script>

<template>
    <RouterLink to="#">
        <div class="tag">
            <div class="black-box"></div>
            <img :src="tag.tagImg" class="tag-img" alt="tag-background-image">
            <div class="tag-info">
                <div class="tag-info-left">
                    <div class="tag-name">{{ tag.tagName }}</div>
                    <div class="tag-process">
                        <div class="tag-process-hours">{{ tag.tagHours }}</div>
                        <div class="tag-process-bar">{{ tag.tagProcess }}</div>
                    </div>
                </div>
                <div class="tag-info-right">
                    <div class="tag-achievements">{{ tag.tagNumber }}</div>
                </div>
            </div>
        </div>
    </RouterLink>
</template>

<style lang="scss" scoped>
.tag {
    width: 100%;
    height: 70px;
    display: flex;
    align-items: center;
    padding-left: 5px;
    position: relative;

    &:hover {
        .tag-img {
            transform: translateX(120px);
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                
        }
        .tag-info {
            transform: translateX(120px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        .black-box {
            transform: translateX(120px);
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
    }

    .black-box {
        position: absolute;
        left: -120px;
        top: 0;
        width: 120px;
        height: 100%;
        background-image: url(../../assets/fire1.png);
        background-size: cover;
        z-index: 1;
        transform: translateX(0);
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }

    .tag-img {
        height: 85%;
        width: 65px;
        border-radius: 4px;
        object-fit: cover;  // 保持图片比例
    }

    .tag-info {
        flex: 1;
        height: 100%;
        display: flex;
        border-bottom: 1px solid #F5F5FA;

        .tag-info-left {
            flex: 1;
            margin-left: 10px;
            flex-basis: 90px;
            display: flex;
            flex-direction: column;

            .tag-name {
                margin-top: 6px;
                height: 1.2em;
                font-weight: 700;
            }
            .tag-process {
                flex: 1;
                .tag-process-hours {
                    height: 60%;
                    display: flex;
                    align-items: end;
                }
                .tag-process-bar {
                    height: 40%;
                }
            }
        }

        .tag-info-right {
            flex: 1;
            position: relative;

            .tag-achievements {
                position: absolute;
                right: 8px;
                bottom: 4px;
                font-size: 15px;
            }
        }
    }

}
</style>