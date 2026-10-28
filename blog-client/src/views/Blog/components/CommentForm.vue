<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import { apiCreateComment, apiSendEmailNotification } from '@/api/comment.js'
import { apiUpdateWebsiteComment } from '@/api/websiteData.js'
import { getAvatar } from '@/utils/avatar'

// 导入bili-emojis目录下的所有PNG图片
const biliEmojisFiles = import.meta.glob('/src/assets/images/bili-emojis/*.png', { eager: true })

const emit = defineEmits(['updateComments'])
const route = useRoute()
const props = defineProps({
  // 这一评论的回复数组
  comments: {
    type: Array,
    required: true
  },
  // 是否是一级评论
  hasParent: {
    type: Boolean,
    required: true
  },
  // 这一评论的父级评论ID，如果没有父级则为空串
  parentId: {
    type: String,
    default: ''
  },
  blogId: {
    type: String,
    required: true
  },
  replyTo: {
    type: String,
    default: ''
  }
})

// 表单收集四个数据：username、email、website、content
const formRef = ref(null)
const form = reactive({
  username: '',
  email: '',
  website: '',
  content: '',
})
// 表单校验规则、校验失败的ElMessage提示信息
const rules = {
  username: [
    { required: true, message: '请输入昵称', trigger: 'submit' },
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'submit' },
    { type: 'email', message: '请输入正确的电子邮箱', trigger: 'submit' }
  ],
  content: [
    { required: true, message: '请输入评论内容', trigger: 'submit' }
  ]
}

// 提交表单的校验操作 校验三个数据：username、email、content
const onSubmit = () => {
  formRef.value.validate((valid, fields) => {
    if (!valid) {
      // 根据不同的校验结果，给出不同的提示信息
      if(fields.username && fields.username[0]){
        ElMessage.error(fields.username[0].message)
      } else if(fields.email && fields.email[0]){
        ElMessage.error(fields.email[0].message)
      } else if(fields.content && fields.content[0]){
        ElMessage.error(fields.content[0].message)
      }
      formRef.value.clearValidate() // 不要显示ElFrom的提示信息
      return
    } else {
      doSubmit()
    }
  })
}

// 校验成功后的逻辑
const doSubmit = async () => {
  try {
    const customAvatar = customAvatarUrl.value.trim()
    if (customAvatar && !isValidAvatarUrl(customAvatar)) {
      ElMessage.error('请输入有效的头像地址')
      return
    }

    // Resolve the avatar before creating the comment so it is part of the initial payload.
    const avatarURL = customAvatar || await getAvatar(form.email)

    // 生成评论
    let newComment = { 
        ...form,
        id: Date.now().toString(36),
        blogId: props.blogId,
        parentId: props.parentId,
        avatar: avatarURL,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
        createTime: new Date(),
        showForm: false,
        hasParent: props.hasParent,
        replies: []
    }

    // 创建评论
    await apiCreateComment(newComment)

    // 提交完成后清空表单数据
    form.username = ''
    form.email = ''
    form.website = ''
    form.content = ''
    customAvatarUrl.value = ''
    showCustomAvatarInput.value = false
    avatarRequestId += 1
    avatarLoading.value = false
    avatarResolved.value = false
    previewAvatar.value = '/images/user_default.png'
    // ElMessage提示信息
    ElMessage.success('评论成功！')
    
    // 触发更新评论
    emit('updateComments')

    // 更新网站评论数
    await apiUpdateWebsiteComment()


    // 如果是有父评论，给它父评论的邮箱发送邮件
    if (props.hasParent && props.parentId) {
      // 调用发送邮件的API
      await apiSendEmailNotification(
        props.parentId,
        newComment.username,
        newComment.content,
        newComment.blogId,
        newComment.createTime,
      )
    }

  } catch (error) {
    ElMessage.error(error)
  }
}

// 处理成数组格式
const biliEmojis = Object.keys(biliEmojisFiles).map(path => {
  const fileName = path.split('/').pop().replace('.png', '')
  return {
    name: fileName, 
    path: biliEmojisFiles[path].default || path
  }
})

