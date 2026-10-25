<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import cfg from '@/config/index.js'
import AdminButton from '@/components/admin/AdminButton.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminFileButton from '@/components/admin/AdminFileButton.vue'
import AdminSegmented from '@/components/admin/AdminSegmented.vue'
import MaterialTagField from '@/components/material/MaterialTagField.vue'
import MaterialTextField from '@/components/material/MaterialTextField.vue'
const baseApi = cfg.baseApi

const emit = defineEmits(['articleSubmit'])
const form = reactive({
    title: '',
    author: '',
    tags: [],
    coverImgUploaded: false
})
const coverUploadMode = ref('keep')
const errors = reactive({ title: '', author: '', tags: '' })
const coverUploadData = computed(() => ({
  convertToAvif: coverUploadMode.value === 'avif' ? 'true' : 'false'
}))
const uploadOptions = [
  { label: '保留原格式', value: 'keep' },
  { label: '转为 AVIF', value: 'avif' }
]

// 提交文章的全部信息
const handleSubmit = () => {
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
  body.append('convertToAvif', coverUploadData.value.convertToAvif)
  try {
    const response = await fetch(`${baseApi}/upload/image`, { method: 'POST', headers: uploadHeaders.value, body })
    if (!response.ok) throw new Error('upload failed')
    uploadSuccess(await response.json(), file)
  } catch (error) {
    uploadError(error)
  }
}
</script>

<template>
  <AdminCard title="文章信息" class="article-form-card">
    <form class="article-form" novalidate @submit.prevent="handleSubmit">
      <MaterialTextField
        v-model="form.title"
        label="文章标题"
        required
        :error-message="errors.title"
        @update:model-value="errors.title = ''"
      />
      <MaterialTextField
        v-model="form.author"
        label="作者"
        required
        :error-message="errors.author"
        @update:model-value="errors.author = ''"
      />
      <MaterialTagField
        v-model="form.tags"
        class="tags-field"
        label="文章标签"
        required
        :error-message="errors.tags"
        @update:model-value="errors.tags = ''"
      />
      <div class="cover-row">
        <div><div class="cover-label">文章封面</div><div class="cover-hint">限制一张 JPG、PNG 或 WebP 图片</div></div>
        <AdminSegmented v-model="coverUploadMode" :options="uploadOptions" label="封面上传格式" appearance="pill" />
        <AdminFileButton accept="image/*" label="上传封面" @select="uploadCover" />
        <v-chip v-if="form.coverImgUploaded" color="success" rounded="pill">已上传</v-chip>
      </div>
      <div class="article-form__actions">
        <AdminButton tone="primary" type="submit">提交文章</AdminButton>
      </div>
    </form>
  </AdminCard>
</template>

<style scoped>
.article-form-card { margin-bottom: 4px; }
.article-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.tags-field, .cover-row, .article-form__actions { grid-column: 1 / -1; }
.cover-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 0; border-radius: var(--admin-radius); background: var(--admin-surface-muted); }
.cover-row > :first-child { margin-right: auto; }
.cover-label { color: var(--admin-text); font-size: 14px; font-weight: 700; }
.cover-hint { margin-top: 3px; color: var(--admin-text-muted); font-size: 12px; }
.article-form__actions { display: flex; justify-content: flex-end; gap: 10px; }
@media (max-width: 800px) { .article-form { grid-template-columns: 1fr; } .cover-row { align-items: stretch; flex-direction: column; } }
</style>
