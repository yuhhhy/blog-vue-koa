<script setup>
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { mdiEyeOutline } from '@mdi/js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BlogMarkdownPreview from './BlogMarkdownPreview.vue'
import AdminLoadingState from '@/components/admin/AdminLoadingState.vue'
import MaterialIcon from '@/components/MaterialIcon.vue'
import { useArticleStore } from '@/stores/articleStore.js'
import { useUserStore } from '@/stores/userStore.js'
import cfg from '@/config/index.js'

const props = defineProps({
    content: {
        type: String,
        default: '',
    },
    persistDraft: {
        type: Boolean,
        default: true,
    },
})
const emit = defineEmits(['vblur'])

const editorRoot = ref(null)
const editorReady = ref(false)
const viewMode = ref('edit')
const previewMarkdown = ref('')
const articleStore = useArticleStore()
const userStore = useUserStore()

let editor = null
let currentMarkdown = ''

const getStaticBase = () => {
    try {
        return new URL(cfg.baseApi).origin
    } catch {
        return typeof cfg.baseApi === 'string' && cfg.baseApi.endsWith('/api')
            ? cfg.baseApi.slice(0, -4)
            : ''
    }
}

const buildImageUrl = (filename) => {
    const encodedFilename = filename
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/')
    return `${getStaticBase()}/images/${encodedFilename}`
}

const syncMarkdown = (markdown, force = false) => {
    if (!force && markdown === currentMarkdown) return
    currentMarkdown = markdown
    previewMarkdown.value = markdown
    if (props.persistDraft) articleStore.setCreateArticle(markdown)
    emit('vblur', markdown)
}

