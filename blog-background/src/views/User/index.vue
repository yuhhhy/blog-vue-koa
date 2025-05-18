<script setup>
import { ref, onMounted } from 'vue'
import { apiGetUserList } from '@/api/userApi.js'

const tableData = ref([])

onMounted(() => {
    apiGetUserList().then((res) => {
        tableData.value = res
    }).catch((err) => {
        console.error(err)
    })
})


</script>

<template>
  <el-table :data="tableData" stripe>
    <el-table-column
      prop="userId"
      label="ID">
    </el-table-column>
    <el-table-column
      prop="username"
      label="姓名">
    </el-table-column>
    <el-table-column
      prop="email"
      label="邮箱">
    </el-table-column>
    <el-table-column
      prop="role"
      label="角色">
      <template #default="scope">
        <el-tag
          :type="scope.row.role === 'admin' ? 'success' : 'primary'"
          disable-transitions
          >{{ scope.row.role }}</el-tag
        >
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="管理">
      <template #default>
        <el-button type="danger" size="small">
          删除
        </el-button>
        <el-button type="primary" size="small">
          编辑
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
 
</style>