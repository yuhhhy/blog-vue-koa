<script setup>
import { Crepe } from '@milkdown/crepe'
import { replaceAll } from '@milkdown/kit/utils'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useArticleStore } from '@/stores/articleStore.js'
import { useUserStore } from '@/stores/userStore.js'
import cfg from '@/config/index.js'

const props = defineProps({
    content: {
        type: String,
        default: '',
    },
})
const emit = defineEmits(['vblur'])

const editorRoot = ref(null)
const editorReady = ref(false)
const previewMode = ref(false)
const articleStore = useArticleStore()
const userStore = useUserStore()
const baseApi = cfg.baseApi

let crepe = null
let currentMarkdown = ''

const getStaticBase = () => {
    try {
        return new URL(baseApi).origin
    } catch {
        if (typeof baseApi === 'string' && baseApi.endsWith('/api')) {
            return baseApi.slice(0, -4)
        }
        return ''
    }
}

const buildImageUrl = (filename) => {
    const encodedFilename = filename
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/')
    const staticBase = getStaticBase()
    return `${staticBase}/images/${encodedFilename}`
}

const uploadImage = async (file) => {
    if (!file?.type?.startsWith('image/')) {
        throw new Error('请选择图片文件')
    }

    const formData = new FormData()
    formData.append('file', file, file.name)

    try {
        const response = await fetch(`${baseApi}/upload/image`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userStore.userData?.token}`,
                'require-auth': 'true',
            },
            body: formData,
        })

        if (!response.ok) {
            let message = ''
            try {
                const errorData = await response.json()
                message = errorData?.message || errorData?.msg || ''
            } catch {
                message = await response.text().catch(() => '')
            }
            throw new Error(message || `上传失败：${response.status}`)
        }

        const data = await response.json()
        const filename = data?.filename || data?.originalname || file.name
        const imageUrl = buildImageUrl(filename)
        ElMessage.success(`上传成功：${filename}`)
        return imageUrl
    } catch (error) {
        ElMessage.error(error?.message || '图片上传失败，请检查网络或权限')
        throw error
    }
}

const resolveInitialContent = () => {
    if (props.content) return props.content
    return articleStore.createArticle || ''
}

const syncMarkdown = (markdown) => {
    currentMarkdown = markdown
    if (!props.content) articleStore.setCreateArticle(markdown)
    emit('vblur', markdown)
}

const setPreviewMode = (enabled) => {
    previewMode.value = enabled
    crepe?.setReadonly(enabled)
}

const clearContent = () => {
    currentMarkdown = ''
    crepe?.editor.action(replaceAll(''))
    syncMarkdown('')
    setPreviewMode(false)
}

defineExpose({ clearContent })

watch(() => props.content, (content) => {
    if (!editorReady.value || !crepe || content === currentMarkdown) return
    currentMarkdown = content || ''
    crepe.editor.action(replaceAll(currentMarkdown))
})

onMounted(async () => {
    currentMarkdown = resolveInitialContent()
    crepe = new Crepe({
        root: editorRoot.value,
        defaultValue: currentMarkdown,
        features: {
            [Crepe.Feature.TopBar]: true,
            [Crepe.Feature.ImageBlock]: true,
        },
        featureConfigs: {
            [Crepe.Feature.ImageBlock]: {
                onUpload: uploadImage,
                inlineUploadButton: '上传图片',
                blockUploadButton: '上传图片',
                inlineUploadPlaceholderText: '或粘贴图片地址',
                blockUploadPlaceholderText: '或粘贴图片地址',
                blockCaptionPlaceholderText: '添加图片说明',
            },
        },
    })

    crepe.on((listener) => {
        listener.markdownUpdated((_ctx, markdown) => {
            syncMarkdown(markdown)
        })
    })

    try {
        await crepe.create()
        editorReady.value = true
        syncMarkdown(currentMarkdown)
    } catch (error) {
        ElMessage.error('Markdown 编辑器初始化失败')
        console.error(error)
    }
})

onBeforeUnmount(() => {
    editorReady.value = false
    crepe?.destroy()
    crepe = null
})
</script>

<template>
    <div class="milkdown-editor-field">
        <div
            class="milkdown-editor__mode"
            :class="{ 'milkdown-editor__mode--preview': previewMode }"
            role="group"
            aria-label="编辑器模式"
        >
            <button
                type="button"
                :class="{ 'is-active': !previewMode }"
                :aria-pressed="!previewMode"
                @click="setPreviewMode(false)"
            >
                编辑
            </button>
            <button
                type="button"
                :class="{ 'is-active': previewMode }"
                :aria-pressed="previewMode"
                @click="setPreviewMode(true)"
            >
                预览
            </button>
        </div>
        <div class="milkdown-editor" :class="{ 'is-preview': previewMode }">
            <div ref="editorRoot" class="milkdown-editor__surface"></div>
        </div>
    </div>
</template>

<style scoped>
.milkdown-editor {
    overflow: hidden;
    border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    border-radius: var(--admin-radius, 12px);
    background: var(--md-sys-color-surface-container-low, #f7f2fa);
}

.milkdown-editor__mode {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, 72px);
    width: max-content;
    margin: 0 0 12px auto;
    padding: 4px;
    border: 1px solid var(--md-sys-color-outline-variant, #e7e0ec);
    border-radius: 999px;
    background: transparent;
    isolation: isolate;
}

.milkdown-editor__mode::before {
    position: absolute;
    inset: 4px auto 4px 4px;
    z-index: -1;
    width: 72px;
    content: '';
    border-radius: 999px;
    background: var(--admin-primary-soft, #eaddff);
    transition: transform 260ms cubic-bezier(0.2, 0, 0, 1);
}

.milkdown-editor__mode--preview::before {
    transform: translateX(72px);
}

.milkdown-editor__mode button {
    position: relative;
    min-height: 34px;
    border: 0;
    border-radius: 999px;
    padding: 0 12px;
    color: var(--admin-text-muted, #49454f);
    background: transparent;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: color 180ms ease;
}

.milkdown-editor__mode button.is-active {
    color: var(--admin-on-primary-soft, #21005d);
}

.milkdown-editor__mode button:focus-visible {
    outline: 2px solid var(--admin-primary, #6750a4);
    outline-offset: -2px;
}

.milkdown-editor__surface {
    min-height: 420px;
}

.milkdown-editor :deep(.milkdown) {
    min-height: 420px;
    --crepe-color-background: var(--md-sys-color-surface-container-low, #f7f2fa);
    --crepe-color-surface: var(--admin-surface-muted, #f3edf7);
    --crepe-color-surface-low: var(--md-sys-color-surface-container, #f3edf7);
    --crepe-color-on-background: var(--md-sys-color-on-surface, #1d1b20);
    --crepe-color-on-surface: var(--md-sys-color-on-surface, #1d1b20);
    --crepe-color-on-surface-variant: var(--md-sys-color-on-surface-variant, #49454f);
    --crepe-color-outline: var(--md-sys-color-outline, #79747e);
    --crepe-color-primary: var(--md-sys-color-primary, #6750a4);
    --crepe-color-secondary: var(--md-sys-color-secondary-container, #e8def8);
    --crepe-color-hover: var(--md-sys-color-surface-container-high, #ece6f0);
    --crepe-color-selected: var(--md-sys-color-primary-container, #eaddff);
}

.milkdown-editor :deep(.milkdown .ProseMirror) {
    box-sizing: border-box;
    min-height: 360px;
    padding: 28px clamp(20px, 5vw, 64px) 48px;
}

.milkdown-editor.is-preview :deep(.milkdown-top-bar),
.milkdown-editor.is-preview :deep(.milkdown-slash-menu),
.milkdown-editor.is-preview :deep(.milkdown-toolbar) {
    display: none;
}

@media (max-width: 720px) {
    .milkdown-editor__surface,
    .milkdown-editor :deep(.milkdown) {
        min-height: 360px;
    }

    .milkdown-editor :deep(.milkdown .ProseMirror) {
        min-height: 320px;
        padding: 20px 16px 36px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .milkdown-editor__mode::before {
        transition: none;
    }
}
</style>