const uploadImages = async (files) => {
    const images = files.filter((file) => file?.type?.startsWith('image/'))
    if (images.length !== files.length) return '只能上传图片文件'

    try {
        const markdownList = []
        for (const file of images) {
            const formData = new FormData()
            formData.append('file', file, file.name)
            formData.append('convertToAvif', 'true')
            const response = await fetch(`${cfg.baseApi}/upload/image`, {
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
            markdownList.push(`![${filename}](${buildImageUrl(filename)})`)
        }

        editor?.insertMD(`${markdownList.join('\n')}\n`)
        if (editor) syncMarkdown(editor.getValue())
        ElMessage.success(images.length > 1 ? `${images.length} 张图片上传成功` : '图片上传成功')
        return null
    } catch (error) {
        ElMessage.error(error?.message || '图片上传失败，请检查网络或权限')
        return error?.message || '图片上传失败'
    }
}

const resolveInitialContent = () => {
    if (!props.persistDraft) return props.content || ''
    return props.content || articleStore.createArticle || ''
}

const clearContent = () => {
    currentMarkdown = ''
    editor?.setValue('', true)
    syncMarkdown('', true)
    setViewMode('edit')
}

const setViewMode = (mode) => {
    if (!editorReady.value || !editor || viewMode.value === mode) return
    if (mode === 'preview') previewMarkdown.value = editor.getValue()
    viewMode.value = mode

    if (mode === 'edit') requestAnimationFrame(() => editor?.focus())
}

const editorToolbar = [
    'emoji',
    'headings',
    'bold',
    'italic',
    'strike',
    'link',
    '|',
    'list',
    'ordered-list',
    'check',
    'outdent',
    'indent',
    '|',
    'quote',
    'line',
    'code',
    'inline-code',
    'insert-before',
    'insert-after',
    '|',
    'upload',
    'record',
    'table',
    '|',
    'undo',
    'redo',
    '|',
    'fullscreen',
    {
        name: 'more',
        toolbar: ['code-theme', 'content-theme', 'export', 'outline', 'devtools', 'info', 'help'],
    },
    {
        name: 'toggle-preview',
        tip: '预览文章',
        tipPosition: 'nw',
        className: 'vditor-editor__preview-toggle',
        icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${mdiEyeOutline}"></path></svg>`,
        click: () => setViewMode('preview'),
    },
]

defineExpose({ clearContent })

watch(() => props.content, (content) => {
    const nextMarkdown = content || ''
    if (nextMarkdown === currentMarkdown) return
    currentMarkdown = nextMarkdown
    previewMarkdown.value = nextMarkdown
    if (editorReady.value && editor?.getValue() !== nextMarkdown) {
        editor.setValue(nextMarkdown, true)
    }
})

onMounted(() => {
    currentMarkdown = resolveInitialContent()
    previewMarkdown.value = currentMarkdown

    editor = new Vditor(editorRoot.value, {
        value: currentMarkdown,
        width: '100%',
        height: '80vh',
        minHeight: 320,
        lang: 'zh_CN',
        mode: 'wysiwyg',
        cache: { enable: false },
        toolbar: editorToolbar,
        toolbarConfig: { pin: true },
        upload: {
            accept: 'image/*',
            multiple: true,
            handler: uploadImages,
        },
        input: (value) => syncMarkdown(value),
        blur: (value) => syncMarkdown(value),
        after: () => {
            editorReady.value = true
            if (editor.getValue() !== currentMarkdown) editor.setValue(currentMarkdown, true)
            syncMarkdown(editor.getValue(), true)
        },
    })
})

onBeforeUnmount(() => {
    editorReady.value = false
    editor?.destroy()
    editor = null
})
</script>

<template>
    <div class="vditor-editor-field">
        <AdminLoadingState
            v-if="!editorReady"
            class="vditor-editor__loading"
            label="文章编辑器加载中"
        />
        <div v-show="viewMode === 'edit'" class="vditor-editor__edit-shell" :class="{ 'is-loading': !editorReady }">
            <div ref="editorRoot" class="vditor-editor"></div>
        </div>
        <BlogMarkdownPreview v-show="viewMode === 'preview'" :markdown="previewMarkdown">
            <template #action>
                <div class="vditor-preview-return-zone">
                    <button
                        type="button"
                        class="vditor-preview-return-button"
                        title="返回编辑"
                        aria-label="返回编辑"
                        @click="setViewMode('edit')"
                    >
                        <MaterialIcon :path="mdiEyeOutline" />
                    </button>
                </div>
            </template>
        </BlogMarkdownPreview>
    </div>
</template>

<style scoped>
.vditor-editor-field {
    position: relative;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    min-height: 80vh;
}

.vditor-editor__loading {
    position: absolute;
    z-index: 2;
    inset: 0;
    min-height: 320px;
    background: var(--md-sys-color-surface-container-low, #f7f2fa);
}

.vditor-editor__edit-shell {
    width: 100%;
    min-width: 0;
    max-width: 100%;
}

.vditor-editor__edit-shell.is-loading {
    opacity: 0;
}

.vditor-editor {
    --border-color: #e5e1e7;
    --second-color: #77717d;
    --panel-background-color: #fff;
    --panel-shadow: 0 2px 8px rgba(29, 27, 32, 0.14);
    --toolbar-background-color: #fbf9fc;
    --toolbar-icon-color: #625d68;
    --toolbar-icon-hover-color: var(--md-sys-color-primary, #6750a4);
    --textarea-background-color: #fff;
    --textarea-text-color: #2f2b32;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    border: 0;
    border-radius: 0;
    color: var(--textarea-text-color);
    background: var(--textarea-background-color);
}

.vditor-editor :deep(.vditor-toolbar) {
    z-index: 20;
    border: 0;
    border-bottom: 1px solid rgba(73, 69, 79, 0.12);
    border-radius: 0;
    background: var(--toolbar-background-color);
    box-shadow: none;
}

/* Vditor positions the first block's actions slightly over the pinned toolbar. */
.vditor-editor :deep(.vditor-panel) {
    z-index: 21;
}

.vditor-editor :deep(.vditor-toolbar__item:has(> [data-type="edit-mode"])),
.vditor-editor :deep([data-type="both"]),
.vditor-editor :deep([data-type="preview"]),
.vditor-editor :deep(.vditor-preview__action) {
    display: none;
}

.vditor-editor :deep(.vditor-content),
.vditor-editor :deep(.vditor-reset) {
    min-width: 0;
    max-width: 100%;
    color: var(--textarea-text-color);
    background: var(--textarea-background-color);
}

.vditor-editor :deep(.vditor-reset) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

/* Tailwind preflight removes list markers, while Vditor only restores ul. */
.vditor-editor :deep(.vditor-reset ol) {
    list-style-type: decimal;
}

.vditor-editor :deep(.vditor-reset ol ol) {
    list-style-type: lower-alpha;
}

.vditor-editor :deep(.vditor-reset ol ol ol) {
    list-style-type: lower-roman;
}

.vditor-editor :deep(.vditor-wysiwyg),
.vditor-editor :deep(.vditor-ir),
.vditor-editor :deep(.vditor-sv),
.vditor-editor :deep(.vditor-preview) {
    min-width: 0;
    max-width: 100%;
}

.vditor-editor :deep(.vditor-reset pre:not(.vditor-reset)) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
}

.vditor-editor :deep(.vditor-reset pre > code) {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    box-sizing: border-box;
}

.vditor-editor :deep(.vditor-reset table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
}

.vditor-preview-return-zone {
    position: absolute;
    z-index: 2;
    top: 8px;
    right: 8px;
    display: grid;
    width: 36px;
    height: 36px;
    place-items: center;
}

.vditor-preview-return-button {
    display: grid;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 0;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    background: transparent;
    cursor: pointer;
    opacity: 0;
    place-items: center;
    transition: opacity 120ms ease, color 120ms ease;
}

.vditor-preview-return-button :deep(.material-icon) {
    width: 20px;
    height: 20px;
}

.vditor-preview-return-zone:hover .vditor-preview-return-button,
.vditor-preview-return-button:focus-visible {
    opacity: 1;
}

.vditor-preview-return-button:hover {
    color: var(--md-sys-color-on-surface, #1d1b20);
}

.vditor-preview-return-button:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--md-sys-color-primary, #6750a4) 30%, transparent);
    outline-offset: 2px;
}

@media (hover: none) {
    .vditor-preview-return-button {
        opacity: 1;
    }
}
</style>
