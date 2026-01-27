<script setup>
import MultiLevelMenu from './components/MultiLevelMenu.vue'
import SingleLevelMenu from './components/SingleLevelMenu.vue'

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
    <!-- v-if多级菜单 -->
    <MultiLevelMenu v-if="item.children" :item="item" :index="index" />
    <!-- v-else一级菜单 -->
    <SingleLevelMenu v-else :item="item" :index="index" />
</template>

<style scoped>
 
</style>