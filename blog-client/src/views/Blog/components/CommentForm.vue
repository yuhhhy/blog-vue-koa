<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { apiCreateComment, apiUpdateComment, apiSendEmailNotification } from '@/api/comment.js'
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
  }
})

// 表单收集四个数据：username、email、website、content
const formRef = ref(null)
const form = reactive({
  username: '',
  email: '',
  website: '',
  content: '',
  avatar: '',
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
    let avatarURL = '/src/assets/images/user_default.png'
    const hasCustomAvatar = form.avatar.trim().length > 0

    // 如果用户填写了自定义头像URL，则使用它，否则使用默认头像
    if (hasCustomAvatar) {
      // 验证URL格式
      try {
        new URL(form.avatar) // 如果不是有效的URL会抛出错误
        avatarURL = form.avatar
      } catch (e) {
        ElMessage.error('请输入有效的头像URL')
        return
      }
    } else {
      // 使用默认头像
      avatarURL = '/images/user_default.png'
    }


    // 生成评论
    let newComment = { 
        ...form,
        id: Date.now().toString(36),
        blogId: props.blogId,
        parentId: props.parentId,
        avatar: avatarURL,
        createTime: new Date(),
        showForm: false,
        hasParent: props.hasParent,
        replies: []
    }

    // 创建评论
    await apiCreateComment(newComment)

    // 提交完成后清空表单数据
    let userEmail = form.email
    form.username = ''
    form.email = ''
    form.website = ''
    form.content = ''
    form.avatar = ''
    showAvatarOptions.value = false
    previewAvatar.value = '/images/user_default.png'
    // ElMessage提示信息
    ElMessage.success('评论成功！')
    
    // 触发更新评论
    emit('updateComments')

    // 更新网站评论数
    await apiUpdateWebsiteComment()


    // 如果用户选择了默认头像或没有选择头像，则尝试自动获取头像
    if (!hasCustomAvatar) {
      // 尝试获取Grvatar头像，更新新评论的头像
      const avatarSrc = await getAvatar(userEmail)

      if (avatarSrc) {
        newComment.avatar = avatarSrc
        await apiUpdateComment(newComment)
        // 触发更新评论
        emit('updateComments')
      }
    }


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
  return props.hasParent ? '回复楼主...' : '写下你的评论...'
})


// 头像预览和自定义头像URL输入框
const previewAvatar = ref('/images/user_default.png')
const showAvatarOptions = ref(false)
const hasEmail = computed(() => form.email.trim().length > 0)

const toggleAvatarOptions = () => {
  showAvatarOptions.value = !showAvatarOptions.value
}

watch(hasEmail, (value) => {
  if (!value) {
    showAvatarOptions.value = false
  }
})

// 监听input框的变化，自动更新头像URL
const checkCostumAvatar = async () => {
  if (form.avatar) {
    previewAvatar.value = form.avatar
  } else if (form.email) {
    previewAvatar.value = await getAvatar(form.email)
  } else {
    previewAvatar.value = '/images/user_default.png'
  }
}
</script>

<template>
<!-- 评论表单 -->
<el-form :model="form" :rules="rules" ref="formRef" class="comment-form">

    <div class="comment-form-input-row">
      <!-- 昵称 -->
      <el-form-item prop="username" :class="['comment-form-username', { 'has-avatar': hasEmail }]">
        <el-input
          v-model="form.username"
          placeholder="昵称*"
        />
        <transition name="avatar-slide-fade">
          <img
            v-if="hasEmail"
            :src="previewAvatar"
            alt=""
            class="input-icon"
            role="button"
            tabindex="0"
            @click="toggleAvatarOptions"
            @keydown.enter="toggleAvatarOptions"
            @keydown.space.prevent="toggleAvatarOptions"
          />
        </transition>
      </el-form-item>
      <!-- 邮箱 -->
      <el-form-item prop="email">
        <el-input 
          v-model="form.email" 
          placeholder="电子邮箱*" 
          @blur="checkCostumAvatar"
        />
      </el-form-item>
      <!-- 网站 -->
      <el-form-item prop="website">
        <el-input
          v-model="form.website" 
          placeholder="网站 http(s)://" 
        />
      </el-form-item>
      <!-- 自定义头像URL输入框 -->
      <transition name="avatar-options-slide-fade">
        <el-form-item v-if="hasEmail && showAvatarOptions">
          <el-input
            v-model="form.avatar"
            placeholder="自定义头像URL"
            @blur="checkCostumAvatar"
          />
        </el-form-item>
      </transition>

    </div>

    <!-- 评论内容区域 - 修改这里的placeholder -->
    <el-form-item prop="content">
      <el-input
        ref="textareaRef"
        v-model="form.content"
        type="textarea"
        :autosize="{ minRows: 2 }"
        :placeholder="placeholderText"
      />
    </el-form-item>
    <!-- 表情和提交 -->
    <el-form-item>
      <div class="submit-container">
        <!-- 添加表情的弹出框 -->
        <el-popover
          placement="top"
          :width="300"
          trigger="click"
          popper-class="emoji-popover"
        >
          <template #reference>
            <el-button class="emoji-button" type="info" text>
              <span class="emoji-icon">😊</span>
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
    </el-form-item>
  </el-form>
