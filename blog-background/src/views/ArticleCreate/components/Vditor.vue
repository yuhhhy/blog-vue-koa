<script setup>
import { ref, onMounted } from 'vue'
import Vditor from 'vditor'
import "~/vditor/src/assets/less/index.less"

const vditorEl = ref()
const emit = defineEmits(['vblur'])

onMounted(() => {
    vditorEl.value = new Vditor("vditorEl", {
        height: '80%',
        width: '100%',
        blur(value) {
            // 触发自定义 blur 事件
            emit('vblur', value)
        },
        // 渲染完成后回调
        after: () => {
            const value = vditorEl.value.getValue()
            emit('vblur', value)
        }
    })
})
</script>

<template>
    <div id="vditorEl"></div>
</template>

<style scoped>
 
</style>