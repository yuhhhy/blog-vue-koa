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
        <template #title>
            <el-icon v-if="item.icon" class="menu-icon">
                <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
        </template>
        <!-- 子菜单 -->
        <router-link v-for="(child, childIndex) in item.children" :to="child.link">
            <el-menu-item :index="child.link || `${index}-${childIndex}`">
                <el-icon v-if="child.icon" class="menu-icon">
                    <component :is="child.icon" />
                </el-icon>
                {{ child.title }}
            </el-menu-item>
        </router-link>
    </el-sub-menu>
</template>

<style scoped>
.menu-icon {
    margin-right: 10px;
}
</style>
