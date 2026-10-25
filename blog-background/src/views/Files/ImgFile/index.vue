<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { mdiMagnify } from '@mdi/js';
import { apiDeleteImage, apiGenerateImageVariants, apiGetImageList, apiReuploadImage } from '@/api/files.js';
import cfg from '@/config/index.js';
import { useUserStore } from '@/stores/userStore';
import AdminActionMenu from '@/components/admin/AdminActionMenu.vue';
import AdminCard from '@/components/admin/AdminCard.vue';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue';
import AdminFileButton from '@/components/admin/AdminFileButton.vue';
import AdminList from '@/components/admin/AdminList.vue';
import AdminListItem from '@/components/admin/AdminListItem.vue';
import AdminListLabel from '@/components/admin/AdminListLabel.vue';
import AdminListSort from '@/components/admin/AdminListSort.vue';
import AdminPage from '@/components/admin/AdminPage.vue';
import MaterialTextField from '@/components/material/MaterialTextField.vue';

const baseApi = cfg.baseApi;
const userStore = useUserStore();

const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${userStore.userData?.token}`,
    'require-auth': 'true'
}));

const imageList = ref([]);
const loading = ref(false);
const deleteDialogVisible = ref(false);
const pendingDelete = ref(null);
const deleting = ref(false);
const searchQuery = ref('');
const generatingImages = ref(new Set());
const reuploadingImages = ref(new Set());
const sortBy = ref('upload-desc');
const sortOptions = [
    { label: '最近上传', value: 'upload-desc' },
    { label: '最早上传', value: 'upload-asc' },
    { label: '文件名 A–Z', value: 'name-asc' },
    { label: '文件名 Z–A', value: 'name-desc' },
    { label: '文件从大到小', value: 'size-desc' },
    { label: '文件从小到大', value: 'size-asc' },
];
const rowActions = [
    { key: 'download', label: '下载' },
    { key: 'generate', label: '生成缩略图' },
    { key: 'reupload', label: '重传' },
    { key: 'delete', label: '删除', danger: true },
];

const setLoadingName = (state, name, loading) => {
    const nextState = new Set(state.value);
    if (loading) {
        nextState.add(name);
    } else {
        nextState.delete(name);
    }
    state.value = nextState;
};

const filteredImages = computed(() => {
    if (!searchQuery.value) {
        return imageList.value;
    }
    return imageList.value.filter(img =>
        img.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const getImageTime = (image) => {
    const time = Number(image.uploadTime ?? new Date(image.uploadDate).getTime());
    return Number.isFinite(time) ? time : 0;
};

const sortedImages = computed(() => {
    const images = [...filteredImages.value];

    if (sortBy.value === 'name-asc') return images.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy.value === 'name-desc') return images.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy.value === 'size-asc') return images.sort((a, b) => (a.size ?? 0) - (b.size ?? 0));
    if (sortBy.value === 'size-desc') return images.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
    if (sortBy.value === 'upload-asc') return images.sort((a, b) => getImageTime(a) - getImageTime(b));
    return images.sort((a, b) => getImageTime(b) - getImageTime(a));
});

const previewImageUrls = computed(() => sortedImages.value.map(image => image.url));

const getPreviewIndex = (image) => sortedImages.value.findIndex(item => item.name === image.name);

// 从后端获取图片列表
const fetchImageList = async () => {
    loading.value = true;
    try {
        const res = await apiGetImageList();
        imageList.value = res.data;
    } catch (error) {
        ElMessage.error('请求失败，请检查网络');
    } finally {
        loading.value = false;
    }
};

// 文件上传成功后的回调
const handleUploadSuccess = (response, file) => {
    ElMessage.success(`图片 "${file.name}" 上传成功`);
    fetchImageList(); // 上传成功后刷新列表
};

// 文件上传失败的回调
const handleUploadError = (error) => {
    ElMessage.error('图片上传失败，请检查文件大小或网络，或提升权限');
};

const uploadImages = async (files) => {
    for (const file of files) {
        const body = new FormData();
        body.append('file', file);
        body.append('convertToAvif', 'true');
        try {
            const response = await fetch(`${baseApi}/upload/image`, { method: 'POST', headers: uploadHeaders.value, body });
            if (!response.ok) throw new Error('upload failed');
            handleUploadSuccess(null, file);
        } catch (error) {
            handleUploadError(error);
        }
    }
};

const handleGenerateVariants = async (row) => {
    setLoadingName(generatingImages, row.name, true);

    try {
        await apiGenerateImageVariants(row.name);
        await fetchImageList();
        ElMessage.success(`"${row.name}" 缩略图已生成`);
    } catch (error) {
        ElMessage.error('缩略图生成失败');
    } finally {
        setLoadingName(generatingImages, row.name, false);
    }
};

const handleReupload = async (row, options) => {
    const formData = new FormData();
    formData.append('file', options.file);
    setLoadingName(reuploadingImages, row.name, true);

    try {
        await apiReuploadImage(row.name, formData);
        await fetchImageList();
        options.onSuccess?.();
        ElMessage.success(`"${row.name}" 重传成功`);
    } catch (error) {
        options.onError?.(error);
        ElMessage.error('图片重传失败，请确认文件扩展名和原图片一致');
    } finally {
        setLoadingName(reuploadingImages, row.name, false);
    }
};

const chooseReupload = (row) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
        const file = input.files?.[0];
        if (file) handleReupload(row, { file });
    };
    input.click();
};

const handleRowAction = (action, row) => {
    if (action === 'download') handleDownload(row);
    if (action === 'generate') handleGenerateVariants(row);
    if (action === 'reupload') chooseReupload(row);
    if (action === 'delete') handleDelete(row);
};

// 删除图片
const handleDelete = (row) => {
    pendingDelete.value = row;
    deleteDialogVisible.value = true;
};

const confirmDelete = async () => {
    if (!pendingDelete.value || deleting.value) return;
    deleting.value = true;
    try {
        await apiDeleteImage(pendingDelete.value.name);
        await fetchImageList();
        deleteDialogVisible.value = false;
        pendingDelete.value = null;
        ElMessage.success('图片删除成功');
    } finally {
        deleting.value = false;
    }
};

// 下载图片
const handleDownload = (row) => {
    // 使用后端提供的 URL 进行下载
    const link = document.createElement('a');
    link.href = `${row.url}`;
    link.download = row.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const formatSize = (size) => {
    if (!size || size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const getFileType = (filename) => {
    const extension = filename?.split('.').pop();
    return extension ? extension.toUpperCase() : '图片';
};

const getVariantTip = (row) => {
    if (!row.variantWidths?.length) return '暂无缩略图信息';

    return row.variantWidths
        .map(width => `${width}w：${row.variants?.[width] ? '已生成' : '缺少'}`)
        .join(' / ');
};

onMounted(() => {
    fetchImageList();
});

</script>

<template>
    <AdminPage>
        <AdminCard title="图片列表">
            <div class="list-toolbar">
                <MaterialTextField v-model="searchQuery" type="search" label="搜索图片名称" :leading-icon="mdiMagnify" class="table-search" />
                <div class="list-toolbar__actions">
                    <AdminFileButton accept="image/*" multiple label="上传图片" @select="uploadImages" />
                    <AdminListSort v-model="sortBy" :options="sortOptions" />
                </div>
            </div>
            <div class="list-count">{{ filteredImages.length }} 张图片</div>
            <AdminList :items="sortedImages" item-key="name" :loading="loading" item-label="张图片" empty-text="暂无图片，或无法连接到服务器">
                <template #item="{ item }">
                    <AdminListItem class="image-list-item" :headline="item.name" :supporting-text="`${formatSize(item.size)} · ${formatDate(item.uploadDate)}`">
                        <template #leading>
                            <el-image
                                class="image-thumbnail"
                                :src="item.url"
                                :preview-src-list="previewImageUrls"
                                :initial-index="getPreviewIndex(item)"
                                preview-teleported
                                fit="cover"
                                lazy
                            />
                        </template>
                        <template #overline>
                            <AdminListLabel>{{ getFileType(item.name) }}</AdminListLabel>
                            <v-tooltip :text="getVariantTip(item)">
                                <template #activator="{ props }">
                                    <span v-bind="props">
                                        <AdminListLabel :tone="item.hasAllVariants ? 'success' : 'warning'">
                                            {{ item.hasAllVariants ? '缩略图完整' : '缺少缩略图' }}
                                        </AdminListLabel>
                                    </span>
                                </template>
                            </v-tooltip>
                        </template>
                        <template #actions><AdminActionMenu :actions="rowActions" @select="handleRowAction($event, item)" /></template>
                    </AdminListItem>
                </template>
            </AdminList>
        </AdminCard>
    </AdminPage>
    <AdminConfirmDialog
        v-model="deleteDialogVisible"
        title="删除图片"
        :message="`确定删除“${pendingDelete?.name || ''}”吗？相关缩略图也会一并删除，此操作无法撤销。`"
        confirm-text="删除"
        danger
        :loading="deleting"
        @confirm="confirmDelete"
    />
</template>

<style scoped>
.list-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
.list-toolbar__actions { display: flex; align-items: center; gap: 8px; }
.table-search { max-width: 360px; }
.table-search :deep(.material-field__control), .table-search :deep(.material-field__body) { min-height: 48px; }
.table-search :deep(.material-field__input) { height: 48px; padding-top: 6px; font-size: 15px; }
.list-count { margin: 0 0 12px 4px; color: var(--md-sys-color-on-surface-variant); font-size: 13px; }
.image-list-item { min-height: 104px; }
.image-list-item :deep(.admin-list-item__leading), .image-thumbnail { width: 80px; height: 80px; }
.image-list-item :deep(.admin-list-item__leading) { border-radius: 8px; }
.image-thumbnail { cursor: zoom-in; }
@media (max-width: 760px) {
    .list-toolbar { align-items: flex-start; flex-direction: column; }
    .list-toolbar .table-search { width: 100%; }
    .list-toolbar__actions { width: 100%; flex-wrap: wrap; }
    .image-list-item { min-height: 96px; }
    .image-list-item :deep(.admin-list-item__leading), .image-thumbnail { width: 72px; height: 72px; }
}
</style>
