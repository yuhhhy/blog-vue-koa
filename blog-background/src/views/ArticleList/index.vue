<script setup>
import { reactive, ref, onMounted } from 'vue'
import { apiGetBlogList, apiDeleteBlog, apiUpdateBlog } from '@/api/blog.js'
import { ElMessageBox } from 'element-plus'

const tableData = ref()
const dialogFormVisible = ref(false)
const form = reactive({
  id: '',
  coverImage: '',
  date: '',
  tags: [],
  link: ''
})

onMounted(() => {
  apiGetBlogList().then((res) => {
    tableData.value = res
  }).catch((err) => {
    console.error(err)
  })
})

function handleDelete(index, row) {
  ElMessageBox.confirm('确定删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(
    async () => {
    await apiDeleteBlog(row.id)
    tableData.value.splice(index, 1)
    ElMessageBox.alert('删除成功', '提示', {
      confirmButtonText: '确定',
      type: 'success'
    })
  }).catch(() => {
  })
}

function handleEdit(index, row) {
  dialogFormVisible.value = true
  form.id = row.id
  form.coverImage = row.coverImage
  form.date = row.date
  form.tags = row.tags
    form.link = row.link
    console.log(row.tags)
    console.log('form.tags')
  console.log(form.tags);
    
}

function handleConfirm() {
  if (!form.coverImage || !form.date || !form.tags || !form.link) {
    ElMessageBox.alert('请填写完整信息', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    })
    return
  }
  apiUpdateBlog(form).then((res) => {
    ElMessageBox.alert('修改成功', '提示', {
      confirmButtonText: '确定',
      type: 'success'
    })
    // 更新表格数据
    apiGetBlogList().then(res => tableData.value = res)
  }).catch((err) => {
    console.error(err)
  })
  dialogFormVisible.value = false
}

</script>

<template>
  <el-table :data="tableData" stripe>
    <el-table-column
      prop="date"
      label="日期"
      width="200">
    </el-table-column>
    <el-table-column
      prop="title"
      label="标题"
      width="500">
    </el-table-column>
    <el-table-column
      prop="tags"
      label="标签"
      width="400">
      <template #default="scope">
        <el-tag
          v-for="tag in scope.row.tags"
          :key="tag"
          type="primary"
          disable-transitions
          class="mr-2"
          >{{ tag }}</el-tag
        >
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="管理">
      <template #default="scope">
        <el-button type="danger" size="small" @click="handleDelete(scope.$index, scope.row)">
          删除
        </el-button>
        <el-button type="primary" size="small" @click="handleEdit(scope.$index, scope.row)">
          编辑
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 更改表单 -->
  <el-dialog v-model="dialogFormVisible" title="更改博客信息" width="500">
    <el-form :model="form">
      <el-form-item label="封面" label-width="80px">
        <el-input v-model="form.coverImage" />
      </el-form-item>
      <el-form-item label="日期" label-width="80px">
        <el-input v-model="form.date" />
      </el-form-item>
      <el-form-item label="标签" label-width="80px">
        <el-input-tag v-model="form.tags" placeholder="按Enter键添加标签"/>
      </el-form-item>
      <el-form-item label="路由链接" label-width="80px">
        <el-input v-model="form.link" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
 
</style>