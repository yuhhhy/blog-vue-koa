<script setup>
import Tag from '@/components/Tag/index.vue'

const tagList = [
    {
        tagImg: '&#xe632;',
        tagName: 'HTML',
        tagHours: 100,
        tagProgress: 90,
        tagNumber: 19,
        progressColor: '#ff9470'
    },
    {
        tagImg: '&#xe61e;',
        tagName: 'CSS',
        tagHours: 99,
        tagProgress: 78,
        tagNumber: 10,
        progressColor: '#5cb1f6'
    },
    {
        tagImg: '&#xe704;',
        tagName: 'JavaScript',
        tagHours: 66,
        tagProgress: 60,
        tagNumber: 1,
        progressColor: '#efdf60'
    },
    {
        tagImg: '&#xe79a;',
        tagName: 'Vue',
        tagHours: 65,
        tagProgress: 55,
        tagNumber: 3,
        progressColor: '#b6ed5c'
    },
      {
        tagImg: '&#xe799;',
        tagName: 'Webpack',
        tagHours: 2,
        tagProgress: 25,
        tagNumber: 2,
        progressColor: '#8ED6FB'
    },
]
</script>

<template>
    <div class="sidebar-tags">
        <div class="sidebar-tags-title">我的技能</div>
        <Tag v-for="tag in tagList" :tag="tag"></Tag>
    </div>
</template>

<style lang="scss" scoped>
.sidebar-tags {
    background-color: var(--white);
    color: var(--black);
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    padding: 10px;
    &:hover {
        box-shadow: 0 0 6px var(--cyan);
        transition: 0.4s;
    }
    .sidebar-tags-title {
        font-weight: bold;
        font-size: 1.2rem;
        margin-left: 10px;
        margin-bottom: 20px;
        margin-top: 10px;
    }
}
</style>