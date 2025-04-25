<script setup>
import Tag from '@/views/Tag/index.vue'

const tagList = [
    {
        tagImg: new URL('@/assets/HTML5.jpg', import.meta.url).href,
        tagName: 'HTML',
        tagHours: 100,
        tagProcess: 90,
        tagNumber: 19
    },
    {
        tagImg: new URL('@/assets/CSS.jpg', import.meta.url).href,
        tagName: 'CSS',
        tagHours: 99,
        tagProcess: 60,
        tagNumber: 10
    },
    {
        tagImg: new URL('@/assets/js.jpg', import.meta.url).href,
        tagName: 'JavaScript',
        tagHours: 66,
        tagProcess: 40,
        tagNumber: 1
    },
    {
        tagImg: new URL('@/assets/Vue.png', import.meta.url).href,
        tagName: 'Vue',
        tagHours: 65,
        tagProcess: 30,
        tagNumber: 3
    },
      {
        tagImg: new URL('@/assets/webpack.jpg', import.meta.url).href,
        tagName: 'Webpack',
        tagHours: 2,
        tagProcess: 5,
        tagNumber: 2
    },
]
</script>

<template>
    <div class="sidebar-tags">
        <Tag v-for="tag in tagList" :tag="tag"></Tag>
    </div>
</template>

<style lang="scss" scoped>
.sidebar-tags {
    background-color: #FFF;
    margin-bottom: 20px;
    border-radius: 4px;
    overflow: hidden;
    width: 100%;           
}
</style>