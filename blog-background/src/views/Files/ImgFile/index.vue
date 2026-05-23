<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { apiDeleteImage, apiGenerateImageVariants, apiGetImageList, apiReuploadImage } from '@/api/files.js';
import cfg from '@/config/index.js';
import { useUserStore } from '@/stores/userStore';

const baseApi = cfg.baseApi;
const userStore = useUserStore();

const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${userStore.userData?.token}`,
    'require-auth': 'true'
}));

const imageList = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(8);
const uploadMode = ref('keep');
const generatingImages = ref(new Set());
const reuploadingImages = ref(new Set());
const sortState = ref({
    prop: 'uploadTime',
    order: 'descending',
});

const uploadData = computed(() => ({
    convertToAvif: uploadMode.value === 'avif' ? 'true' : 'false'
}));

const isGenerating = (name) => generatingImages.value.has(name);
const isReuploading = (name) => reuploadingImages.value.has(name);

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
    const { prop, order } = sortState.value;

    if (!prop || !order) return images;

    const direction = order === 'ascending' ? 1 : -1;

    return images.sort((a, b) => {
        if (prop === 'name') {
            return a.name.localeCompare(b.name) * direction;
        }

        if (prop === 'size') {
            return ((a.size ?? 0) - (b.size ?? 0)) * direction;
        }

        return (getImageTime(a) - getImageTime(b)) * direction;
    });
});

const pagedImages = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return sortedImages.value.slice(start, start + pageSize.value);
});

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

// 删除图片
const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要删除图片 "${row.name}" 吗？`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        await apiDeleteImage(row.name);
        fetchImageList();
        ElMessage.success('图片删除成功');
    }).catch(() => {});
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

const handleSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1;
};

const handleCurrentChange = (page) => {
    currentPage.value = page;
};

const handleSortChange = ({ prop, order }) => {
    sortState.value = {
        prop,
        order,
    };
    currentPage.value = 1;
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

const getVariantTip = (row) => {
    if (!row.variantWidths?.length) return '暂无缩略图信息';

    return row.variantWidths
        .map(width => `${width}w：${row.variants?.[width] ? '已生成' : '缺少'}`)
        .join(' / ');
};

onMounted(() => {
    fetchImageList();
});

watch([searchQuery, filteredImages], () => {
    const maxPage = Math.max(1, Math.ceil(filteredImages.value.length / pageSize.value));
    if (currentPage.value > maxPage) {
        currentPage.value = 1;
    }
});

</script>

<template>
    <el-card>
        <template #header>
            <div class="flex justify-between items-center">
                <span>图片管理</span>
                <div class="flex items-center gap-3">
                    <el-radio-group v-model="uploadMode" size="small">
                        <el-radio-button label="keep">保留原格式</el-radio-button>
                        <el-radio-button label="avif">转为 AVIF</el-radio-button>
                    </el-radio-group>
                    <el-upload
                        :action="`${baseApi}/upload/image`"
                        :headers="uploadHeaders"
                        :data="uploadData"
                        :show-file-list="false"
                        :on-success="handleUploadSuccess"
                        :on-error="handleUploadError"
                        name="file"
                        accept="image/*"
                    >
                        <el-button type="primary">上传图片</el-button>
                    </el-upload>
                </div>
            </div>
        </template>

        <el-input
            v-model="searchQuery"
            placeholder="搜索图片名称"
            clearable
            class="mb-4"
        />

        <el-table
            :data="pagedImages"
            v-loading="loading"
            stripe
            empty-text="暂无图片，或无法连接到服务器"
            :default-sort="{ prop: 'uploadTime', order: 'descending' }"
            @sort-change="handleSortChange"
        >
            <el-table-column label="预览" width="120">
                <template #default="{ row }">
                    <el-image
                        style="width: 80px; height: 80px; border-radius: 4px;"
                        :src="`${row.url}`"
                        :preview-src-list="filteredImages.map(img => `${img.url}`)"
                        :initial-index="filteredImages.findIndex(img => img.name === row.name)"
                        preview-teleported
                        fit="cover"
                        lazy
                    />
                </template>
            </el-table-column>
            <el-table-column prop="name" label="文件名" sortable="custom">
                <template #default="{ row }">
                    <span>{{ row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" width="120" sortable="custom">
                <template #default="{ row }">
                    {{ formatSize(row.size) }}
                </template>
            </el-table-column>
            <el-table-column label="缩略图" width="150">
                <template #default="{ row }">
                    <el-tooltip :content="getVariantTip(row)" placement="top">
                        <el-tag :type="row.hasAllVariants ? 'success' : 'warning'" effect="plain">
                            {{ row.hasAllVariants ? '完整' : '缺少' }}
                        </el-tag>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="180" sortable="custom">
                <template #default="{ row }">
                    {{ formatDate(row.uploadDate) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="360" fixed="right">
                <template #default="{ row }">
                    <el-button size="small" @click="handleDownload(row)">下载</el-button>
                    <el-button
                        size="small"
                        type="success"
                        :loading="isGenerating(row.name)"
                        @click="handleGenerateVariants(row)"
                    >
                        生成缩略图
                    </el-button>
                    <el-upload
                        class="inline-upload"
                        :show-file-list="false"
                        :http-request="(options) => handleReupload(row, options)"
                        accept="image/*"
                    >
                        <el-button size="small" type="warning" :loading="isReuploading(row.name)">
                            重传
                        </el-button>
                    </el-upload>
                    <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="flex justify-end mt-4">
            <el-pagination
                background
                :total="filteredImages.length"
                :current-page="currentPage"
                :page-size="pageSize"
                :page-sizes="[8, 12, 20, 40]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>
    </el-card>
</template>

<style scoped>
.inline-upload {
    display: inline-block;
    margin: 0 12px;
    vertical-align: middle;
}
</style>
