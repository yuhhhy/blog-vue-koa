<script setup>
import "~/vditor/src/assets/less/index.less"
import Vditor from 'vditor'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useArticleStore } from '@/stores/articleStore.js'

const vditorEl = ref()
const emit = defineEmits(['vblur'])
const props = defineProps(['content'])
const articleStore = useArticleStore()

// 编辑界面判断是否切换编辑的文章
if (props.content) {
    const overlayDisplay = ref('none')
    const checkOverlay = () => {
        const overlay = document.querySelector('.el-overlay')
        if (overlay) {
            overlayDisplay.value = window.getComputedStyle(overlay).display
        }
    }
    watch(overlayDisplay, (newValue) => {
        if (newValue !== 'none') {
            vditorEl.value.setValue(props.content)
        }
    })
    const timer = setInterval(checkOverlay, 100)
}


onMounted(() => {
    vditorEl.value = new Vditor("vditorEl", {
        height: '80%',
        width: '100%',
        // 存储
        blur(value) {
            // 如果是新建文章界面
            if (!props.content) {
                articleStore.setCreateArticle(value)
            }
            // 触发自定义 blur 事件
            emit('vblur', value)
        },
        // 初始化
        after: () => {
            // 如果是编辑文章界面
            if (props.content) {
                vditorEl.value.setValue(props.content)
                articleStore.setLastOneEdit(true)
            }
            // 如果是新建文章界面
            else {
                // 如果上一个是编辑文章界面
                if (articleStore.lastOneEdit) {
                    const value = articleStore.createArticle
                    vditorEl.value.setValue(value)
                    articleStore.setLastOneEdit(false)
                } else {
                    const value = vditorEl.value.getValue()
                    emit('vblur', value)
                    articleStore.setLastOneEdit(false)
                }
            }
        }
    })
})

// 组件卸载时清理定时器
onUnmounted(() => {
    if (props.content) {
        clearInterval(timer)
    }
})



</script>

<template>
    <div id="vditorEl"></div>
</template>

<style scoped>
 
</style>