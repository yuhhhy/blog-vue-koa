<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { apiGetImageList, apiDeleteImage } from '@/api/files.js';
import cfg from '@/config/index.js';

const baseApi = cfg.baseApi;

const imageList = ref([]);
const loading = ref(false);
const searchQuery = ref('');

const filteredImages = computed(() => {
    if (!searchQuery.value) {
        return imageList.value;
    }
    return imageList.value.filter(img =>
        img.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
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
    ElMessage.error('图片上传失败，请检查文件大小或网络');
};

// 删除图片
const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要删除图片 "${row.name}" 吗？`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await apiDeleteImage(row.name);
            fetchImageList();
            ElMessage.success('图片删除成功');
        } catch (error) {
            ElMessage.error('删除失败');
        }
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

onMounted(() => {
    fetchImageList();
});

</script>

<template>
    <el-card>
        <template #header>
            <div class="flex justify-between items-center">
                <span>图片管理</span>
                <el-upload
                    :action="`${baseApi}/upload/image`"
                    :show-file-list="false"
                    :on-success="handleUploadSuccess"
                    :on-error="handleUploadError"
                    name="file"
                    accept="image/*"
                >
                    <el-button type="primary">上传图片</el-button>
                </el-upload>
            </div>
        </template>

        <el-input
            v-model="searchQuery"
            placeholder="搜索图片名称"
            clearable
            class="mb-4"
        />

        <el-table :data="filteredImages" v-loading="loading" stripe empty-text="暂无图片，或无法连接到服务器">
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
            <el-table-column prop="name" label="文件名" sortable :sort-by="row => row.name">
                <template #default="{ row }">
                    <span>{{ row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="大小" width="120" sortable :sort-by="row => row.size">
                <template #default="{ row }">
                    {{ formatSize(row.size) }}
                </template>
            </el-table-column>
            <el-table-column label="上传时间" width="180" sortable :sort-by="row => new Date(row.uploadDate).getTime()">
                    <template #default="{ row }">
                    {{ formatDate(row.uploadDate) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="250" fixed="right">
                <template #default="{ row }">
                    <el-button size="small" @click="handleDownload(row)">下载</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</template>

<style scoped>
</style>

