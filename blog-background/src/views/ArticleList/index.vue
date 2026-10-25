<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { apiGetBlogList, apiDeleteBlog, apiUpdateBlog } from '@/api/blog.js'
import { apiGetBlogContentList, apiDeleteBlogContent, apiUpdateBlogContent } from '@/api/blogContent.js'
import { apiUpdateWebsiteLastUpdate, apiUpdateWebsiteTotalWordCount } from '@/api/websiteData.js'
import { ElMessage } from 'element-plus'
import MaterialIcon from '@/components/MaterialIcon.vue'
import { mdiDownload, mdiFileDocumentOutline } from '@mdi/js'
import { getFormatDate } from '@/utils/date.js'
import countWord from '@/utils/wordCount.js'
import MilkdownEditor from '@/views/ArticleCreate/components/MilkdownEditor.vue'
import AdminActionMenu from '@/components/admin/AdminActionMenu.vue'
import AdminButton from '@/components/admin/AdminButton.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import AdminDialog from '@/components/admin/AdminDialog.vue'
import AdminList from '@/components/admin/AdminList.vue'
import AdminListItem from '@/components/admin/AdminListItem.vue'
import AdminListLabel from '@/components/admin/AdminListLabel.vue'
import AdminListSort from '@/components/admin/AdminListSort.vue'
import AdminPage from '@/components/admin/AdminPage.vue'
import MaterialTagField from '@/components/material/MaterialTagField.vue'
import MaterialTextField from '@/components/material/MaterialTextField.vue'

const tableData = ref([])
const dialogFormVisible = ref(false)
const deleteDialogVisible = ref(false)
const pendingDelete = ref(null)
const deleting = ref(false)
const exporting = ref(false)
const sortBy = ref('created-desc')
const sortOptions = [
  { label: '最近创建', value: 'created-desc' },
  { label: '最早创建', value: 'created-asc' },
  { label: '标题 A–Z', value: 'title-asc' },
  { label: '字数从多到少', value: 'words-desc' },
  { label: '浏览量从高到低', value: 'views-desc' }
]
const rowActions = [
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除', danger: true }
]
const formErrors = reactive({ author: '', title: '', coverImage: '', tags: '' })
const form = reactive({
  id: '',
  author: '',
  title: '',
  coverImage: '',
  tags: [],
  content: ''
})

