<script setup>
import Tag from '@/components/Tag/index.vue'

const tagList = [
    {
        tagImg: '&#xe632;',
        tagName: 'HTML',
        tagHours: 100,
        tagProgress: 90,
        tagNumber: 19,
        progressColor: '#03A7FA'
    },
    {
        tagImg: '&#xe61e;',
        tagName: 'CSS',
        tagHours: 99,
        tagProgress: 78,
        tagNumber: 10,
        progressColor: '#E101FB'
    },
    {
        tagImg: '&#xe704;',
        tagName: 'JavaScript',
        tagHours: 66,
        tagProgress: 60,
        tagNumber: 1,
        progressColor: '#FD9E02'
    },
    {
        tagImg: '&#xe79a;',
        tagName: 'Vue',
        tagHours: 65,
        tagProgress: 55,
        tagNumber: 3,
        progressColor: '#8ED320'
    },
      {
        tagImg: '&#xe799;',
        tagName: 'Webpack',
        tagHours: 2,
        tagProgress: 25,
        tagNumber: 2,
        progressColor: '#FD9E02'
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