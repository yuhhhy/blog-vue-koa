<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElInput, ElButton, ElForm, ElFormItem, ElMessage } from 'element-plus'
import { apiUserLogin } from '@/api/userApi.js'
import { useUserStore } from '@/stores/userStore.js'

const router = useRouter()

const fromRef = ref(null)

// reactive 设置默认值
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
  <div class="wrapper">
    <div class="login">
      <p>后台管理系统</p>
      <el-form :model="form" :rules="rules" ref="fromRef">
        <el-form-item prop="username">
          <el-input 
            class="input"
            v-model="form.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            class="input" 
            v-model="form.password" 
            placeholder="密码"
            type="password"
            show-password
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-button class="input" type="primary" @click="onLogin">登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #dddddd;
  .login {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 250px;
    width: 400px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 8px 8px 20px 0px rgba(0, 0, 0, 0.5);
    .input {
      margin: 5px 0;
      width: 240px;
    }
    p {
      font-size: 20px;
      margin-bottom: 20px;
      color: #009dff;
    }
  }
}
</style>