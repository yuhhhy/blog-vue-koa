<script setup>
import { ref, onMounted, reactive } from 'vue'
import { apiGetUserList, apiDeleteUser, apiUpdateUser } from '@/api/user.js'
import { ElMessageBox } from 'element-plus'

const tableData = ref([])
const dialogFormVisible = ref(false)
const form = reactive({
  userId: '',
  username: '',
  password: '',
  email: ''
})

onMounted(() => {
    apiGetUserList().then((res) => {
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
      await apiDeleteUser(row.userId)
      tableData.value.splice(index, 1)
      ElMessageBox.alert('删除成功', '提示', {
        confirmButtonText: '确定',
        type: 'success'
      })
    }
  ).catch(() => {
  })
}

function handleEdit(index, row) {
  dialogFormVisible.value = true
  form.userId = row.userId
  form.username = row.username
  form.password = row.password
  form.email = row.email
}

function handleConfirm() {
  if (!form.username || !form.password || !form.email) {
    ElMessageBox.alert('请填写完整信息', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    })
    return
  }
  apiUpdateUser(form).then((res) => {
    ElMessageBox.alert('修改成功', '提示', {
      confirmButtonText: '确定',
      type: 'success'
    })
    // 更新表格数据
    apiGetUserList().then(res => tableData.value = res)
  }).catch((err) => {
    console.error(err)
  })
  dialogFormVisible.value = false
}

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

    <slot></slot>

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
  <el-dialog v-model="dialogFormVisible" title="更改用户信息" width="500">
    <el-form :model="form">
      <el-form-item label="用户名" label-width="80px">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="密码" label-width="80px">
        <el-input v-model="form.password" />
      </el-form-item>
      <el-form-item label="邮箱" label-width="80px">
        <el-input v-model="form.email" />
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