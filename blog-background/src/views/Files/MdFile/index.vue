<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { apiGetMdList, apiDeleteMd } from '@/api/files.js';
import cfg from '@/config/index.js';
import { useUserStore } from '@/stores/userStore';

const baseApi = cfg.baseApi;
const userStore = useUserStore();

const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${userStore.userData?.token}`,
    'require-auth': 'true'
}));

const mdList = ref([]);
const loading = ref(false);
const searchQuery = ref('');

const filteredMds = computed(() => {
    if (!searchQuery.value) {
        return mdList.value;
    }
    return mdList.value.filter(md =>
        md.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const fetchMdList = async () => {
    loading.value = true;
    try {
        const res = await apiGetMdList();
        mdList.value = res.data;
    } catch (error) {
        ElMessage.error('获取 Markdown 列表失败');
    } finally {
        loading.value = false;
    }
};

const handleUploadSuccess = (response, file) => {
    ElMessage.success(`文件 "${file.name}" 上传成功`);
    fetchMdList();
};

const handleUploadError = () => {
    ElMessage.error('文件上传失败');
};

const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要永久删除文件 "${row.name}" 吗？`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        await apiDeleteMd(row.name);
        fetchMdList();
        ElMessage.success('删除成功');
    });
};

const handleDownload = (row) => {
    const link = document.createElement('a');
    link.href = row.url;
    link.download = row.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const formatSize = (size) => {
    if (!size) return '0 B';
    const k = 1024;
    const i = Math.floor(Math.log(size) / Math.log(k));
    return `${(size / Math.pow(k, i)).toFixed(2)} ${['B', 'KB', 'MB', 'GB'][i]}`;
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));
};

onMounted(fetchMdList);
</script>

<template>
    <el-card>
        <template #header>
            <div class="flex justify-between items-center">
                <span>Markdown 文件管理</span>
                <el-upload
                    :action="`${baseApi}/upload/md`"
                    :headers="uploadHeaders"
                    :show-file-list="false"
                    :on-success="handleUploadSuccess"
                    :on-error="handleUploadError"
                    name="file"
                    accept=".md"
                >
                    <el-button type="primary">上传 .md 文件</el-button>
                </el-upload>
            </div>
        </template>

        <el-input
            v-model="searchQuery"
            placeholder="搜索文件名"
            clearable
            class="mb-4"
        />

        <el-table :data="filteredMds" v-loading="loading">
            <el-table-column prop="name" label="文件名" sortable />
            <el-table-column label="大小" width="120" sortable :sort-by="row => row.size">
                <template #default="{ row }">{{ formatSize(row.size) }}</template>
            </el-table-column>
            <el-table-column label="上传时间" width="180" sortable :sort-by="row => new Date(row.uploadDate).getTime()">
                <template #default="{ row }">{{ formatDate(row.uploadDate) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
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