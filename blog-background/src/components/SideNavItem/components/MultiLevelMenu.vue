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
 <el-sub-menu :index="index">
        <template #title>
            <el-icon v-if="item.icon" class="menu-icon">
                <MaterialIcon :path="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
        </template>
        <!-- 子菜单 -->
        <router-link v-for="(child, childIndex) in item.children" :to="child.link">
            <el-menu-item :index="child.link || `${index}-${childIndex}`">
                <el-icon v-if="child.icon" class="menu-icon child-menu-icon">
                    <MaterialIcon :path="child.icon" />
                </el-icon>
                {{ child.title }}
            </el-menu-item>
        </router-link>
    </el-sub-menu>
</template>

<style scoped>
.menu-icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
    font-size: 22px;
}

.child-menu-icon {
    font-size: 20px;
}
</style>
