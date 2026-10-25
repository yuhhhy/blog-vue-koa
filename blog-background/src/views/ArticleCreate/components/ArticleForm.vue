<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { useArticleStore } from '@/stores/articleStore.js'
import { useRouter } from 'vue-router'
import { mdiImageOutline } from '@mdi/js'
import cfg from '@/config/index.js'
import AdminCard from '@/components/admin/AdminCard.vue'
import MaterialIcon from '@/components/MaterialIcon.vue'
import MaterialTagField from '@/components/material/MaterialTagField.vue'
import MaterialTextField from '@/components/material/MaterialTextField.vue'
const baseApi = cfg.baseApi

const props = defineProps({
  submitting: { type: Boolean, default: false }
})
const emit = defineEmits(['articleSubmit', 'draftChange'])
const articleStore = useArticleStore()
const coverInput = ref(null)
const savedForm = articleStore.createArticleForm || {}
const form = reactive({
    title: savedForm.title || '',
    author: savedForm.author || '',
    tags: Array.isArray(savedForm.tags) ? [...savedForm.tags] : [],
    coverImg: savedForm.coverImg || '',
    coverImgUploaded: Boolean(savedForm.coverImg)
})
const errors = reactive({ title: '', author: '', tags: '' })

watch(form, (formValue) => {
  const draftForm = {
    title: formValue.title,
    author: formValue.author,
    tags: [...formValue.tags],
    coverImg: formValue.coverImg || '',
    coverImgUploaded: Boolean(formValue.coverImg),
  }
  articleStore.setCreateArticleForm(draftForm)
  emit('draftChange', draftForm)
}, { deep: true })

const loadForm = (draft = {}) => {
  form.title = draft.title || ''
  form.author = draft.author || ''
  form.tags = Array.isArray(draft.tags) ? [...draft.tags] : []
  form.coverImg = draft.coverImage || draft.coverImg || ''
  form.coverImgUploaded = Boolean(form.coverImg)
}

const resetForm = () => {
  form.title = ''
  form.author = ''
  form.tags = []
  form.coverImg = ''
  form.coverImgUploaded = false
  errors.title = ''
  errors.author = ''
  errors.tags = ''
}

defineExpose({ loadForm, resetForm })

// 提交文章的全部信息
const handleSubmit = () => {
  if (props.submitting) return
  errors.title = form.title.trim() ? '' : '请添加文章标题'
  errors.author = form.author.trim() ? '' : '请输入作者名称'
  errors.tags = form.tags.length ? '' : '请添加至少一个标签'
  if (Object.values(errors).some(Boolean)) return
  if (!form.coverImgUploaded) {
    ElMessage.error('请上传封面图片')
    return
  }
  emit('articleSubmit', { ...form })
}

const userStore = useUserStore()
const router = useRouter()
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.userData?.token}`,
  'require-auth': 'true'
}))
const coverPreviewUrl = computed(() => form.coverImg || '')

// 图片上传前验证是否登录
const beforeUpload = () => {
  if (!userStore.isAuthenticated) {
    ElMessage.warning("请先登录")
    router.push('/login')
    return false
  }

  if (userStore.userData.role !== 'admin') {
    ElMessage.warning("请先获得管理员权限")
    return false
  }

  return true
}

// 图片文件上传成功，返回文件数据
const uploadSuccess = (file) => {
  form.coverImg = '/images/' + file.filename
  form.coverImgUploaded = true
  ElMessage.success("封面上传成功")
}

// 图片文件上传失败
const uploadError = (file) => {
  ElMessage.error("封面上传失败")
}

const uploadCover = async ([file]) => {
  if (!file || beforeUpload() === false) return
  const body = new FormData()
  body.append('file', file)
  body.append('convertToAvif', 'true')
  try {
    const response = await fetch(`${baseApi}/upload/image`, { method: 'POST', headers: uploadHeaders.value, body })
    if (!response.ok) throw new Error('upload failed')
    uploadSuccess(await response.json(), file)
  } catch (error) {
    uploadError(error)
  }
}

const handleCoverChange = (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length) uploadCover(files)
  event.target.value = ''
}
</script>

<template>
  <AdminCard title="文章信息" class="article-form-card">
    <form id="article-info-form" class="article-form" novalidate @submit.prevent="handleSubmit">
      <div class="cover-field">
        <input
          ref="coverInput"
          class="cover-input"
          type="file"
          accept="image/*"
          aria-label="上传文章封面"
          @change="handleCoverChange"
        >
        <button class="cover-preview" type="button" aria-label="上传文章封面" @click="coverInput?.click()">
          <img v-if="coverPreviewUrl" :src="coverPreviewUrl" alt="文章封面预览">
          <div v-else class="cover-preview__empty">
            <MaterialIcon :path="mdiImageOutline" />
            <span>点击上传封面</span>
          </div>
        </button>
      </div>
      <div class="article-fields">
        <MaterialTextField
          v-model="form.title"
          label="文章标题"
          required
          :error-message="errors.title"
          @update:model-value="errors.title = ''"
        />
        <MaterialTagField
          v-model="form.tags"
          class="tags-field"
          label="文章标签"
          required
          :error-message="errors.tags"
          @update:model-value="errors.tags = ''"
        />
        <MaterialTextField
          v-model="form.author"
          label="作者"
          required
          :error-message="errors.author"
          @update:model-value="errors.author = ''"
        />
      </div>
    </form>
  </AdminCard>
</template>

<style scoped>
.article-form-card { margin-bottom: 4px; }
.article-form { display: grid; grid-template-columns: minmax(280px, 420px) minmax(0, 1fr); align-items: stretch; gap: 24px; }
.cover-field { min-width: 0; }
.cover-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
.cover-preview { display: grid; width: 100%; height: 100%; min-height: 224px; padding: 0; overflow: hidden; border: 0; aspect-ratio: 16 / 9; place-items: center; border-radius: var(--admin-radius); color: var(--admin-text-muted); background: var(--admin-surface-muted); cursor: pointer; }
.cover-preview img { width: 100%; height: 100%; object-fit: cover; }
.cover-preview__empty { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--admin-text-muted); font-size: 13px; }
.cover-preview__empty :deep(.material-icon) { width: 28px; height: 28px; }
.cover-preview:hover { background: var(--admin-surface-high); }
.cover-preview:focus-visible { outline: 3px solid color-mix(in srgb, var(--md-sys-color-primary) 32%, transparent); outline-offset: 2px; }
.article-fields { display: grid; min-width: 0; align-content: center; gap: 16px; }
@media (max-width: 800px) {
  .article-form { grid-template-columns: 1fr; gap: 16px; }
  .cover-preview { min-height: 0; }
}
</style>
