<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';

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


// 模拟文件上传
const handleHttpRequest = (options) => {
    const { file } = options;
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
        ElMessage.error('只能上传图片文件！');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const newImage = {
            id: Date.now(),
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file), // 创建 Blob URL 用于预览和下载
            uploadDate: new Date(),
        };
        imageList.value.unshift(newImage);
        ElMessage.success('图片上传成功（纯前端模拟）');
    };
    reader.readAsDataURL(file);
};

// 删除图片
const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要删除图片 "${row.name}" 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        const index = imageList.value.findIndex(img => img.id === row.id);
        if (index !== -1) {
            URL.revokeObjectURL(imageList.value[index].url); // 释放内存
            imageList.value.splice(index, 1);
            ElMessage.success('删除成功');
        }
    }).catch(() => {});
};

// 重命名图片
const handleRename = (row) => {
    ElMessageBox.prompt('请输入新的文件名', '重命名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: row.name,
        inputValidator: (value) => {
            if (!value) return '文件名不能为空';
            return true;
        },
    }).then(({ value }) => {
        const image = imageList.value.find(img => img.id === row.id);
        if (image) {
            image.name = value;
            ElMessage.success('重命名成功');
        }
    }).catch(() => {});
};

// 下载图片
const handleDownload = (row) => {
    const link = document.createElement('a');
    link.href = row.url;
    link.download = row.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const formatSize = (size) => {
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date) => {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

onBeforeUnmount(() => {
    // 组件卸载时，释放所有 Blob URL 以防止内存泄漏
    imageList.value.forEach(img => URL.revokeObjectURL(img.url));
});

</script>

<template>
    <el-card>
        <template #header>
            <div class="flex justify-between items-center">
                <span>图片管理</span>
                <el-upload
                    :show-file-list="false"
                    :http-request="handleHttpRequest"
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

        <el-table :data="filteredImages" v-loading="loading" empty-text="暂无图片，请点击右上角按钮上传">
            <el-table-column label="预览" width="120">
                <template #default="{ row }">
                    <el-image
                        style="width: 80px; height: 80px; border-radius: 4px;"
                        :src="row.url"
                        :preview-src-list="[row.url]"
                        preview-teleported
                        fit="cover"
                        lazy
                    />
                </template>
            </el-table-column>
            <el-table-column prop="name" label="文件名" sortable>
                <template #default="{ row }">
                    <span>{{ row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="大小" width="120" sortable>
                <template #default="{ row }">
                    {{ formatSize(row.size) }}
                </template>
            </el-table-column>
            <el-table-column label="上传时间" width="180" sortable>
                    <template #default="{ row }">
                    {{ formatDate(row.uploadDate) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="250" fixed="right">
                <template #default="{ row }">
                    <el-button size="small" @click="handleDownload(row)">下载</el-button>
                    <el-button size="small" type="primary" @click="handleRename(row)">重命名</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</template>

<style>

</style>
