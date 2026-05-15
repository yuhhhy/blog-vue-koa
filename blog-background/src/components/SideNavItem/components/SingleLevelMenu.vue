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
            <el-icon v-if="item.icon" class="menu-icon">
                <component :is="item.icon" />
            </el-icon>
            {{ item.title }}
        </el-menu-item>
    </router-link>
</template>

<style scoped>
.menu-icon {
    margin-right: 10px;
}
</style>
