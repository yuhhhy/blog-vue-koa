<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AdminButton from '@/components/admin/AdminButton.vue'

const content = defineModel({ type: String, default: '' })
const open = defineModel('open', { type: Boolean, default: false })
const props = defineProps({
    saveState: { type: String, default: '' },
    selection: { type: Array, default: () => [0, 0] },
})
defineEmits(['input'])
const editor = ref(null)
const viewportStyle = ref({ height: '100dvh', marginTop: '0px' })
const saveStatus = computed(
    () =>
        ({
            saving: '正在保存到云端…',
            pending: '等待保存…',
            saved: '已保存到云端',
            error: '云端保存失败，请返回后重试保存',
        })[props.saveState] || '修改会自动保存到草稿',
)

const updateViewport = () => {
    const viewport = window.visualViewport
    viewportStyle.value = {
        height: `${viewport?.height || window.innerHeight}px`,
        marginTop: `${viewport?.offsetTop || 0}px`,
    }
}

const stopViewportTracking = () => {
    window.removeEventListener('resize', updateViewport)
    window.visualViewport?.removeEventListener('resize', updateViewport)
    window.visualViewport?.removeEventListener('scroll', updateViewport)
}

watch(open, (visible) => {
    stopViewportTracking()
    if (!visible) return
    updateViewport()
    window.addEventListener('resize', updateViewport)
    window.visualViewport?.addEventListener('resize', updateViewport)
    window.visualViewport?.addEventListener('scroll', updateViewport)
})

const focusEditor = () => {
    editor.value?.focus({ preventScroll: true })
    editor.value?.setSelectionRange(...props.selection)
}

onBeforeUnmount(stopViewportTracking)
</script>

<template>
    <el-dialog
        v-model="open"
        class="essay-fullscreen-editor"
        :style="viewportStyle"
        title="编辑随笔正文"
        fullscreen
        append-to-body
        destroy-on-close
        :show-close="false"
        :close-on-click-modal="false"
        @open-auto-focus="focusEditor"
    >
        <template #header="{ titleId }">
            <div class="essay-fullscreen-editor__toolbar">
                <h2 :id="titleId">编辑正文</h2>
                <AdminButton tone="primary" @click="open = false"
                    >完成</AdminButton
                >
            </div>
        </template>
        <textarea
            ref="editor"
            v-model="content"
            class="essay-fullscreen-editor__input"
            aria-label="随笔正文"
            placeholder="写下今天想记录的内容…"
            @input="$emit('input')"
        />
        <template #footer>
            <p class="essay-fullscreen-editor__status" role="status">
                {{ saveStatus }}
            </p>
        </template>
    </el-dialog>
</template>

<style scoped>
:global(.essay-fullscreen-editor.el-dialog) {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    border: 0;
    border-radius: 0 !important;
    background: var(--md-sys-color-surface);
}
:global(.essay-fullscreen-editor .el-dialog__header) {
    flex: 0 0 auto;
    margin: 0;
    padding: max(12px, env(safe-area-inset-top))
        max(16px, env(safe-area-inset-right)) 12px
        max(16px, env(safe-area-inset-left));
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
}
:global(.essay-fullscreen-editor .el-dialog__body) {
    display: flex;
    flex: 1 1 0;
    min-height: 0;
    padding: 0;
    overflow: hidden;
}
:global(.essay-fullscreen-editor .el-dialog__footer) {
    flex: 0 0 auto;
    padding: 8px 16px max(8px, env(safe-area-inset-bottom));
    border-top: 1px solid var(--md-sys-color-outline-variant);
    text-align: left;
}
.essay-fullscreen-editor__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}
.essay-fullscreen-editor__toolbar h2 {
    margin: 0;
    color: var(--md-sys-color-on-surface);
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
}
.essay-fullscreen-editor__input {
    display: block;
    flex: 1;
    width: 100%;
    min-height: 0;
    padding: 16px max(16px, env(safe-area-inset-right)) 16px
        max(16px, env(safe-area-inset-left));
    overflow-y: auto;
    border: 0;
    outline: none;
    border-radius: 0;
    color: var(--md-sys-color-on-surface);
    background: transparent;
    font: inherit;
    font-size: 16px;
    line-height: 1.8;
    resize: none;
    overscroll-behavior: contain;
}
.essay-fullscreen-editor__input::placeholder {
    color: var(--md-sys-color-on-surface-variant);
}
.essay-fullscreen-editor__status {
    margin: 0;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 12px;
    line-height: 18px;
}
</style>