// 添加 emoji 列表
const emojis = [
  '😀', '😁', '😆', '😅', '🤣', '😊', '🙃', '🫠', '😉', '😇',
  '🥰', '😍', '😘', '😙', '🥲', '😋', '🤪', '😎', '🫢', '🤔',
  '🫡', '🤮', '🤧', '🥵', '🥶', '😮', '🥹', '😭', '😱', '😤',
  '😡', '🤡', '🙄', '😮', '😅', '🙃', '😘', '🥲', '😴', '😭',
  '👍', '👋', '🎉', '❤️', '✨'
]

// 添加颜文字列表
const kaomojis = ['(⌒▽⌒)', '(￣▽￣)', '(。・ω・。)', '(≧∇≦)', '(´・ω・`)', 
                 '(〜￣△￣)〜', '(°▽°)', '(⊙_⊙)', '(╥﹏╥)', '(ㆆᴗㆆ)', 
                 '(๑•̀ㅂ•́)و', '(ノ°ο°)ノ', '(´･_･`)', 'ヾ(≧▽≦*)o', '(*^_^*)']

// 当前选中的表情类型，添加'bili'
const activeEmojiType = ref('emoji') // 'emoji', 'kaomoji', 或 'bili'

// 添加 textarea 的引用
const textareaRef = ref(null)

// 修改插入表情方法，支持图片表情
const insertEmoji = (emoji) => {
  const textarea = textareaRef.value.textarea
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = form.content
  
  // 判断是文本表情还是图片表情
  if (typeof emoji === 'object' && emoji.name) {
    // 对于B站表情，插入 [表情:名称] 格式的标识符
    const emojiCode = `[表情:${emoji.name}]`
    form.content = text.slice(0, start) + emojiCode + text.slice(end)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emojiCode.length, start + emojiCode.length)
    }, 10)
  } else {
    // 普通文本表情
    form.content = text.slice(0, start) + emoji + text.slice(end)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 10)
  }
}

// 切换表情类型
const switchEmojiType = (type) => {
  activeEmojiType.value = type
}

// 计算属性：根据是否有父评论决定占位符文本
const placeholderText = computed(() => {
  return props.hasParent ? `回复 @${props.replyTo || '用户'}...` : '写下你的评论...'
})


// Avatar preview uses the email-derived avatar or the default image.
const previewAvatar = ref('/images/user_default.png')
const avatarLoading = ref(false)
const avatarResolved = ref(false)
const customAvatarUrl = ref('')
const showCustomAvatarInput = ref(false)
const isValidEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
let avatarRequestId = 0
let avatarRequestTimer

const isValidAvatarUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const updateAvatarPreview = async (immediate = false) => {
  const customUrl = customAvatarUrl.value.trim()
  const email = form.email.trim()
  const requestId = ++avatarRequestId
  clearTimeout(avatarRequestTimer)
  if (customUrl) {
    avatarLoading.value = isValidAvatarUrl(customUrl)
    avatarResolved.value = isValidAvatarUrl(customUrl)
    previewAvatar.value = isValidAvatarUrl(customUrl) ? customUrl : '/images/user_default.png'
    return
  }

  if (!isValidEmail.value) {
    previewAvatar.value = '/images/user_default.png'
    avatarLoading.value = false
    avatarResolved.value = false
    return
  }

  avatarLoading.value = true
  avatarResolved.value = false
  const loadAvatar = async () => {
    try {
      const avatar = await getAvatar(email)
      if (requestId === avatarRequestId && form.email.trim() === email) {
        previewAvatar.value = avatar
        avatarResolved.value = true
      }
    } catch {
      if (requestId === avatarRequestId) {
        previewAvatar.value = '/images/user_default.png'
        avatarLoading.value = false
      }
    }
  }

  if (immediate) loadAvatar()
  else avatarRequestTimer = setTimeout(loadAvatar, 250)
}

const finishAvatarLoading = () => {
  if (avatarResolved.value) avatarLoading.value = false
}

const handleAvatarError = () => {
  if (!avatarResolved.value) return
  if (customAvatarUrl.value.trim()) previewAvatar.value = '/images/user_default.png'
  avatarLoading.value = false
}
</script>

