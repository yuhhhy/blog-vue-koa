<script setup>
import MaterialIcon from '@/components/MaterialIcon.vue'

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
        <el-menu-item :index="index" :aria-label="item.title">
            <el-icon v-if="item.icon" class="menu-icon">
                <MaterialIcon :path="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
        </el-menu-item>
    </router-link>
</template>

<style scoped>
.menu-icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
    font-size: 22px;
}
</style>
