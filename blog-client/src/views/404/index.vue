<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoaded = ref(false)
const stars = ref([])
const meteorShower = ref([])
const glitchText = ref('404')

// 生成随机星星
const generateStars = () => {
  const starCount = 200
  for (let i = 0; i < starCount; i++) {
    stars.value.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2
    })
  }
}

// 生成流星
const generateMeteors = () => {
  setInterval(() => {
    if (meteorShower.value.length < 5) {
      meteorShower.value.push({
        id: Date.now(),
        x: Math.random() * 100,
        y: -10,
        delay: Math.random() * 2
      })
    }
  }, 3000)
}

// 故障文字效果
const glitchEffect = () => {
  const glitchTexts = ['404', '4Ø4', '4■4', '█0█', '4◯4', '▓▓▓']
  let index = 0
  
  setInterval(() => {
    if (Math.random() < 0.1) {
      glitchText.value = glitchTexts[Math.floor(Math.random() * glitchTexts.length)]
      setTimeout(() => {
        glitchText.value = '404'
      }, 100)
    }
  }, 200)
}

// 清理流星
const cleanupMeteors = () => {
  setInterval(() => {
    meteorShower.value = meteorShower.value.filter(meteor => meteor.y < 120)
  }, 1000)
}

onMounted(() => {
  generateStars()
  generateMeteors()
  glitchEffect()
  cleanupMeteors()
  
  setTimeout(() => {
    isLoaded.value = true
  }, 300)
})

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/home')
  }
}
</script>

<template>
  <div class="container" :class="{ 'loaded': isLoaded }">
    <!-- 星空背景 -->
    <div class="starfield">
      <div 
        v-for="star in stars" 
        :key="star.id"
        class="star"
        :style="{
          left: star.x + '%',
          top: star.y + '%',
          width: star.size + 'px',
          height: star.size + 'px',
          animationDelay: star.delay + 's',
          animationDuration: star.duration + 's'
        }"
      ></div>
    </div>

    <!-- 流星雨 -->
    <div class="meteor-shower">
      <div 
        v-for="meteor in meteorShower" 
        :key="meteor.id"
        class="meteor"
        :style="{
          left: meteor.x + '%',
          animationDelay: meteor.delay + 's'
        }"
      ></div>
    </div>

    <!-- 主要内容 -->
    <div class="content">
      <!-- 大号404标题 -->
      <div class="error-code">
        <h1 class="big-404" v-text="glitchText"></h1>
        <div class="code-shadow">404</div>
      </div>

      <!-- 错误信息 -->
      <div class="error-message">
        <h2 class="glitch-title">页面在宇宙中迷失了</h2>
        <p class="subtitle">
          <span class="typing-text">似乎您要寻找的页面已经飘向了遥远的星系...</span>
        </p>
        <div class="cosmic-line"></div>
      </div>

      <!-- 宇航员动画 -->
      <div class="astronaut-container">
        <div class="astronaut">
          <div class="helmet"></div>
          <div class="body"></div>
          <div class="arm left-arm"></div>
          <div class="arm right-arm"></div>
          <div class="leg left-leg"></div>
          <div class="leg right-leg"></div>
        </div>
      </div>

      <!-- 导航按钮 -->
      <div class="navigation">
        <button @click="goBack" class="nav-btn back-btn">
          <span class="btn-icon">🚀</span>
          <span class="btn-text">返回航行</span>
          <div class="btn-ripple"></div>
        </button>
        <RouterLink to="/home" class="nav-btn home-btn">
          <span class="btn-icon">🏠</span>
          <span class="btn-text">回到基地</span>
          <div class="btn-ripple"></div>
        </RouterLink>
        <RouterLink to="/archive" class="nav-btn archive-btn">
          <span class="btn-icon">📚</span>
          <span class="btn-text">探索档案</span>
          <div class="btn-ripple"></div>
        </RouterLink>
      </div>

      <!-- 装饰元素 -->
      <div class="floating-elements">
        <div class="planet planet-1"></div>
        <div class="planet planet-2"></div>
        <div class="planet planet-3"></div>
      </div>
    </div>

    <!-- 扫描线效果 -->
    <div class="scan-lines"></div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.container.loaded {
  opacity: 1;
  transform: scale(1);
}

/* 星空背景 */
.starfield {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle linear infinite;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 流星雨 */
.meteor-shower {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.meteor {
  position: absolute;
  width: 2px;
  height: 2px;
  background: linear-gradient(45deg, #fff, #00f5ff);
  border-radius: 50%;
  animation: meteor 3s linear forwards;
  box-shadow: 0 0 10px #00f5ff, 0 0 20px #00f5ff, 0 0 30px #00f5ff;
}

.meteor::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00f5ff, transparent);
  transform: rotate(45deg);
  transform-origin: 0 0;
}

@keyframes meteor {
  0% {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(300px) translateY(300px);
  }
}

/* 主要内容 */
.content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: #fff;
  max-width: 800px;
  padding: 40px;
}

/* 大号404 */
.error-code {
  position: relative;
  margin-bottom: 40px;
}

.big-404 {
  font-size: clamp(120px, 20vw, 300px);
  font-weight: 900;
  margin: 0;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
  background-size: 400% 400%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 3s ease-in-out infinite, glitchShake 0.3s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
  position: relative;
}

