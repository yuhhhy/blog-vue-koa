<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElInput, ElButton, ElForm, ElFormItem, ElMessage } from 'element-plus'
import { apiUserLogin } from '@/api/user.js'
import { useUserStore } from '@/stores/userStore.js'

const router = useRouter()
const fromRef = ref(null)
const form = reactive({
  username: 'test1', // 用户名字段
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
          ElMessage.success(res.message)
          // 对返回的用户数据及token存储到Pinia
          userStore.setUserData(res.data)
          // 登录成功后进行页面跳转
          router.push('/')
        } else {
          ElMessage.error(res.message)
        }
      })
    }
  })
}
</script>

<template>
  <main class="login-page">
    <section class="login-panel">
      <div class="login-brand">
        <div class="brand-mark">Y</div>
        <div>
          <p>一曝十寒</p>
          <span>Admin Studio</span>
        </div>
      </div>
      <h1>后台管理系统</h1>
      <p class="login-subtitle">保持内容、评论与素材流转清晰。</p>

      <el-form :model="form" :rules="rules" ref="fromRef" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="form.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            placeholder="密码"
            type="password"
            show-password
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-button class="login-submit" type="primary" @click="onLogin">登录</el-button>
      </el-form>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  display: grid;
  place-items: center;
  width: 100vw;
  height: 100vh;
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(16, 23, 25, 0.96), rgba(24, 34, 36, 0.94)),
    radial-gradient(circle at 22px 22px, rgba(255, 255, 255, 0.08) 1px, transparent 1.4px);
  background-size: auto, 26px 26px;
}

.login-page::before {
  position: fixed;
  inset: auto 10vw 8vh auto;
  width: min(420px, 40vw);
  height: min(420px, 40vw);
  content: "";
  border-radius: 50%;
  background: radial-gradient(circle, rgba(110, 231, 249, 0.22), transparent 64%);
  filter: blur(4px);
}

.login-panel {
  position: relative;
  width: min(420px, 100%);
  padding: 34px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--admin-radius);
  color: #fff;
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.12), rgba(255, 255, 252, 0.06)),
    rgba(16, 23, 25, 0.86);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
}

.login-brand {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 28px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--admin-radius-sm);
  color: #101719;
  font-family: "JetBrains Mono", "SFMono-Regular", monospace;
  font-size: 20px;
  font-weight: 900;
  background: linear-gradient(135deg, #b7f7ff, #6ee7f9 48%, #8ea2ff);
}

.login-brand p,
.login-brand span {
  display: block;
  margin: 0;
}

.login-brand p {
  font-size: 16px;
  font-weight: 850;
}

.login-brand span {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.48);
  font-family: "JetBrains Mono", "SFMono-Regular", monospace;
  font-size: 11px;
}

h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
}

.login-subtitle {
  margin: 10px 0 24px;
  color: rgba(255, 255, 255, 0.58);
  line-height: 1.7;
}

.login-form {
  display: grid;
  gap: 4px;
}

.login-submit {
  width: 100%;
  min-height: 40px;
  margin-top: 4px;
}

:deep(.el-input__wrapper) {
  min-height: 40px;
  background: rgba(255, 255, 252, 0.92);
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
