<script setup>
 defineProps({
    item: {
        type: Object,
        required: true
    },
    index: {
        type: String,
        required: true
     }
})
</script>

<template>
 <el-sub-menu :index="index">
        <template #title>{{ item.title }}</template>
        <!-- 子菜单 -->
        <router-link v-for="(child, childIndex) in item.children" :to="child.link">
            <el-menu-item :index="`${index}-${childIndex}`">
                {{ child.title }}
            </el-menu-item>
        </router-link>
    </el-sub-menu>
</template>

<style scoped>
 
</style>