.code-shadow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-size: clamp(120px, 20vw, 300px);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.1);
  z-index: -1;
  transform: translate(8px, 8px);
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes glitchShake {
  0%, 90%, 100% { transform: translate(0); }
  10% { transform: translate(-2px, -1px); }
  20% { transform: translate(2px, 1px); }
  30% { transform: translate(-1px, 2px); }
  40% { transform: translate(1px, -1px); }
  50% { transform: translate(-2px, 1px); }
  60% { transform: translate(2px, -2px); }
  70% { transform: translate(-1px, -1px); }
  80% { transform: translate(1px, 2px); }
}

/* 错误信息 */
.error-message {
  margin-bottom: 60px;
}

.glitch-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
  line-height: 1.6;
}

.typing-text {
  display: inline-block;
  animation: typing 3s steps(40) 1s forwards;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #4ecdc4;
  animation: typing 3s steps(40) 1s forwards, blink 0.8s infinite;
}

@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink {
  0%, 50% { border-color: #4ecdc4; }
  51%, 100% { border-color: transparent; }
}

.cosmic-line {
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4ecdc4, transparent);
  margin: 30px auto;
  animation: cosmicPulse 2s ease-in-out infinite;
}

@keyframes cosmicPulse {
  0%, 100% { opacity: 0.5; transform: scaleX(0.8); }
  50% { opacity: 1; transform: scaleX(1.2); }
}

/* 宇航员动画 */
.astronaut-container {
  position: absolute;
  top: 20%;
  right: 10%;
  animation: float 6s ease-in-out infinite;
}

.astronaut {
  position: relative;
  width: 100px;
  height: 120px;
}

.helmet {
  width: 60px;
  height: 60px;
  background: linear-gradient(145deg, #e8e8e8, #c0c0c0);
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 20px;
  border: 3px solid #333;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.3);
}

.body {
  width: 50px;
  height: 70px;
  background: linear-gradient(145deg, #ddd, #bbb);
  border-radius: 25px;
  position: absolute;
  top: 50px;
  left: 25px;
  border: 2px solid #333;
}

.arm {
  width: 15px;
  height: 40px;
  background: linear-gradient(145deg, #ddd, #bbb);
  border-radius: 10px;
  position: absolute;
  border: 2px solid #333;
}

.left-arm {
  top: 55px;
  left: 5px;
  transform: rotate(-20deg);
  animation: waveLeft 3s ease-in-out infinite;
}

.right-arm {
  top: 55px;
  right: 5px;
  transform: rotate(20deg);
  animation: waveRight 3s ease-in-out infinite 1.5s;
}

.leg {
  width: 12px;
  height: 35px;
  background: linear-gradient(145deg, #ddd, #bbb);
  border-radius: 8px;
  position: absolute;
  border: 2px solid #333;
}

.left-leg {
  bottom: -15px;
  left: 30px;
}

.right-leg {
  bottom: -15px;
  right: 30px;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(5deg); }
  50% { transform: translateY(-10px) rotate(0deg); }
  75% { transform: translateY(-30px) rotate(-5deg); }
}

@keyframes waveLeft {
  0%, 100% { transform: rotate(-20deg); }
  50% { transform: rotate(-60deg); }
}

@keyframes waveRight {
  0%, 100% { transform: rotate(20deg); }
  50% { transform: rotate(60deg); }
}

/* 导航按钮 */
.navigation {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.nav-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 15px 30px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 2px solid rgba(78, 205, 196, 0.5);
  border-radius: 50px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  cursor: pointer;
}

.nav-btn:hover {
  transform: translateY(-5px);
  border-color: #4ecdc4;
  box-shadow: 
    0 10px 30px rgba(78, 205, 196, 0.3),
    0 0 30px rgba(78, 205, 196, 0.2);
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-btn:hover::before {
  left: 100%;
}

.btn-icon {
  font-size: 1.5rem;
  animation: bounce 2s infinite;
}

.btn-text {
  font-weight: 600;
}

.btn-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.nav-btn:active .btn-ripple {
  width: 300px;
  height: 300px;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
  60% { transform: translateY(-3px); }
}

/* 装饰行星 */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.planet {
  position: absolute;
  border-radius: 50%;
  animation: orbit 20s linear infinite;
}

.planet-1 {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  top: 20%;
  left: 80%;
  animation-duration: 25s;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
}

.planet-2 {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #4ecdc4, #45b7d1);
  top: 70%;
  left: 10%;
  animation-duration: 30s;
  animation-direction: reverse;
  box-shadow: 0 0 25px rgba(78, 205, 196, 0.5);
}

.planet-3 {
  width: 25px;
  height: 25px;
  background: linear-gradient(45deg, #96ceb4, #ffeaa7);
  top: 40%;
  left: 5%;
  animation-duration: 35s;
  box-shadow: 0 0 15px rgba(150, 206, 180, 0.5);
}

@keyframes orbit {
  0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
}

/* 扫描线效果 */
.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    transparent 0%,
    rgba(0, 245, 255, 0.03) 50%,
    transparent 100%
  );
  background-size: 100% 4px;
  animation: scanlines 0.1s linear infinite;
  pointer-events: none;
  z-index: 20;
}

@keyframes scanlines {
  0% { background-position: 0 0; }
  100% { background-position: 0 4px; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content {
    padding: 20px;
  }
  
  .navigation {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-btn {
    width: 200px;
    justify-content: center;
  }
  
  .astronaut-container {
    display: none;
  }
  
  .glitch-title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .big-404 {
    font-size: 100px;
  }
  
  .code-shadow {
    font-size: 100px;
  }
  
  .glitch-title {
    font-size: 1.5rem;
  }
}
</style>