const normalizeCoverFilename = (value = '') => {
  const trimmedValue = value.trim()

  if (!trimmedValue) return ''

  try {
    const url = new URL(trimmedValue)
    return decodeURIComponent(url.pathname.replace(/^\/images\//, ''))
  } catch (error) {
    return trimmedValue.replace(/^\/?images\//, '')
  }
}

const buildCoverImageUrl = (filename) => {
  const normalizedFilename = normalizeCoverFilename(filename)
  return normalizedFilename ? `/images/${normalizedFilename}` : ''
}

const coverPreviewUrl = computed(() => buildCoverImageUrl(form.coverImage))
const getArticleTime = (article) => {
  const value = new Date(article.createTime).getTime()
  return Number.isFinite(value) ? value : 0
}
const sortedArticles = computed(() => {
  const articles = [...tableData.value]
  if (sortBy.value === 'created-asc') return articles.sort((a, b) => getArticleTime(a) - getArticleTime(b))
  if (sortBy.value === 'title-asc') return articles.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
  if (sortBy.value === 'words-desc') return articles.sort((a, b) => (b.wordCount || 0) - (a.wordCount || 0))
  if (sortBy.value === 'views-desc') return articles.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
  return articles.sort((a, b) => getArticleTime(b) - getArticleTime(a))
})

onMounted(() => {
  getBlogs()
})

function blurHandler(content) {
  form.content = content
}

// 获取数据
async function getBlogs() {
  const res = await apiGetBlogList()
  const resContent = await apiGetBlogContentList()
  for (let i = 0; i < res.length; i++){
    res[i].createTime = getFormatDate(res[i].createTime)
    resContent[i].createTime = getFormatDate(resContent[i].createTime)
  }
  tableData.value = res.map((item, index) => {
    return { ...item, ...resContent[index] }
  })
}

const formatExportDate = (value) => {
  if (!value) return ''

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

const escapeYamlValue = (value = '') => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/\r?\n/g, ' ')

const createArticleMarkdown = (article) => {
  const tags = Array.isArray(article.tags) ? article.tags : []
  const frontMatter = [
    '---',
    `title: "${escapeYamlValue(article.title)}"`,
    `author: "${escapeYamlValue(article.author)}"`,
    `date: "${formatExportDate(article.createTime)}"`,
    `updated: "${formatExportDate(article.updateTime)}"`,
    `cover: "${escapeYamlValue(article.coverImage)}"`,
    `tags: [${tags.map((tag) => `"${escapeYamlValue(tag)}"`).join(', ')}]`,
    '---'
  ]

  return `${frontMatter.join('\n')}\n\n${article.content || ''}`.trimEnd()
}

const handleExportAll = async () => {
  if (!tableData.value?.length) {
    ElMessage.warning('暂无文章可导出')
    return
  }

  exporting.value = true
  try {
    const markdown = tableData.value.map(createArticleMarkdown).join('\n\n<!-- article-separator -->\n\n')
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `articles-${date}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success(`已导出 ${tableData.value.length} 篇文章`)
  } catch (error) {
    ElMessage.error('导出文章失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 处理删除
function handleDelete(row) {
  pendingDelete.value = row
  deleteDialogVisible.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value || deleting.value) return
  deleting.value = true
  try {
    await apiDeleteBlog(pendingDelete.value.id)
    await apiDeleteBlogContent(pendingDelete.value.id)
    const index = tableData.value.findIndex(item => item.id === pendingDelete.value.id)
    if (index >= 0) tableData.value.splice(index, 1)
    await Promise.all([apiUpdateWebsiteLastUpdate(), apiUpdateWebsiteTotalWordCount()])
    deleteDialogVisible.value = false
    pendingDelete.value = null
    ElMessage.success('文章已删除')
  } finally {
    deleting.value = false
  }
}

// 编辑文章信息前填入默认表单
function handleEdit(row) {
  Object.keys(formErrors).forEach(key => { formErrors[key] = '' })
  dialogFormVisible.value = true
  form.id = row.id
  form.author = row.author
  form.title = row.title
  form.coverImage = normalizeCoverFilename(row.coverImage)
  form.tags = row.tags
  form.content = row.content
}

const handleRowAction = (action, row) => {
  if (action === 'edit') handleEdit(row)
  if (action === 'delete') handleDelete(row)
}

// 处理更改
async function handleConfirm() {
  formErrors.author = form.author.trim() ? '' : '请输入作者'
  formErrors.title = form.title.trim() ? '' : '请输入标题'
  formErrors.coverImage = form.coverImage.trim() ? '' : '请输入封面路径'
  formErrors.tags = form.tags.length ? '' : '请添加至少一个标签'
  if (Object.values(formErrors).some(Boolean)) return
  if (!form.content) {
    ElMessage.warning('文章内容不能为空')
    return
  }

  try {
    // 发送更改
    await UpdateBlog(form.id)

    // 更新表格数据
    await getBlogs()

    // 更新网站数据
    await Promise.all([
      apiUpdateWebsiteLastUpdate(), // 更新网站更新时间
      apiUpdateWebsiteTotalWordCount() // 更新网站总字数
    ])

    // 关闭对话框
    dialogFormVisible.value = false
  } catch (error) {
    
  }
}

// 更改函数
async function UpdateBlog(id) {
  const updateTime = new Date()
  const coverImage = buildCoverImageUrl(form.coverImage)

  await apiUpdateBlog({
    id,
    author: form.author,
    title: form.title,
    coverImage,
    tags: form.tags,
    updateTime
  })

  await apiUpdateBlogContent({
    id,
    author: form.author,
    title: form.title,
    coverImage,
    tags: form.tags,
    content: form.content,
    wordCount: countWord(form.content),
    updateTime
  })

  ElMessage.success('文章修改成功')
}
</script>

<template>
  <AdminPage>
    <AdminCard title="文章列表">
      <template #actions>
        <AdminButton tone="primary" :icon="mdiDownload" :disabled="exporting" @click="handleExportAll">
          {{ exporting ? '正在导出' : '导出全部 Markdown' }}
        </AdminButton>
      </template>
      <div class="list-toolbar">
        <span>{{ sortedArticles.length }} 篇文章</span>
        <AdminListSort v-model="sortBy" :options="sortOptions" />
      </div>
      <AdminList :items="sortedArticles" item-key="id" empty-text="暂无文章">
        <template #item="{ item }">
          <AdminListItem class="article-list-item" :headline="item.title" :supporting-text="`${item.author || '未知作者'} · ${item.createTime || '未知日期'}`">
            <template #leading>
              <el-image v-if="buildCoverImageUrl(item.coverImage)" class="article-cover" :src="buildCoverImageUrl(item.coverImage)" :preview-src-list="[buildCoverImageUrl(item.coverImage)]" preview-teleported fit="cover">
                <template #error><MaterialIcon class="article-cover-placeholder" :path="mdiFileDocumentOutline" /></template>
              </el-image>
              <MaterialIcon v-else class="article-cover-placeholder" :path="mdiFileDocumentOutline" />
            </template>
            <template #overline>
              <AdminListLabel v-for="tag in item.tags || []" :key="tag">{{ tag }}</AdminListLabel>
            </template>
            <template #trailing>
              <span>{{ item.wordCount || 0 }} 字<br>{{ item.viewCount || 0 }} 次浏览 · {{ item.likeCount || 0 }} 赞</span>
            </template>
            <template #actions><AdminActionMenu :actions="rowActions" @select="handleRowAction($event, item)" /></template>
          </AdminListItem>
        </template>
      </AdminList>
    </AdminCard>
  </AdminPage>

  <!-- 更改表单 -->
  <AdminDialog v-model="dialogFormVisible" title="编辑文章" description="修改文章基本信息和正文内容" max-width="800">
    <div class="article-edit-form">
      <MaterialTextField v-model="form.author" label="作者" required :error-message="formErrors.author" @update:model-value="formErrors.author = ''" />
      <MaterialTextField v-model="form.title" label="标题" required :error-message="formErrors.title" @update:model-value="formErrors.title = ''" />
      <div class="cover-edit">
          <MaterialTextField
            v-model="form.coverImage"
            label="封面路径"
            prefix="/images/"
            placeholder="dev-covers/vite.jpg"
            required
            :error-message="formErrors.coverImage"
            @update:model-value="formErrors.coverImage = ''"
          />
          <div class="cover-preview">
            <el-image
              v-if="coverPreviewUrl"
              class="cover-preview-image"
              :src="coverPreviewUrl"
              :preview-src-list="[coverPreviewUrl]"
              fit="cover"
              preview-teleported
            >
              <template #error>
                <div class="cover-preview-placeholder">封面加载失败</div>
              </template>
            </el-image>
            <div v-else class="cover-preview-placeholder">暂无封面</div>
          </div>
      </div>
      <MaterialTagField v-model="form.tags" label="标签" required :error-message="formErrors.tags" @update:model-value="formErrors.tags = ''" />
    </div>
    <!-- 文本编辑器 -->
    <MilkdownEditor :content="form.content" @vblur="blurHandler" />

    <template #actions>
      <AdminButton variant="text" @click="dialogFormVisible = false">取消</AdminButton>
      <AdminButton tone="primary" @click="handleConfirm">保存更改</AdminButton>
    </template>
  </AdminDialog>

  <AdminConfirmDialog
    v-model="deleteDialogVisible"
    title="删除文章"
    :message="`确定删除“${pendingDelete?.title || ''}”吗？文章正文也会一并删除，此操作无法撤销。`"
    confirm-text="删除"
    danger
    :loading="deleting"
    @confirm="confirmDelete"
  />
</template>

<style scoped>
.list-toolbar { display: flex; min-height: 48px; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
.article-list-item { min-height: 104px; }
.article-list-item :deep(.admin-list-item__leading), .article-cover { width: 80px; height: 80px; }
.article-list-item :deep(.admin-list-item__leading) { border-radius: 8px; }
.article-cover { cursor: zoom-in; }
.article-cover :deep(.el-image__error) { color: var(--md-sys-color-on-secondary-container); background: transparent; }
.article-cover-placeholder { width: 30px; height: 30px; }

.cover-edit {
  width: 100%;
}

.article-edit-form {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.cover-preview {
  width: 240px;
  height: 128px;
  margin-top: 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
  background: var(--el-fill-color-lighter);
}

.cover-preview-image {
  width: 100%;
  height: 100%;
}

.cover-preview-placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

@media (max-width: 760px) {
  .list-toolbar { align-items: flex-start; flex-direction: column; }
  .article-list-item { min-height: 96px; }
  .article-list-item :deep(.admin-list-item__leading), .article-cover { width: 72px; height: 72px; }
  .cover-preview { width: 100%; max-width: 240px; }
}
</style>
