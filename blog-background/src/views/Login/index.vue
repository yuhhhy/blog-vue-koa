<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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
          const welcomeMessage = res.data.role === 'admin'
            ? '欢迎回来，管理员'
            : `欢迎回来，用户 ${res.data.username}`
          ElMessage.success(welcomeMessage)
          // 对返回的用户数据及token存储到Pinia
          userStore.setUserData(res.data)
          // 登录成功后进行页面跳转
          router.replace({ name: 'DataDashboard' })
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
    <section class="login-shell" aria-labelledby="login-title">
      <aside class="login-intro">
        <div class="shape shape--lime" aria-hidden="true"></div>
        <div class="shape shape--blue" aria-hidden="true"></div>
        <div class="shape shape--amber" aria-hidden="true"></div>
        <div class="shape shape--sky" aria-hidden="true"></div>

        <div class="brand-lockup">
          <h1 id="login-title">
            <span class="brand-name">一曝<br>十寒</span>
            <span class="brand-subtitle">后台管理系统</span>
          </h1>
        </div>
      </aside>

      <div class="login-panel">
        <div class="login-card">
          <h2>欢迎回来</h2>

          <el-form :model="form" :rules="rules" ref="fromRef" class="login-form" @submit.prevent="onLogin">
            <el-form-item label="用户名" prop="username">
              <MaterialInput
                v-model="form.username"
                autocomplete="username"
                placeholder="请输入用户名"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <MaterialInput
                v-model="form.password"
                autocomplete="current-password"
                placeholder="请输入密码"
                type="password"
                show-password
              />
            </el-form-item>
            <MaterialButton class="login-submit" type="primary" native-type="submit">登录</MaterialButton>
          </el-form>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  display: grid;
  place-items: center;
  width: 100vw;
  min-height: 100vh;
  padding: 28px;
  color: var(--admin-text);
  background: #fffbfe;
  --login-blue: #4f5ff5;
  --login-green: #00c63b;
  --login-lime: #adff00;
  --login-amber: #ffbd0b;
  --login-sky: #8fc8f5;
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(360px, 0.94fr) minmax(520px, 1.06fr);
  gap: 12px;
  width: min(1180px, 100%);
  min-height: 620px;
}

.login-intro {
  position: relative;
  display: flex;
  align-items: center;
  padding: clamp(48px, 6vw, 76px);
  overflow: hidden;
  border-radius: 40px;
  background: var(--login-green);
}

.brand-lockup {
  position: relative;
  z-index: 1;
  width: 100%;
}

.login-intro h1,
.brand-name,
.brand-subtitle {
  display: block;
}

.login-intro h1 {
  margin: 0;
}

.brand-name {
  color: #1d1b20;
  font-family: "Google Sans", "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: clamp(76px, 8vw, 112px);
  font-weight: 500;
  letter-spacing: -0.075em;
  line-height: 0.96;
}

.brand-subtitle {
  margin-top: 42px;
  color: #1d1b20;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0.04em;
}

.login-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  border-radius: 40px;
  background: #f8f2f7;
}

.shape {
  position: absolute;
  pointer-events: none;
}

.shape--lime {
  top: -72px;
  left: -52px;
  width: 330px;
  height: 250px;
  border-radius: 38% 62% 68% 32% / 58% 34% 66% 42%;
  background: var(--login-lime);
  transform: rotate(24deg);
}

.shape--blue {
  top: -48px;
  right: -88px;
  width: 360px;
  height: 410px;
  border-radius: 52% 48% 40% 60% / 28% 58% 42% 72%;
  background: var(--login-blue);
  transform: rotate(-12deg);
}

.shape--amber {
  right: -24px;
  bottom: -92px;
  width: 390px;
  height: 250px;
  border-radius: 64% 36% 54% 46% / 42% 60% 40% 58%;
  background: var(--login-amber);
  transform: rotate(11deg);
}

.shape--sky {
  bottom: -108px;
  left: -76px;
  width: 300px;
  height: 330px;
  border-radius: 42% 58% 64% 36% / 56% 42% 58% 44%;
  background: var(--login-sky);
  transform: rotate(-20deg);
}

.login-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: stretch;
  width: 100%;
  padding: clamp(56px, 7vw, 92px);
}

h2 {
  margin: 0 0 34px;
  color: #1d1b20;
  font-size: 36px;
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 1.2;
}

.login-form {
  display: grid;
  gap: 4px;
}

.login-submit {
  width: 100%;
  min-height: 52px;
  margin-top: 10px;
  border-color: var(--login-blue);
  background: var(--login-blue);
}

:deep(.el-input__wrapper) {
  min-height: 52px;
  border-radius: 16px;
  background: #fffbfe;
}

:deep(.el-form-item) {
  display: block;
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  height: auto;
  margin-bottom: 8px;
  line-height: 1.4;
}

@media (max-width: 760px) {
  .login-page {
    place-items: start center;
    min-width: 0;
    min-height: 100vh;
    padding: 16px;
  }

  .login-shell {
    grid-template-columns: 1fr;
    gap: 8px;
    min-height: 0;
  }

  .login-intro {
    min-height: 300px;
    padding: 42px;
    border-radius: 32px;
  }

  .brand-name {
    font-size: 72px;
  }

  .brand-subtitle {
    margin-top: 26px;
    font-size: 20px;
  }

  .login-panel {
    min-height: 480px;
    border-radius: 32px;
  }

  .login-card {
    padding: 44px 32px;
  }
}
</style>
