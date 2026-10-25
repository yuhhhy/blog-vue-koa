<script setup>
import { ref, onMounted, reactive } from 'vue'
import { apiGetUserList, apiDeleteUser, apiUpdateUser } from '@/api/user.js'
import { ElMessageBox } from 'element-plus'
import TableActionItem from '@/components/TableActionItem.vue'
import TableActionMenu from '@/components/TableActionMenu.vue'
import MaterialTextField from '@/components/material/MaterialTextField.vue'

const tableData = ref([])
const dialogFormVisible = ref(false)
const formErrors = reactive({ username: '', password: '', email: '' })
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
  Object.keys(formErrors).forEach(key => { formErrors[key] = '' })
  dialogFormVisible.value = true
  form.userId = row.userId
  form.username = row.username
  form.password = row.password
  form.email = row.email
}

function handleConfirm() {
  formErrors.username = form.username.trim() ? '' : '请输入用户名'
  formErrors.password = form.password ? '' : '请输入密码'
  formErrors.email = form.email.trim() ? '' : '请输入邮箱地址'
  if (Object.values(formErrors).some(Boolean)) return
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
    <el-table-column fixed="right" label="操作" width="88" align="center">
      <template #default="scope">
        <TableActionMenu>
          <TableActionItem kind="edit" @click="handleEdit(scope.$index, scope.row)">编辑</TableActionItem>
          <TableActionItem kind="delete" @click="handleDelete(scope.$index, scope.row)">删除</TableActionItem>
        </TableActionMenu>
      </template>
    </el-table-column>
  </el-table>

  <!-- 更改表单 -->
  <MaterialDialog v-model="dialogFormVisible" title="更改用户信息" width="500">
    <div class="user-edit-form">
      <MaterialTextField v-model="form.username" label="用户名" required :error-message="formErrors.username" @update:model-value="formErrors.username = ''" />
      <MaterialTextField v-model="form.password" label="密码" type="password" revealable required :clearable="false" :error-message="formErrors.password" @update:model-value="formErrors.password = ''" />
      <MaterialTextField v-model="form.email" label="邮箱" type="email" required :error-message="formErrors.email" @update:model-value="formErrors.email = ''" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <MaterialButton @click="dialogFormVisible = false">取消</MaterialButton>
        <MaterialButton type="primary" @click="handleConfirm">
          确认
        </MaterialButton>
      </div>
    </template>
  </MaterialDialog>
</template>

<style>
 tr.el-table__row {
  height: 60px;
}
tr.el-table__row.el-table__row--striped {
  height: 60px;
}
.user-edit-form { display: grid; gap: 16px; }
</style>
