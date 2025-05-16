<script setup>
import MultilevelMenu from './components/MultilevelMenu.vue'
import SinglelevelMenu from './components/SinglelevelMenu.vue'

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
    <MultilevelMenu v-if="item.children" :item="item" :index="index" />
    <!-- v-else一级菜单 -->
    <SinglelevelMenu v-else :item="item" :index="index" />
</template>

<style scoped>
 
</style>