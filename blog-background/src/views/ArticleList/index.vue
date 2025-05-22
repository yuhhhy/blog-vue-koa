<script setup>
import { reactive, ref, onMounted } from 'vue'
import { apiGetBlogList, apiDeleteBlog, apiUpdateBlog } from '@/api/blog.js'
import { apiGetBlogContentList, apiDeleteBlogContent, apiUpdateBlogContent } from '@/api/blogContent.js'
import { ElMessageBox } from 'element-plus'
import { getFormatDate } from '@/utils/date.js'
import { apiUpdateWebsiteLastUpdate } from '@/api/websiteData.js'
import Vditor from '@/views/ArticleCreate/components/Vditor.vue'

const tableData = ref()
const dialogFormVisible = ref(false)
const form = reactive({
  author: '',
  title: '',
  tags: [],
  content: ''
})

onMounted(() => {
  getBlogs()
})


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

// 处理删除
function handleDelete(index, row) {
  ElMessageBox.confirm('确定删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(
    async () => {
      // 更新数据
      await apiDeleteBlog(row.id)
      await apiDeleteBlogContent(row.id)
      // 更新视图
      tableData.value.splice(index, 1)
      // 更新网站更新时间
      apiUpdateWebsiteLastUpdate()

      ElMessageBox.alert('删除成功', '提示', {
        confirmButtonText: '确定',
        type: 'success'
      })
  }).catch(() => {
  })
}

// 编辑文章信息前填入默认表单
function handleEdit(index, row) {
  dialogFormVisible.value = true
  form.author = row.author
  form.title = row.title
  form.tags = row.tags
  form.content = row.content
}

// 处理更改
function handleConfirm() {
  // 确认信息完整
  if (!form.author || !form.title || !form.tags || !form.content) {
    ElMessageBox.alert('请填写完整信息', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    })
    return
  }
  // 发送更改
  UpdateBlog()

  // 更新表格数据
  getBlogs()
  
  // 更新网站更新时间
  apiUpdateWebsiteLastUpdate()

  // 弹出框不可见
  dialogFormVisible.value = false
}


// 更改函数
function UpdateBlog() {

  ElMessageBox.alert('修改成功', '提示', {
    confirmButtonText: '确定',
    type: 'success'
  })
}
</script>

<template>
  <el-table :data="tableData" stripe>
    <el-table-column
      prop="createTime"
      label="日期"
      width="160">
    </el-table-column>
    <el-table-column
      prop="title"
      label="标题"
      width="450">
    </el-table-column>
    <el-table-column
      prop="tags"
      label="标签"
      width="300">
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
    <el-table-column
      prop="viewCount"
      label="浏览量"
      width="120">
    </el-table-column>
    <el-table-column
      prop="likeCount"
      label="点赞量"
      width="120">
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
  <el-dialog v-model="dialogFormVisible" title="更改博客信息" width="800">
    <el-form :model="form">
      <el-form-item label="作者" label-width="80px">
        <el-input v-model="form.author" />
      </el-form-item>
      <el-form-item label="标题" label-width="80px">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="标签" label-width="80px">
        <el-input-tag v-model="form.tags" placeholder="按Enter键添加标签"/>
      </el-form-item>
    </el-form>
    <!-- 文本编辑器 -->
    <Vditor :content="form.content"></Vditor>

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