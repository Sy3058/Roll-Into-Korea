<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startGame = () => {
  // 주사위 클릭 시 게임 화면으로 이동
  router.push('/game')
}
</script>

<template>
  <div class="home-container">
    <div class="bg-layer">
      <img src="../assets/images/start.png" alt="Background" class="bg-image" />
    </div>

    <div class="content-layer">
      <div class="scene">
        <div class="cube" @click="startGame">
          <div class="face front">1</div>
          <div class="face back">6</div>
          <div class="face right">3</div>
          <div class="face left">4</div>
          <div class="face top">5</div>
          <div class="face bottom">2</div>
        </div>
      </div>

      <p class="instruction">🎲 주사위를 눌러서 여행을 떠나보세요!</p>
    </div>

    <div class="footer">Team Project • Roll Into Korea 2025</div>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.9);
}

/* --- 컨텐츠 --- */
.content-layer {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5vh;
  margin-bottom: 12%;
}

.instruction {
  color: var(--palette-white);
  font-size: 3.5vh;
  font-weight: bold;
  text-shadow: 0 0.2vh 0.4vh rgba(0, 0, 0, 0.5);
  background-color: rgba(0, 0, 0, 0.3);
  padding: 1vh 3vh;
  border-radius: 3vh;
  margin-top: 2vh;
  backdrop-filter: blur(2px);
}

/* --- 3D 주사위 CSS --- */
.scene {
  width: 15vh;
  height: 15vh;
  perspective: 60vh;
}

.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: translateZ(-10vh);
  /* 둥둥 떠다니며 회전하는 애니메이션 */
  animation: float-spin 8s infinite linear;
  cursor: pointer;
  transition: transform 0.3s;
}

/* 마우스를 올리면 회전이 빨라지고 커짐 */
.cube:hover {
  animation-duration: 3s;
  transform: scale(1.1);
}

.face {
  position: absolute;
  width: 15vh;
  height: 15vh;
  background: var(--palette-white);
  border: 0.5vh solid var(--palette-gray-900);
  border-radius: 2vh;
  color: var(--palette-gray-900);
  font-size: 6vh;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 2vh rgba(0, 0, 0, 0.1);
}

/* 각 면의 위치를 3D로 잡기 */
.front {
  transform: rotateY(0deg) translateZ(7.5vh);
}
.right {
  transform: rotateY(90deg) translateZ(7.5vh);
}
.back {
  transform: rotateY(180deg) translateZ(7.5vh);
}
.left {
  transform: rotateY(-90deg) translateZ(7.5vh);
}
.top {
  transform: rotateX(90deg) translateZ(7.5vh);
}
.bottom {
  transform: rotateX(-90deg) translateZ(7.5vh);
}

/* --- 애니메이션 정의 --- */
@keyframes float-spin {
  0% {
    transform: rotateX(0) rotateY(0) rotateZ(0);
  }
  100% {
    transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
  }
}

/* --- 하단 버튼 --- */
.btn-journey {
  margin-top: 4vh;
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--palette-gray-900);
  border: none;
  font-weight: bold;
  padding: 1vh 2vh;
  border-radius: 3vh;
  cursor: pointer;
  box-shadow: 0 0.4vh 0.6vh rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.btn-journey:hover {
  transform: scale(1.05);
  background-color: var(--palette-white);
}

.footer {
  position: absolute;
  bottom: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  z-index: 10;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
</style>
