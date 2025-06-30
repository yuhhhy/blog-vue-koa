<script setup>
import { ref, onMounted, reactive } from 'vue'
import { getLinks, createLink, updateLink, deleteLink } from '@/api/links.js'
import { ElMessageBox } from 'element-plus'
import { getTimestampToSeconds } from '@/utils/date.js'

const tableData = ref([])
const dialogFormVisible = ref(false)
const form = reactive({
  id: '',
  name: '',
  description: '',
  site: '',
  avatar: ''
})

onMounted(() => {
    getLinksList()
})

async function getLinksList() {
  const res = await getLinks()
  tableData.value = res
}

function handleDelete(index, row) {
  ElMessageBox.confirm('确定删除该友链吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(
    async () => {
      await deleteLink(row.id)
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
  form.id = row.id
  form.name = row.name
  form.description = row.description
  form.site = row.site
  form.avatar = row.avatar
}

function handleAddLink() {
  dialogFormVisible.value = true
  form.id = ''
  form.name = ''
  form.description = ''
  form.site = ''
  form.avatar = ''
}

async function handleConfirm() {
  if (!form.name || !form.description || !form.site || !form.avatar) {
    ElMessageBox.alert('请填写完整信息', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    })
    return
  }

  try {
    if (form.id) {
      await updateLink(form)
    } else {
      const now = new Date()
      const newId = getTimestampToSeconds(now)
      form.id = newId
      await createLink(form)
    }
    
    ElMessageBox.alert('操作成功', '提示', {
      confirmButtonText: '确定',
      type: 'success'
    })
    dialogFormVisible.value = false
    getLinksList()
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <!-- 新增友链按钮 -->
  <div class="w-full bg-white border-b">
    <button class="bg-blue-400 text-white w-10 h-7 rounded-lg m-2" @click="handleAddLink">+</button>
  </div>
  <!-- 友链表格 -->
  <el-table :data="tableData" max-height="703px">
    <el-table-column label="头像" width="140">
      <template #default="scope">
        <el-image style="width: 50px; height: 50px" :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]"
          fit="cover" preview-teleported />
      </template>
    </el-table-column>
    <el-table-column prop="name" label="名称" width="200">
    </el-table-column>
    <el-table-column prop="description" label="描述" width="400">
    </el-table-column>
    <el-table-column prop="site" label="网址" width="300">
      <template #default="scope">
        <a :href="scope.row.site" target="_blank" class="text-blue-400">{{ scope.row.site }}</a>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="管理" width="180">
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

  <!-- 编辑/新增表单 -->
  <el-dialog v-model="dialogFormVisible" :title="form.id ? '编辑友链' : '新增友链'" width="500">
    <el-form :model="form">
      <el-form-item label="名称" label-width="80px">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="描述" label-width="80px">
        <el-input v-model="form.description" />
      </el-form-item>
      <el-form-item label="网址" label-width="80px">
        <el-input v-model="form.site" />
      </el-form-item>
      <el-form-item label="头像" label-width="80px">
        <el-input v-model="form.avatar" />
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