</template>

<!-- 这里必须加scoped，因为深度选择器:deep()要求配合scoped用，以改变ElementPlus原始样式 -->
<style lang="scss" scoped>
/* 评论表单样式 */
  .comment-form {
    margin-top: 10px;
    margin-bottom: 10px;
    font-family: var(--font-serif);

    /* 表单输入框样式 */
    .comment-form-input-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      column-gap: 15px;
      
      @media (max-width: 1098px) {
        grid-template-columns: 1fr;
      }

      .comment-form-username {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;

        .input-icon {
          position: absolute;
          left: 10px;
          width: 20px;
          height: 20px;
          clip-path: circle(50%);
          overflow: hidden;
          object-fit: contain;
          cursor: pointer;
        }

        &.has-avatar :deep(.el-input__inner) {
          padding-left: 26px; /* 留出空间给头像图标 */
        }
      }

      .el-input {
        all: unset;
        width: 100%;
        height: 32px;
        position: relative;
        :deep(.el-input__wrapper) {
          all: unset;
        }
        :deep(.el-input__inner) {
          color: var(--light-dark);
          background-color: var(--white);
          font-family: var(--font-serif);
          min-height: 32px;
          width: 100%;
          height: 100%;
          border: 2px solid var(--lightgrey); 
          border-radius: 4px;
          text-indent: 0.7em;
          transition: all 0.3s ease;
          font-size: 15px;

          &:focus {
            border: 2px solid transparent;
            background: linear-gradient(var(--white), var(--white)) padding-box, 
                        linear-gradient(135deg, #ff33b4, #c8ff00, #00ffff, #4400ff) border-box;
            }
        }
      }
    }

    .avatar-slide-fade-enter-active,
    .avatar-slide-fade-leave-active {
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .avatar-slide-fade-enter-from,
    .avatar-slide-fade-leave-to {
      opacity: 0;
      transform: translateX(-10px);
    }

    .avatar-slide-fade-enter-to,
    .avatar-slide-fade-leave-from {
      opacity: 1;
      transform: translateX(0);
    }

    .avatar-options-slide-fade-enter-active,
    .avatar-options-slide-fade-leave-active {
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .avatar-options-slide-fade-enter-from,
    .avatar-options-slide-fade-leave-to {
      opacity: 0;
      transform: translateY(-10px);
    }

    .avatar-options-slide-fade-enter-to,
    .avatar-options-slide-fade-leave-from {
      opacity: 1;
      transform: translateY(0);
    }

    /* 评论输入框样式 */
    .el-textarea {
      
      :deep(.el-textarea__inner) {
        color: var(--light-dark);
        background-color: var(--white);
        font-family: var(--font-serif);
        box-shadow:none;  // el-textarea的边框是box-shadow
        border: 2px solid var(--lightgrey);
        font-size: 15px;
        resize: none;  // 禁用手动调整大小

        &:focus {
          border: 2px solid transparent;
          background: linear-gradient(var(--white), var(--white)) padding-box, 
          linear-gradient(135deg, #5bc9f8, #c7e9fb, #00c9a7, #a6defa, #35bef7);
        }
      }
      &::placeholder {
          color: var(--quote-color);
      }
    }

    /* 提交按钮容器样式 */
    .submit-container {
      height: 28px;
      display: flex;
      justify-content: space-between;
      width: 100%;

      /* emoji表情选择按钮 */
      .emoji-button {
        height: 28px;
        border-radius: 4px;
        background-color: var(--icon-background);

        .emoji-icon {
          padding-bottom: 2px;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
        }
        
        &:hover {
          background-color: var(--lightgrey);
        }
      }

      /* 提交按钮样式 */
      .comment-form-submit {
        width: 80px;
        height: 28px;
        background: var(--submit-button);
        border: none;
        color: var(--white);
        font-weight: 600;
        letter-spacing: 8px;
        text-indent: 8px;

        &:hover {
        background: var(--blue);  // 悬浮时颜色变化
        transform: translateY(-1px);  // 轻微上浮效果
      }

        &:focus {
          animation: pulse 0.5s;
        }
      }
    }

    /* 提交按钮动画 */
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
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
</style>
