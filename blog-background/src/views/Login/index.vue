<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElInput, ElButton, ElForm, ElFormItem, ElMessage } from 'element-plus'
import { apiUserLogin } from '@/api/user.js'
import { useUserStore } from '@/stores/userStore.js'

const router = useRouter()
const fromRef = ref(null)
const form = reactive({
  username: 'admin', // 用户名字段
  password: '123456'  // 密码字段
})
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}
const userStore = useUserStore()


const onLogin = () => {
  // 点击登录时验证表单
  fromRef.value.validate(valid => { 
    if (!valid) {
      ElMessage.error('请输入正确的用户名和密码')
      return
    } else {
    // 调用登录 api
    apiUserLogin(form)
      .then(res => {
        if (res.code === 200) {
          // 对返回的用户数据及token存储到Pinia
          userStore.setUserData(res.data)
          // 登录成功后进行页面跳转
          router.push('/')
        }
      })
    }
  })
}
</script>

<template>
  <div class="flex justify-center items-center h-screen w-screen bg-slate-100">
    <div class="flex flex-col justify-center items-center h-64 w-96 border border-slate-300 rounded-md shadow-xl bg-white">
      <p class="text-xl mb-5 text-sky-400">后台管理系统</p>
      <el-form :model="form" :rules="rules" ref="fromRef">
        <el-form-item prop="username">
          <el-input 
            class="my-1 mx-0 w-60"
            v-model="form.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            class="my-1 mx-0 w-60" 
            v-model="form.password" 
            placeholder="密码"
            type="password"
            show-password
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-button class="my-1 mx-0 w-60" type="primary" @click="onLogin">登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
</style>