<template>
<!-- 评论表单 -->
<el-form :model="form" :rules="rules" ref="formRef" class="comment-form comment-form--reply">

    <div class="comment-editor">
      <div class="comment-form-input-row">
      <!-- 昵称 -->
      <el-form-item prop="username" class="comment-form-username">
        <div class="username-input-wrap">
          <el-input
            v-model="form.username"
            placeholder="昵称"
          />
          <el-popover
            v-if="isValidEmail"
            v-model:visible="showCustomAvatarInput"
            placement="bottom-start"
            :width="280"
            trigger="click"
            popper-class="avatar-customizer avatar-customizer--reply"
          >
            <template #reference>
              <button type="button" class="avatar-trigger" title="设置自定义头像" aria-label="设置自定义头像">
                <img
                  :src="avatarResolved ? previewAvatar : '/images/user_default.png'"
                  alt=""
                  aria-hidden="true"
                  @load="finishAvatarLoading"
                  @error="handleAvatarError"
                />
                <span v-if="avatarLoading" class="avatar-loading-indicator" aria-hidden="true"></span>
              </button>
            </template>
            <el-input
              v-model="customAvatarUrl"
              placeholder="自定义头像 URL"
              clearable
              @input="updateAvatarPreview(true)"
            />
          </el-popover>
        </div>
      </el-form-item>
      <!-- 邮箱 -->
      <el-form-item prop="email">
        <el-input 
          v-model="form.email" 
          placeholder="邮箱"
          @input="updateAvatarPreview()"
          @blur="updateAvatarPreview(true)"
        />
      </el-form-item>
      <!-- 网站 -->
      <el-form-item prop="website">
        <el-input
          v-model="form.website" 
          placeholder="网址"
        />
      </el-form-item>
      </div>

      <el-form-item prop="content" class="comment-editor__content">
        <el-input
          ref="textareaRef"
          v-model="form.content"
          type="textarea"
          :autosize="{ minRows: 3 }"
          :placeholder="placeholderText"
        />
      </el-form-item>
      <div class="submit-container comment-editor__toolbar">
        <!-- 添加表情的弹出框 -->
        <el-popover
          placement="top"
          :width="300"
          trigger="click"
          popper-class="emoji-popover"
        >
          <template #reference>
            <el-button class="emoji-button" type="info" text title="添加表情" aria-label="添加表情">
              <span class="iconfont icon-picture emoji-icon"></span>
            </el-button>
          </template>
          
          
          <!-- 表情容器 -->
          <div class="emoji-container" v-if="activeEmojiType === 'emoji'">
            <span
              v-for="emoji in emojis"
              :key="emoji"
              class="emoji-item"
              @click="insertEmoji(emoji)"
            >
              {{ emoji }}
            </span>
          </div>
          
          <!-- 颜文字容器 -->
          <div class="emoji-container" v-else-if="activeEmojiType === 'kaomoji'">
            <span
              v-for="kaomoji in kaomojis"
              :key="kaomoji"
              class="kaomoji-item"
              @click="insertEmoji(kaomoji)"
            >
              {{ kaomoji }}
            </span>
          </div>
          
          <!-- B站表情容器 -->
          <div class="emoji-container bili-container" v-else>
            <span
              v-for="biliEmoji in biliEmojis"
              :key="biliEmoji.name"
              class="bili-emoji-item"
              @click="insertEmoji(biliEmoji)"
            >
              <img :src="biliEmoji.path" :alt="biliEmoji.name" class="bili-emoji-image">
            </span>
          </div>

          <!-- 表情类型选择器 -->
          <div class="emoji-type-selector">
            <span 
              :class="['emoji-type-item', { active: activeEmojiType === 'emoji' }]" 
              @click="switchEmojiType('emoji')"
            >
              Emoji
            </span>
            <span 
              :class="['emoji-type-item', { active: activeEmojiType === 'kaomoji' }]" 
              @click="switchEmojiType('kaomoji')"
            >
              颜文字
            </span>
            <span 
              :class="['emoji-type-item', { active: activeEmojiType === 'bili' }]" 
              @click="switchEmojiType('bili')"
            >
              B站表情
            </span>
          </div>

        </el-popover>
        
        <!-- 提交按钮 -->
        <el-button @click="onSubmit" class="comment-form-submit">
          提交
        </el-button>
      </div>
    </div>
  </el-form>
