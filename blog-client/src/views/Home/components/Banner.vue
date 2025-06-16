<script setup>
import { ref } from 'vue';

const gImg = ref();

// 使用 requestAnimationFrame 优化动画，每一帧只触发一次 transform 更新
function handleMouseMove(event) {
    window.requestAnimationFrame(() => {
        const x = event.clientX;
        const y = event.clientY;
        transformElement(x, y);
    });
}

// transform 更新
function transformElement(x, y) {
  const card = document.querySelector('.card');
  const rect = card.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const rotateX = ((y - centerY) / (rect.height / 2)) * -1; // 控制旋转角度
  const rotateY = ((x - centerX) / (rect.width / 2)) * 1; // 控制旋转角度
  
  // 同时使用水平和垂直方向的值来计算百分比
  const percentage = Math.min(Math.max(rotateX * 7 + rotateY * 5 + 30, 0), 100);
  // 根据鼠标位置计算渐变角度
  const gradientAngle = 115 + rotateY * 15; // 角度范围大约是 100-130 度

  card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  // 同时更新百分比和角度
  gImg.value.style = `--per: ${percentage}%; --angle: ${gradientAngle}deg`;
}

function handleMouseLeave() {
    const card = document.querySelector('.card');
    card.style.transition = "transform 0.2s";
    card.style.transform = 'rotateX(0deg) rotateY(0deg)'; // 重置旋转
    // 过渡结束后恢复无过渡状态
    setTimeout(() => {
        card.style.transition = "none";
    }, 200);
}

function handleMouseEnter() {
    const card = document.querySelector('.card');
    card.style.transition = "transform 0.1s";
    setTimeout(() => {
        card.style.transition = "none";
    }, 200);
}
</script>

<template>
  <div class="contianer">
    <div class="home-banner" 
      @mousemove="handleMouseMove($event)"
      @mouseleave="handleMouseLeave"
      @mouseenter="handleMouseEnter">
      <div class="card">
        <div class="bg-image"></div>
        <div class="card-content">
          <h1 class="title">Frontend Developer</h1>
          <p class="subtitle">Music Lover & Story Reader</p>
        </div>
        <div ref="gImg" class="gradient"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contianer {
    width: 100%;
    height: calc(100vh - 64px);
    background-color: var(--light);

    @media (max-width: 768px) {
        height: 300px;
    }

    .home-banner {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transform-style: preserve-3d;
        perspective: 500px;


        .card {
            height: 90%;
            width: 90%;
            border-radius: 20px;
            background-color: transparent;
            color: #fff;
            font-size: 50px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            
            // 添加背景图片
            .bg-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('../../../assets/images/banner.jpg');
                background-size: cover;
                background-position: center;
                z-index: 1;
            }

            .card-content {
                position: absolute;
                z-index: 10;
                text-align: left;
                width: 100%;
                height: 100%;
                padding: 3rem;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: flex-start;
                
                .title {
                    font-size: 4rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    font-family: 'Montserrat', sans-serif;
                    background: linear-gradient(to right, 
                        #ff7e5f, 
                        #feb47b, 
                        #ffdd94, 
                        #c9ffbf);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -1px;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
                }
                
                .subtitle {
                    font-size: 1.8rem;
                    font-weight: 500;
                    font-family: 'Raleway', sans-serif;
                    background: linear-gradient(to right, 
                        #00c6ff, 
                        #88d3ce,
                        #6dd5ed);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: 2px;
                    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
                }
                
                @media (max-width: 768px) {
                    padding: 1.5rem;
                    
                    .title {
                        font-size: 1.5rem;
                        margin-bottom: 0;
                    }
                    
                    .subtitle {
                        font-size: 1rem;
                    }
                }
            }

            .gradient {
                position: absolute;
                width: 100%;
                height: 100%;
                --per: 30%;
                z-index: 15;

                &::before {
                    content: "";
                    border-radius: 20px;
                    position: absolute;
                    inset: 0;
                    background: 
                        linear-gradient(
                            115deg, 
                            transparent 0%,
                            rgba(40, 58, 75, 0.1) calc(var(--per) - 15%),
                            rgba(0, 0, 0, 0.2) var(--per), 
                            rgba(255, 255, 255, 0.3) calc(var(--per) + 15%),
                            rgba(255, 255, 255, 0.5) calc(var(--per) + 25%),
                            rgba(30, 45, 60, 0.3) calc(var(--per) + 45%),
                            transparent 100%
                        );
                    mix-blend-mode: overlay;
                    pointer-events: none;
                }
            }
        }
    }
}
</style>