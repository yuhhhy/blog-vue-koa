<script setup>
import "~/vditor/src/assets/less/index.less"
import Vditor from 'vditor'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useArticleStore } from '@/stores/articleStore.js'
import { useUserStore } from '@/stores/userStore.js'
import cfg from '@/config/index.js'
const baseApi = cfg.baseApi


const vditorEl = ref()
const timer = ref(null)
const emit = defineEmits(['vblur'])
const props = defineProps(['content'])
const articleStore = useArticleStore()
const userStore = useUserStore()

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
    timer.value = setInterval(checkOverlay, 100)
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
        },
        // 图片上传配置
        // 没有设置不允许未登录和非管理员用户上传图片
        upload: {
            // 必须设置上传的文件字段名为 file，符合后端配置
            fieldName: 'file',
            url: `${baseApi}/upload/image`, // 设置上传接口URL
            accept: 'image/jpeg',  // 明确指定接受JPEG格式
            success: (editor, msg) => {
                const response = JSON.parse(msg)
                setTimeout(() => {
                    ElMessage.success(`上传成功：${response.filename}`)
                }, 5000)
            }
        },
    })
})

// 组件卸载时清理定时器
onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
    }
})

</script>

<template>
    <div id="vditorEl"></div>
</template>

<style scoped>
 
</style>