</template>

<!-- 这里必须加scoped，因为深度选择器:deep()要求配合scoped用，以改变ElementPlus原始样式 -->
<style lang="scss" scoped>
/* 评论表单 */
.comment-form {
  margin: 10px 0;
  font-family: var(--comment-font, var(--font-sans));

  .comment-form-input-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;

    :deep(.el-form-item) {
      min-width: 0;
      margin-bottom: 10px;
    }

    .comment-form-username {
      min-width: 0;

      .username-input-wrap {
        position: relative;
        width: 100%;
      }

      .avatar-trigger {
        appearance: none;
        position: absolute;
        z-index: 3;
        top: 50%;
        left: 10px;
        width: 22px;
        height: 22px;
        display: grid;
        place-items: center;
        margin: 0;
        padding: 0;
        overflow: hidden;
        border: 0;
        border-radius: 5px;
        background: transparent;
        cursor: pointer;
        transform: translateY(-50%);

        img {
          display: block;
          width: 100%;
          height: 100%;
          max-width: none;
          margin: 0;
          border-radius: 5px;
          object-fit: cover;
          clip-path: inset(0 round 5px);
        }

        &:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }
      }

      .avatar-loading-indicator {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        border: 2px solid rgba(128, 137, 146, 0.35);
        border-top-color: #68727d;
        border-radius: 50%;
        animation: avatar-spinner 700ms linear infinite;
      }

      :deep(.el-input__inner) {
        padding-left: 38px;
      }
    }

    .el-input {
      width: 100%;

      :deep(.el-input__wrapper) {
        min-height: 40px;
        padding: 0 12px;
        background: var(--white);
        border: 1px solid #aeb8c2;
        border-radius: 7px;
        box-shadow: none;
        transition: border-color 160ms ease, background-color 160ms ease;

        &:hover {
          box-shadow: none;
        }

        &.is-focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 14%, transparent);
        }
      }

      :deep(.el-input__inner) {
        width: 100%;
        color: var(--light-dark);
        background: transparent;
        border: 0;
        font: inherit;
        font-size: 0.9rem;
        text-indent: 0;
        outline: 0;

        &::placeholder {
          color: var(--quote-color);
        }
      }
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }

  .avatar-slide-fade-enter-active,
  .avatar-slide-fade-leave-active,
  .avatar-options-slide-fade-enter-active,
  .avatar-options-slide-fade-leave-active {
    transition: opacity 180ms ease, transform 180ms ease;
  }

  .avatar-slide-fade-enter-from,
  .avatar-slide-fade-leave-to {
    opacity: 0;
    transform: translateX(-8px);
  }

  .avatar-options-slide-fade-enter-from,
  .avatar-options-slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }

  .comment-editor {
    overflow: hidden;
    border: 1px solid #aeb8c2;
    border-radius: 10px;
    background: var(--white);
    transition: border-color 160ms ease, box-shadow 160ms ease;

    &:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 14%, transparent);
    }
  }

  .comment-editor__content {
    margin: 0;

    :deep(.el-form-item__content) {
      display: block;
      line-height: normal;
    }

    .el-textarea {
      display: block;

      :deep(.el-textarea__inner) {
        display: block;
        min-height: 88px !important;
        padding: 14px 15px 10px;
        color: var(--light-dark);
        background: transparent;
        border: 0;
        border-radius: 0;
        box-shadow: none;
        font: inherit;
        font-size: 0.94rem;
        line-height: 1.55;
        resize: none;
        outline: 0;

        &::placeholder {
          color: var(--quote-color);
        }
      }
    }
  }

  .submit-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 48px;
    padding: 6px 10px;

    .emoji-button {
      width: 36px;
      height: 36px;
      padding: 0;
      color: var(--quote-color);
      background: transparent;
      border: 0;
      border-radius: 7px;
      box-shadow: none;
      transition: color 150ms ease, background-color 150ms ease;

      &:hover {
        color: var(--dark);
        background: var(--primary-soft);
        transform: none;
      }

      .emoji-icon {
        font-size: 18px;
        line-height: 1;
      }
    }

    .comment-form-submit {
      width: auto;
      min-width: 72px;
      height: 34px;
      padding: 0 14px;
      color: var(--white);
      background: var(--submit-button);
      border: 0;
      border-radius: 999px;
      font: inherit;
      font-size: 0.84rem;
      font-weight: 500;
      letter-spacing: 0;
      text-indent: 0;
      transition: background-color 150ms ease, transform 150ms ease;

      &:hover {
        background: var(--blue);
        transform: none;
      }
    }
  }

  &.comment-form--reply {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;

    .comment-form-input-row {
      gap: 4px;
      padding: 5px 9px;
      background: #3a4047;

      :deep(.el-form-item) {
        margin-bottom: 0;
      }

      :deep(.el-input__wrapper) {
        min-height: 36px;
        padding-inline: 9px;
        background: transparent;
        border: 0;
        border-radius: 0;
        box-shadow: none;
      }

      :deep(.el-input__inner) {
        color: #f0f1f2;
        font-size: 0.84rem;

        &::placeholder {
          color: #b8bdc3;
        }
      }
    }

    .comment-editor {
      border-color: #5a6067;
      border-radius: 10px;
      background: #30363d;

      &:focus-within {
        border-color: #858b91;
        box-shadow: none;
      }
    }

    .comment-editor__content .el-textarea :deep(.el-textarea__inner) {
      min-height: 94px !important;
      color: #f0f1f2;
      background: #30363d;
      border-radius: 7px;

      &::placeholder {
        color: #b8bdc3;
      }
    }

    .submit-container {
      border-top: 0;
      padding-top: 2px;
      background: #30363d;

      .emoji-button {
        color: #c9cdd1;

        &:hover {
          color: #ffffff;
          background: #41474e;
        }
      }

      .comment-form-submit {
        min-width: 68px;
        height: 32px;
        padding: 0 12px;
        color: #f0f1f2;
        background: #515960;
        border-radius: 7px;
        font-size: 0.82rem;
        font-weight: 500;

        &:hover {
          background: #626a72;
        }
      }
    }
  }
}

  /* 添加表情类型选择器样式 */
