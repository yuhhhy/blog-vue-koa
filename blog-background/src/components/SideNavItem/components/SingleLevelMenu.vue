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
     <router-link :to="item.link">
        <el-menu-item :index="index">
            {{ item.title }}
        </el-menu-item>
    </router-link>
</template>

<style scoped>
 
</style>