<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { apiUserLogin } from '@/api/user.js'
import { useUserStore } from '@/stores/userStore.js'
import MaterialIcon from '@/components/MaterialIcon.vue'
import {
  mdiAccountOutline,
  mdiArrowRight,
  mdiLockOutline,
  mdiShieldCheckOutline
} from '@mdi/js'

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
    <div class="login-orb login-orb--top" aria-hidden="true"></div>
    <div class="login-orb login-orb--bottom" aria-hidden="true"></div>

    <section class="login-shell" aria-labelledby="login-title">
      <aside class="login-intro">
        <div class="login-brand">
          <div class="brand-mark">Y</div>
          <div>
            <p>一曝十寒</p>
            <span>ADMIN STUDIO</span>
          </div>
        </div>

        <div class="intro-copy">
          <span class="intro-label">CONTENT WORKSPACE</span>
          <h1>让每一次创作，<br>都有迹可循。</h1>
          <p>在一个清晰、专注的空间里管理文章、评论与素材。</p>
        </div>

        <div class="security-note">
          <span class="security-icon"><MaterialIcon :path="mdiShieldCheckOutline" /></span>
          <span>仅限已授权的管理员访问</span>
        </div>
      </aside>

      <div class="login-panel">
        <div class="login-panel__header">
          <span class="welcome-icon"><MaterialIcon :path="mdiAccountOutline" /></span>
          <div>
            <p class="eyebrow">欢迎回来</p>
            <h2 id="login-title">登录后台</h2>
          </div>
        </div>
        <p class="login-subtitle">请输入管理员账号，继续管理你的内容。</p>

        <el-form :model="form" :rules="rules" ref="fromRef" class="login-form" @submit.prevent="onLogin">
          <el-form-item label="用户名" prop="username">
            <MaterialInput
              v-model="form.username"
              autocomplete="username"
              placeholder="请输入用户名"
            >
              <template #prefix><MaterialIcon :path="mdiAccountOutline" /></template>
            </MaterialInput>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <MaterialInput
              v-model="form.password"
              autocomplete="current-password"
              placeholder="请输入密码"
              type="password"
              show-password
            >
              <template #prefix><MaterialIcon :path="mdiLockOutline" /></template>
            </MaterialInput>
          </el-form-item>
          <MaterialButton class="login-submit" type="primary" native-type="submit">
            <span>登录</span>
            <MaterialIcon :path="mdiArrowRight" />
          </MaterialButton>
        </el-form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  position: relative;
  display: grid;
  place-items: center;
  width: 100vw;
  height: 100vh;
  padding: 40px;
  overflow: hidden;
  color: var(--admin-text);
  background:
    radial-gradient(circle at 50% -20%, rgba(103, 80, 164, 0.12), transparent 45%),
    var(--admin-bg-soft);
}

.login-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.login-orb--top {
  top: -180px;
  right: -100px;
  width: 420px;
  height: 420px;
  background: var(--admin-primary-soft);
}

.login-orb--bottom {
  bottom: -220px;
  left: -120px;
  width: 480px;
  height: 480px;
  background: #d3e8d0;
}

.login-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(340px, 0.9fr) minmax(420px, 1fr);
  width: min(920px, 100%);
  min-height: 570px;
  overflow: hidden;
  border: 1px solid var(--admin-line);
  border-radius: 28px;
  background: var(--admin-surface);
  box-shadow: 0 24px 64px rgba(29, 27, 32, 0.12);
}

.login-intro {
  display: flex;
  flex-direction: column;
  padding: 42px;
  color: var(--admin-on-primary-soft);
  background:
    radial-gradient(circle at 12% 90%, rgba(255, 255, 255, 0.44), transparent 30%),
    linear-gradient(145deg, var(--admin-primary-soft), #d8e2ff);
}

.login-brand {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 64px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: var(--admin-on-primary);
  font-family: "JetBrains Mono", "SFMono-Regular", monospace;
  font-size: 20px;
  font-weight: 900;
  background: var(--admin-primary);
  box-shadow: 0 8px 20px rgba(103, 80, 164, 0.22);
}

.login-brand p,
.login-brand span {
  display: block;
  margin: 0;
}

.login-brand p {
  font-size: 16px;
  font-weight: 800;
}

.login-brand span {
  margin-top: 3px;
  color: color-mix(in srgb, var(--admin-on-primary-soft) 64%, transparent);
  font-family: "JetBrains Mono", "SFMono-Regular", monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
}

.intro-copy {
  margin: auto 0;
}

.intro-label,
.eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.intro-label {
  color: var(--admin-primary);
}

.intro-copy h1 {
  margin: 14px 0 18px;
  font-size: clamp(34px, 4vw, 46px);
  font-weight: 650;
  letter-spacing: -0.04em;
  line-height: 1.16;
}

.intro-copy p {
  max-width: 320px;
  margin: 0;
  color: color-mix(in srgb, var(--admin-on-primary-soft) 72%, transparent);
  font-size: 14px;
  line-height: 1.8;
}

.security-note {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 48px;
  color: color-mix(in srgb, var(--admin-on-primary-soft) 70%, transparent);
  font-size: 12px;
  font-weight: 600;
}

.security-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: var(--admin-primary);
  background: rgba(255, 255, 255, 0.56);
}

.login-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 56px;
}

.login-panel__header {
  display: flex;
  gap: 14px;
  align-items: center;
}

.welcome-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: var(--admin-on-primary-soft);
  background: var(--admin-primary-soft);
}

.eyebrow {
  color: var(--admin-primary);
}

h2 {
  margin: 4px 0 0;
  font-size: 28px;
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.login-subtitle {
  margin: 20px 0 30px;
  color: var(--admin-text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.login-form {
  display: grid;
  gap: 4px;
}

.login-submit {
  width: 100%;
  min-height: 48px;
  margin-top: 8px;
}

.login-submit :deep(.el-button__text) {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

:deep(.el-input__wrapper) {
  min-height: 48px;
  background: var(--admin-surface);
}

:deep(.el-input__prefix) {
  color: var(--admin-text-muted);
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
    height: auto;
    min-height: 100vh;
    padding: 24px;
    overflow: auto;
  }

  .login-shell {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .login-intro {
    padding: 28px;
  }

  .login-brand {
    margin-bottom: 32px;
  }

  .intro-copy h1 {
    font-size: 32px;
  }

  .security-note {
    margin-top: 28px;
  }

  .login-panel {
    padding: 36px 28px;
  }
}
</style>
