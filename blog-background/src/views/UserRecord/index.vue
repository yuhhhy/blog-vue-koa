<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { apiGetVisitorList, apiDeleteVisitor } from '@/api/visitor.js'

const loading = ref(false)
const visitorList = ref([])
const queryParams = ref({
  page: 1,
  limit: 10
})

onMounted(() => {
    getList()
})

const getList = async () => {
  loading.value = true
  try {
    const res = await apiGetVisitorList(queryParams.value)
    visitorList.value = res.visitors
    visitorList.value.forEach((item) => {
      item.visitedAt = new Date(item.visitedAt).toLocaleString()
    })
  } catch (error) {
    console.error('获取访客列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  queryParams.value.limit = val
  queryParams.value.page = 1
  getList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  queryParams.value.page = val
  getList()
}

// 删除访客记录
const handleDelete = async (index, row) => {
  const res = await apiDeleteVisitor(row._id)
  getList()
  ElMessage.success(res.message)
}
</script>

<template>
  <el-table :data="visitorList" v-loading="loading" stripe>
    <el-table-column
      prop="visitedAt"
      label="访问时间">
    </el-table-column>
    <el-table-column
      prop="address"
      label="访问来源">
    </el-table-column>
    <el-table-column
      prop="viewNum"
      label="访问次数"
      width="100">
    </el-table-column>
    <el-table-column
      prop="role"
      label="访问权限"
      width="120">
    </el-table-column>
    <el-table-column
      prop="page"
      label="访问页面"
      width="120">
    </el-table-column>
    <el-table-column
      prop="ip"
      label="访问IP">
    </el-table-column>
    <el-table-column
      prop="browser"
      label="访问设备">
    </el-table-column>
    <el-table-column fixed="right" label="管理">
      <template #default="scope">
        <el-button type="danger" size="small" @click="handleDelete(scope.$index, scope.row)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页器 -->
  <div class="bg-white flex-1 flex flex-row-reverse p-7">
    <el-pagination
    background
    layout="sizes, prev, pager, next"
    :total="1000"
    :page-sizes="[10, 20, 50, 100]"
    v-model:current-page="queryParams.page"
    v-model:page-size="queryParams.limit"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
  </div>
</template>

<style scoped>
 
</style>