.emoji-type-selector {
  display: flex;
  border-bottom: 1px solid var(--lightgrey);
  margin-bottom: 8px;
  
  .emoji-type-item {
    flex: 1;
    text-align: center;
    padding: 5px 0;
    cursor: pointer;
    color: var(--quote-color);
    font-size: 14px;
    
    &:hover {
      color: var(--blue);
    }
    
    &.active {
      color: var(--blue);
      border-bottom: 2px solid var(--blue);
    }
  }
}

/* 表情容器样式 */
.emoji-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-height: 200px;
  overflow-y: auto;
  
  .emoji-item, .kaomoji-item {
    cursor: pointer;
    padding: 5px;
    transition: transform 0.2s, background-color 0.2s;
    border-radius: 4px;
    
    &:hover {
      background-color: var(--lightgrey);
    }
  }
  
  .emoji-item {
    font-size: 18px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .kaomoji-item {
    font-size: 13px;
    margin: 5px 2px;
    width: 30%;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* B站表情样式 */
  &.bili-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
  }
  
  .bili-emoji-item {
    cursor: pointer;
    padding: 4px;
    transition: all 0.2s;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background-color: var(--lightgrey);
    }
    
    .bili-emoji-image {
      margin: 0;
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
  }
}

/* 确保emoji弹窗样式正确且有足够空间 */
:deep(.emoji-popover) {
  padding: 12px;
  max-width: 320px;
}

:global(.avatar-customizer) {
  padding: 10px;
  background: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 7px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);

  .el-input__wrapper {
    min-height: 38px;
    background: var(--white);
    border: 1px solid #aeb8c2;
    border-radius: 7px;
    box-shadow: none;
  }

  .el-input__inner {
    color: var(--light-dark);
    font: inherit;
    font-size: 0.9rem;
  }

  &.avatar-customizer--reply {
    background: #30363d;
    border-color: #5a6067;

    .el-input__wrapper {
      background: #252a30;
      border-color: #5a6067;
    }

    .el-input__inner {
      color: #f0f1f2;

      &::placeholder {
        color: #b8bdc3;
      }
    }
  }
}

@keyframes avatar-spinner {
  to {
    transform: rotate(360deg);
  }
}
</style>
